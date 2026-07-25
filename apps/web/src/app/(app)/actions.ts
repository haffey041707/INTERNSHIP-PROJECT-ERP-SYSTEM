'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { hashPassword, verifyPassword } from '@/lib/hash';
import { ensureStudentSections } from '@/lib/academic-structure';
import { getInstitutionSuiteForType } from '@/lib/institution-suites';
import { getInstitutionTerminology } from '@/lib/institution-terminology';
import { persistWorkspaceByInstitutionId, restorePersistedAuth } from '@/lib/persistent-auth';

/** All actions are scoped to the logged-in institution (tenant). */
async function tenant() {
  const s = getSession();
  if (!s) throw new Error('UNAUTHENTICATED');
  await restorePersistedAuth();
  return s.institutionId;
}

// ── Students ────────────────────────────────────────────────
export async function createStudent(formData: FormData) {
  const institutionId = await tenant();
  const sections = await ensureStudentSections(institutionId);
  const requestedSectionId = String(formData.get('sectionId') || '').trim();
  const sectionId = sections.some((section) => section.id === requestedSectionId)
    ? requestedSectionId
    : sections[0]?.id ?? null;

  await db.student.create({
    data: {
      institutionId,
      admissionNo: String(formData.get('admissionNo') || `ADM-${Date.now().toString().slice(-6)}`),
      firstName: String(formData.get('firstName')),
      lastName: String(formData.get('lastName')),
      gender: String(formData.get('gender') || '') || null,
      sectionId,
      guardianName: String(formData.get('guardianName') || '') || null,
      guardianPhone: String(formData.get('guardianPhone') || '') || null,
    },
  });
  revalidatePath('/students');
  revalidatePath('/dashboard');
}

export async function updateStudent(formData: FormData) {
  const institutionId = await tenant();
  const id = String(formData.get('id'));
  const sections = await ensureStudentSections(institutionId);
  const requestedSectionId = String(formData.get('sectionId') || '').trim();
  const sectionId = sections.some((section) => section.id === requestedSectionId)
    ? requestedSectionId
    : sections[0]?.id ?? null;

  await db.student.updateMany({
    where: { id, institutionId },
    data: {
      firstName: String(formData.get('firstName')),
      lastName: String(formData.get('lastName')),
      gender: String(formData.get('gender') || '') || null,
      status: String(formData.get('status') || 'ACTIVE'),
      sectionId,
      guardianName: String(formData.get('guardianName') || '') || null,
      guardianPhone: String(formData.get('guardianPhone') || '') || null,
    },
  });
  revalidatePath('/students');
  revalidatePath(`/students/${id}`);
}

export async function deleteStudent(formData: FormData) {
  const institutionId = await tenant();
  const id = String(formData.get('id'));
  await db.$transaction([
    db.mark.deleteMany({ where: { studentId: id, institutionId } }),
    db.attendanceRecord.deleteMany({ where: { studentId: id, institutionId } }),
    db.payment.deleteMany({ where: { institutionId, invoice: { studentId: id } } }),
    db.feeInvoice.deleteMany({ where: { studentId: id, institutionId } }),
    db.student.deleteMany({ where: { id, institutionId } }),
  ]);
  revalidatePath('/students');
  revalidatePath('/dashboard');
  revalidatePath('/exams');
  revalidatePath('/fees');
  revalidatePath('/reports');
}

// ── Teachers ────────────────────────────────────────────────
export async function createTeacher(formData: FormData) {
  const institutionId = await tenant();
  await db.teacher.create({
    data: {
      institutionId,
      name: String(formData.get('name')),
      email: String(formData.get('email')),
      subject: String(formData.get('subject')),
      phone: String(formData.get('phone') || '') || null,
      qualification: String(formData.get('qualification') || '') || null,
    },
  });
  revalidatePath('/teachers');
  revalidatePath('/dashboard');
}

// ── Classes & sections ─────────────────────────────────────
export async function createClassWithSection(formData: FormData) {
  const institutionId = await tenant();
  const name = String(formData.get('name') || '').trim();
  const grade = String(formData.get('grade') || name).trim();
  const sectionName = String(formData.get('sectionName') || 'A').trim();
  const capacity = Math.max(1, Number(formData.get('capacity') || 40));

  if (!name) return;

  const klass = await db.schoolClass.create({
    data: {
      institutionId,
      name,
      grade: grade || name,
    },
  });

  await db.section.create({
    data: {
      institutionId,
      classId: klass.id,
      name: sectionName || 'A',
      capacity,
    },
  });

  await persistWorkspaceByInstitutionId(institutionId);
  revalidatePath('/classes');
  revalidatePath('/dashboard');
}

export async function createSection(formData: FormData) {
  const institutionId = await tenant();
  const classId = String(formData.get('classId') || '');
  const name = String(formData.get('name') || '').trim();
  const capacity = Math.max(1, Number(formData.get('capacity') || 40));

  if (!classId || !name) return;

  const klass = await db.schoolClass.findFirst({ where: { id: classId, institutionId }, select: { id: true } });
  if (!klass) return;

  await db.section.create({
    data: {
      institutionId,
      classId,
      name,
      capacity,
    },
  });

  await persistWorkspaceByInstitutionId(institutionId);
  revalidatePath('/classes');
  revalidatePath(`/classes/${classId}`);
  revalidatePath('/dashboard');
}

// ── Attendance ──────────────────────────────────────────────
export async function markAttendance(formData: FormData) {
  const institutionId = await tenant();
  const date = String(formData.get('date'));
  const sectionId = String(formData.get('sectionId'));
  const students = await db.student.findMany({ where: { institutionId, sectionId }, select: { id: true } });

  for (const s of students) {
    const status = String(formData.get(`status_${s.id}`) || 'PRESENT');
    await db.attendanceRecord.upsert({
      where: { studentId_date: { studentId: s.id, date } },
      update: { status },
      create: { institutionId, studentId: s.id, date, status },
    });
  }
  revalidatePath('/attendance');
  revalidatePath('/dashboard');
}

// ── Exams ───────────────────────────────────────────────────
export async function createExam(formData: FormData) {
  const institutionId = await tenant();
  const exam = await db.exam.create({
    data: {
      institutionId,
      name: String(formData.get('name')),
      subject: String(formData.get('subject')),
      sectionId: String(formData.get('sectionId')),
      maxMarks: Number(formData.get('maxMarks') || 100),
      date: String(formData.get('date') || new Date().toISOString().slice(0, 10)),
    },
  });
  revalidatePath('/exams');
  return exam.id;
}

export async function saveMarks(formData: FormData) {
  const institutionId = await tenant();
  const examId = String(formData.get('examId'));
  const exam = await db.exam.findFirst({ where: { id: examId, institutionId } });
  if (!exam) return;
  const students = await db.student.findMany({ where: { institutionId, sectionId: exam.sectionId }, select: { id: true } });

  for (const s of students) {
    const raw = formData.get(`score_${s.id}`);
    if (raw === null || raw === '') continue;
    const score = Math.max(0, Math.min(exam.maxMarks, Number(raw)));
    await db.mark.upsert({
      where: { examId_studentId: { examId, studentId: s.id } },
      update: { score },
      create: { institutionId, examId, studentId: s.id, score },
    });
  }
  revalidatePath(`/exams/${examId}`);
}

// ── Module workspaces ───────────────────────────────────────
function modulePath(module: string, feature: string) {
  return `/modules/${module}/${feature}`;
}

export async function createModuleRecord(formData: FormData) {
  const institutionId = await tenant();
  const module = String(formData.get('module') || '').trim();
  const feature = String(formData.get('feature') || '').trim();
  const title = String(formData.get('title') || '').trim();
  if (!module || !feature || !title) return;
  const details = String(formData.get('details') || '').trim();
  const extraDetails = Array.from(formData.entries())
    .filter(([key, value]) => key.startsWith('meta_') && String(value || '').trim())
    .map(([key, value]) => {
      const label = key
        .replace(/^meta_/, '')
        .split('_')
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
      return `${label}: ${String(value).trim()}`;
    });

  await db.moduleRecord.create({
    data: {
      institutionId,
      module,
      feature,
      title,
      requester: String(formData.get('requester') || '').trim() || null,
      owner: String(formData.get('owner') || '').trim() || null,
      priority: String(formData.get('priority') || 'NORMAL'),
      dueDate: String(formData.get('dueDate') || '').trim() || null,
      details: [details, ...extraDetails].filter(Boolean).join('\n\n') || null,
    },
  });

  await persistWorkspaceByInstitutionId(institutionId);
  revalidatePath(modulePath(module, feature));
  revalidatePath(`/${module}`);
  revalidatePath('/dashboard');
}

export async function updateModuleRecordStatus(formData: FormData) {
  const institutionId = await tenant();
  const id = String(formData.get('id') || '');
  const module = String(formData.get('module') || '').trim();
  const feature = String(formData.get('feature') || '').trim();
  const status = String(formData.get('status') || 'DRAFT');
  if (!id || !module || !feature) return;

  await db.moduleRecord.updateMany({
    where: { id, institutionId },
    data: { status },
  });

  await persistWorkspaceByInstitutionId(institutionId);
  revalidatePath(modulePath(module, feature));
  revalidatePath(`/${module}`);
}

export async function deleteModuleRecord(formData: FormData) {
  const institutionId = await tenant();
  const id = String(formData.get('id') || '');
  const module = String(formData.get('module') || '').trim();
  const feature = String(formData.get('feature') || '').trim();
  if (!id || !module || !feature) return;

  await db.moduleRecord.deleteMany({ where: { id, institutionId } });

  await persistWorkspaceByInstitutionId(institutionId);
  revalidatePath(modulePath(module, feature));
  revalidatePath(`/${module}`);
}

// ── Data management ─────────────────────────────────────────
const FIRST = ['Aisha', 'Omar', 'Mei', 'Ali', 'Sara', 'Yusuf', 'Lena', 'Noah', 'Zara', 'Ethan', 'Hana', 'Liam', 'Fatima', 'Ivan', 'Priya', 'Diego', 'Nora', 'Kofi', 'Sana', 'Max'];
const LAST = ['Khan', 'Lopez', 'Chen', 'Raza', 'Ahmed', 'Smith', 'Patel', 'Ali', 'Kim', 'Garcia', 'Hassan', 'Nguyen', 'Brown', 'Silva', 'Okafor'];
const SUBJECTS = ['Mathematics', 'Physics', 'English', 'Biology', 'History', 'Computer Science', 'Chemistry'];
const pick = (a: string[], i: number) => a[((i % a.length) + a.length) % a.length];
const SAMPLE_STRUCTURES = {
  SCHOOL: [
    { name: 'Grade 9', grade: '9', sections: ['9-A', '9-B'] },
    { name: 'Grade 10', grade: '10', sections: ['10-A', '10-B'] },
    { name: 'Grade 11', grade: '11', sections: ['11-A', '11-B'] },
  ],
  COLLEGE: [
    { name: 'Computer Science', grade: 'CS', sections: ['Semester 1 · Section A', 'Semester 1 · Section B'] },
    { name: 'Business Management', grade: 'BM', sections: ['Semester 1 · Section A', 'Semester 2 · Section A'] },
    { name: 'Applied Sciences', grade: 'AS', sections: ['Semester 1 · Section A', 'Semester 1 · Section B'] },
  ],
  UNIVERSITY: [
    { name: 'BSc Computer Science', grade: 'BSC-CS', sections: ['Semester 1 · Cohort A', 'Semester 1 · Cohort B'] },
    { name: 'Faculty of Business', grade: 'BUS', sections: ['Year 1 · Cohort A', 'Year 2 · Cohort A'] },
    { name: 'Faculty of Engineering', grade: 'ENG', sections: ['Foundation · Cohort A', 'Degree · Cohort A'] },
  ],
  INSTITUTE: [
    { name: 'Web Development Bootcamp', grade: 'WEB', sections: ['Morning Batch', 'Weekend Batch'] },
    { name: 'Digital Marketing', grade: 'DM', sections: ['Batch A', 'Batch B'] },
    { name: 'Spoken English', grade: 'ENG', sections: ['Foundation Batch', 'Advanced Batch'] },
  ],
};

/** Wipe all records for this institution (keeps the account + users). */
export async function clearInstitutionData() {
  const institutionId = await tenant();
  await db.mark.deleteMany({ where: { institutionId } });
  await db.exam.deleteMany({ where: { institutionId } });
  await db.payment.deleteMany({ where: { institutionId } });
  await db.feeInvoice.deleteMany({ where: { institutionId } });
  await db.attendanceRecord.deleteMany({ where: { institutionId } });
  await db.timetableSlot.deleteMany({ where: { institutionId } });
  await db.announcement.deleteMany({ where: { institutionId } });
  await db.moduleRecord.deleteMany({ where: { institutionId } });
  await db.student.deleteMany({ where: { institutionId } });
  await db.section.deleteMany({ where: { institutionId } });
  await db.schoolClass.deleteMany({ where: { institutionId } });
  await db.teacher.deleteMany({ where: { institutionId } });
  revalidatePath('/', 'layout');
}

/** Populate this institution with a realistic dataset (replaces existing records). */
export async function loadSampleData() {
  const institutionId = await tenant();
  const institution = await db.institution.findUnique({ where: { id: institutionId }, select: { type: true } });
  const terms = getInstitutionTerminology(institution?.type);
  const structures = SAMPLE_STRUCTURES[terms.type];
  const emailDomain = terms.type === 'UNIVERSITY'
    ? 'university.edu'
    : terms.type === 'COLLEGE'
      ? 'college.edu'
      : terms.type === 'INSTITUTE'
        ? 'institute.edu'
        : 'school.edu';
  const feeTitle = terms.type === 'INSTITUTE'
    ? 'Course fee - Installment 1'
    : terms.type === 'UNIVERSITY'
      ? 'Semester fee - Term 1'
      : terms.type === 'COLLEGE'
        ? 'Program fee - Term 1'
        : 'Tuition - Term 1';
  const examName = terms.type === 'INSTITUTE' ? 'Module Test' : terms.type === 'SCHOOL' ? 'Mid-Term' : 'Internal Assessment';

  await clearInstitutionData();
  const dayStr = (off: number) => { const d = new Date(); d.setDate(d.getDate() - off); return d.toISOString().slice(0, 10); };

  for (let i = 0; i < 8; i++) {
    await db.teacher.create({ data: { institutionId, name: `${pick(FIRST, i + 3)} ${pick(LAST, i)}`, email: `${terms.educator.toLowerCase().replace(/\s+/g, '')}${i + 1}@${emailDomain}`, subject: pick(SUBJECTS, i), phone: `+1-555-01${10 + i}`, qualification: terms.type === 'INSTITUTE' ? 'Certified Trainer' : i % 2 ? 'M.Ed' : 'M.Sc' } });
  }

  let adm = 100;
  for (const structure of structures) {
    const klass = await db.schoolClass.create({ data: { institutionId, name: structure.name, grade: structure.grade } });
    for (const sec of structure.sections) {
      const section = await db.section.create({ data: { institutionId, classId: klass.id, name: sec, capacity: 40 } });
      const roster: string[] = [];
      const n = 10 + Math.floor(Math.random() * 5);
      for (let s = 0; s < n; s++) {
        adm++;
        const student = await db.student.create({ data: { institutionId, admissionNo: `${terms.type === 'INSTITUTE' ? 'LRN' : terms.type === 'UNIVERSITY' ? 'SID' : terms.type === 'COLLEGE' ? 'ROLL' : 'ADM'}-${adm}`, firstName: pick(FIRST, adm + s), lastName: pick(LAST, adm), gender: s % 2 ? 'M' : 'F', sectionId: section.id, guardianName: `${pick(LAST, adm)} family`, guardianPhone: `+1-555-${2000 + adm}` } });
        roster.push(student.id);
        for (let d = 0; d < 7; d++) { const r = Math.random(); await db.attendanceRecord.create({ data: { institutionId, studentId: student.id, date: dayStr(d), status: r < 0.88 ? 'PRESENT' : r < 0.95 ? 'ABSENT' : 'LATE' } }); }
        const paid = Math.random() < 0.7;
        const inv = await db.feeInvoice.create({ data: { institutionId, studentId: student.id, title: feeTitle, amountCents: 25000, paidCents: paid ? 25000 : 0, status: paid ? 'PAID' : 'PENDING', dueDate: '2026-08-01' } });
        if (paid) await db.payment.create({ data: { institutionId, invoiceId: inv.id, amountCents: 25000, method: 'ONLINE' } });
      }
      const exam = await db.exam.create({ data: { institutionId, name: examName, subject: 'Mathematics', sectionId: section.id, maxMarks: 100, date: dayStr(14) } });
      for (const sid of roster) await db.mark.create({ data: { institutionId, examId: exam.id, studentId: sid, score: 45 + Math.floor(Math.random() * 55) } });
      for (const [pi, subj] of ['Mathematics', 'English', 'Physics', 'History'].entries()) {
        await db.timetableSlot.create({ data: { institutionId, sectionId: section.id, day: 'MON', period: pi + 1, subject: subj, teacherName: `${pick(FIRST, pi)} ${pick(LAST, pi + 2)}`, startTime: `0${8 + pi}:00`, endTime: `0${8 + pi}:45` } });
      }
    }
  }
  await db.announcement.createMany({ data: [
    { institutionId, title: terms.type === 'SCHOOL' ? 'Term 1 begins Monday' : 'New academic cycle begins Monday', body: `${terms.groups} and ${terms.sections.toLowerCase()} resume on Monday at 8:00 AM.`, audience: 'ALL' },
    { institutionId, title: `${terms.educator} coordination meeting`, body: 'Scheduled for the last Friday of the month.', audience: 'ALL' },
  ] });
  await persistWorkspaceByInstitutionId(institutionId);
  revalidatePath('/', 'layout');
}

// ── Settings ────────────────────────────────────────────────
export async function updateInstitution(formData: FormData) {
  const institutionId = await tenant();
  const name = String(formData.get('name') || '').trim();
  const rawType = String(formData.get('type') || 'SCHOOL').toUpperCase();
  const type = ['SCHOOL', 'COLLEGE', 'UNIVERSITY', 'INSTITUTE'].includes(rawType) ? rawType : 'SCHOOL';
  const updated = await db.institution.update({
    where: { id: institutionId },
    data: {
      name: name || undefined,
      type,
      currency: String(formData.get('currency') || 'USD'),
    },
  });
  await persistWorkspaceByInstitutionId(institutionId);
  revalidatePath('/settings');
  revalidatePath('/dashboard');
  revalidatePath('/', 'layout');
  redirect(getInstitutionSuiteForType(updated.type).href);
}

export async function changePassword(_prev: unknown, formData: FormData) {
  const s = getSession();
  if (!s) return { error: 'Not signed in.' };
  const current = String(formData.get('current') ?? '');
  const next = String(formData.get('next') ?? '');
  const confirm = String(formData.get('confirm') ?? '');
  if (next.length < 6) return { error: 'New password must be at least 6 characters.' };
  if (next !== confirm) return { error: 'New passwords do not match.' };

  const user = await db.user.findUnique({ where: { id: s.userId } });
  if (!user) return { error: 'Account not found.' };
  if (user.passwordHash && !verifyPassword(current, user.passwordHash)) {
    return { error: 'Current password is incorrect.' };
  }
  await db.user.update({ where: { id: user.id }, data: { passwordHash: hashPassword(next), provider: 'password' } });
  await persistWorkspaceByInstitutionId(user.institutionId);
  return { ok: true, message: 'Password updated.' };
}

// ── Timetable ───────────────────────────────────────────────
export async function saveTimetableSlot(formData: FormData) {
  const institutionId = await tenant();
  const sectionId = String(formData.get('sectionId'));
  const day = String(formData.get('day'));
  const period = Number(formData.get('period'));
  await db.timetableSlot.upsert({
    where: { sectionId_day_period: { sectionId, day, period } },
    update: {
      subject: String(formData.get('subject')),
      teacherName: String(formData.get('teacherName') || '') || null,
      startTime: String(formData.get('startTime') || ''),
      endTime: String(formData.get('endTime') || ''),
    },
    create: {
      institutionId, sectionId, day, period,
      subject: String(formData.get('subject')),
      teacherName: String(formData.get('teacherName') || '') || null,
      startTime: String(formData.get('startTime') || ''),
      endTime: String(formData.get('endTime') || ''),
    },
  });
  revalidatePath('/timetable');
}

export async function deleteTimetableSlot(formData: FormData) {
  const institutionId = await tenant();
  await db.timetableSlot.deleteMany({ where: { id: String(formData.get('id')), institutionId } });
  revalidatePath('/timetable');
}

// ── Announcements ───────────────────────────────────────────
export async function createAnnouncement(formData: FormData) {
  const institutionId = await tenant();
  const s = getSession();
  await db.announcement.create({
    data: {
      institutionId,
      title: String(formData.get('title')),
      body: String(formData.get('body')),
      audience: String(formData.get('audience') || 'ALL'),
      authorName: s?.name ?? null,
    },
  });
  revalidatePath('/announcements');
  revalidatePath('/dashboard');
}

export async function deleteAnnouncement(formData: FormData) {
  const institutionId = await tenant();
  await db.announcement.deleteMany({ where: { id: String(formData.get('id')), institutionId } });
  revalidatePath('/announcements');
}

// ── Fees ────────────────────────────────────────────────────
export async function collectPayment(formData: FormData) {
  const institutionId = await tenant();
  const invoiceId = String(formData.get('invoiceId'));
  const method = String(formData.get('method') || 'CASH');
  const invoice = await db.feeInvoice.findFirst({ where: { id: invoiceId, institutionId } });
  if (!invoice) return;
  const due = invoice.amountCents - invoice.paidCents;
  if (due <= 0) return;

  await db.payment.create({ data: { institutionId, invoiceId, amountCents: due, method } });
  await db.feeInvoice.update({
    where: { id: invoiceId },
    data: { paidCents: invoice.amountCents, status: 'PAID' },
  });
  revalidatePath('/fees');
  revalidatePath('/dashboard');
}
