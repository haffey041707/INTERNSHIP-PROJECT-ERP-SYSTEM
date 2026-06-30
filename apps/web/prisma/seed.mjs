// Seeds the working SQLite database with TWO institutions (to prove tenant isolation),
// each with classes, sections, teachers, students, 7 days of attendance, fee invoices,
// and exams with marks. Run: node prisma/seed.mjs   (from apps/web)
import { PrismaClient } from '@prisma/client';
import { scryptSync, randomBytes } from 'crypto';

const db = new PrismaClient();

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

const FIRST = ['Aisha', 'Omar', 'Mei', 'Ali', 'Sara', 'Yusuf', 'Lena', 'Noah', 'Zara', 'Ethan', 'Hana', 'Liam', 'Fatima', 'Ivan', 'Priya', 'Diego', 'Nora', 'Kofi', 'Sana', 'Max'];
const LAST = ['Khan', 'Lopez', 'Chen', 'Raza', 'Ahmed', 'Smith', 'Patel', 'Ali', 'Kim', 'Garcia', 'Hassan', 'Nguyen', 'Brown', 'Silva', 'Okafor'];
const SUBJECTS = ['Mathematics', 'Physics', 'English', 'Biology', 'History', 'Computer Science', 'Chemistry'];
const pick = (a, i) => a[i % a.length];
const dayStr = (offset) => { const d = new Date(); d.setDate(d.getDate() - offset); return d.toISOString().slice(0, 10); };

async function wipe() {
  await db.mark.deleteMany();
  await db.exam.deleteMany();
  await db.payment.deleteMany();
  await db.feeInvoice.deleteMany();
  await db.attendanceRecord.deleteMany();
  await db.student.deleteMany();
  await db.section.deleteMany();
  await db.schoolClass.deleteMany();
  await db.teacher.deleteMany();
  await db.user.deleteMany();
  await db.institution.deleteMany();
}

async function seedInstitution({ code, name, color, grades, adminEmail, seedBase }) {
  const inst = await db.institution.create({
    data: { code, name, type: 'SCHOOL', currency: 'USD', primaryColor: color },
  });
  await db.user.create({
    data: { institutionId: inst.id, email: adminEmail, name: 'Demo Admin', role: 'INSTITUTION_ADMIN', passwordHash: hashPassword('admin123') },
  });

  for (let i = 0; i < 6; i++) {
    await db.teacher.create({
      data: { institutionId: inst.id, name: `${pick(FIRST, i + seedBase + 3)} ${pick(LAST, i + seedBase)}`,
        email: `teacher${i + 1}@${code.toLowerCase()}.edu`, subject: pick(SUBJECTS, i), phone: `+1-555-01${10 + i}`, qualification: i % 2 ? 'M.Ed' : 'B.Sc' },
    });
  }

  let admission = seedBase;
  for (const grade of grades) {
    const klass = await db.schoolClass.create({ data: { institutionId: inst.id, name: `Grade ${grade}`, grade } });
    for (const sec of ['A', 'B']) {
      const section = await db.section.create({ data: { institutionId: inst.id, classId: klass.id, name: `${grade}-${sec}`, capacity: 40 } });
      const sectionStudents = [];
      const count = 9 + Math.floor(Math.random() * 5);
      for (let s = 0; s < count; s++) {
        admission++;
        const student = await db.student.create({
          data: { institutionId: inst.id, admissionNo: `ADM-${admission}`, firstName: pick(FIRST, admission + s),
            lastName: pick(LAST, admission), gender: s % 2 ? 'M' : 'F', sectionId: section.id,
            guardianName: `${pick(LAST, admission)} family`, guardianPhone: `+1-555-${2000 + admission}` },
        });
        sectionStudents.push(student);

        // 7 days of attendance (~88% present)
        for (let d = 0; d < 7; d++) {
          const r = Math.random();
          await db.attendanceRecord.create({
            data: { institutionId: inst.id, studentId: student.id, date: dayStr(d),
              status: r < 0.88 ? 'PRESENT' : r < 0.95 ? 'ABSENT' : 'LATE' },
          });
        }

        // tuition invoice (70% paid)
        const amount = 25000, paid = Math.random() < 0.7;
        const inv = await db.feeInvoice.create({
          data: { institutionId: inst.id, studentId: student.id, title: 'Tuition - Term 1',
            amountCents: amount, paidCents: paid ? amount : 0, status: paid ? 'PAID' : 'PENDING', dueDate: '2026-08-01' },
        });
        if (paid) await db.payment.create({ data: { institutionId: inst.id, invoiceId: inv.id, amountCents: amount, method: 'ONLINE' } });
      }

      // one published exam per section with marks
      const exam = await db.exam.create({
        data: { institutionId: inst.id, name: 'Mid-Term', subject: 'Mathematics', sectionId: section.id, maxMarks: 100, date: dayStr(14) },
      });
      for (const st of sectionStudents) {
        await db.mark.create({ data: { institutionId: inst.id, examId: exam.id, studentId: st.id, score: 45 + Math.floor(Math.random() * 55) } });
      }
    }
  }
  const n = await db.student.count({ where: { institutionId: inst.id } });
  return { code, adminEmail, students: n };
}

async function main() {
  await wipe();
  const a = await seedInstitution({ code: 'DEMO-001', name: 'EduNexus Demo School', color: '#6D28D9', grades: ['9', '10', '11'], adminEmail: 'admin@demo.edu', seedBase: 100 });
  const b = await seedInstitution({ code: 'RIVER-002', name: 'Riverside International College', color: '#0EA5E9', grades: ['11', '12'], adminEmail: 'admin@river.edu', seedBase: 500 });

  console.log('✅ Seeded TWO institutions (isolated tenants):');
  console.log(`   ${a.code}  · ${a.students} students · login ${a.adminEmail} / admin123`);
  console.log(`   ${b.code} · ${b.students} students · login ${b.adminEmail} / admin123`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
