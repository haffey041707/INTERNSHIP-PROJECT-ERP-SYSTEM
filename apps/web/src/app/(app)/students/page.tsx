import Link from 'next/link';
import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { BarChart3, GraduationCap, Search, ShieldCheck, Trash2, UserPlus, Users } from 'lucide-react';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { ensureStudentSections } from '@/lib/academic-structure';
import { getInstitutionTerminology } from '@/lib/institution-terminology';
import { deleteStudent } from '../actions';

export const dynamic = 'force-dynamic';

export default async function StudentsPage({ searchParams }: { searchParams: { q?: string } }) {
  const session = getSession();
  if (!session) redirect('/login');
  const institutionId = session.institutionId;
  const q = searchParams.q?.trim() ?? '';
  await ensureStudentSections(institutionId);

  const [institution, students] = await Promise.all([
    db.institution.findUnique({ where: { id: institutionId }, select: { type: true } }),
    db.student.findMany({
      where: {
        institutionId,
        ...(q ? { OR: [
          { firstName: { contains: q } }, { lastName: { contains: q } }, { admissionNo: { contains: q } },
        ] } : {}),
      },
      include: { section: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
  ]);
  const terms = getInstitutionTerminology(institution?.type);
  const active = students.filter((student) => student.status === 'ACTIVE').length;
  const assigned = students.filter((student) => student.sectionId).length;
  const guardians = students.filter((student) => student.guardianName || student.guardianPhone).length;
  const contextCopy = {
    SCHOOL: {
      eyebrow: 'Student information system',
      summary: 'Manage admission numbers, profiles, class allocation, guardian links, status, and student records from one clean school desk.',
      profileLabel: 'Student profile',
      profileHref: '/modules/school/student-records/student-profile',
      supportLabel: 'Guardian contacts',
      supportHref: '/modules/school/parent-and-guardian-portal/guardian-contacts',
      supportStat: 'Guardians',
    },
    COLLEGE: {
      eyebrow: 'College student services',
      summary: 'Manage roll numbers, programme allocation, semester sections, scholarship notes, guardian contacts, and college student records with visual controls.',
      profileLabel: 'Student services',
      profileHref: '/colleges',
      supportLabel: 'Mentor records',
      supportHref: '/colleges',
      supportStat: 'Mentors',
    },
    UNIVERSITY: {
      eyebrow: 'University student registry',
      summary: 'Manage student IDs, programme cohorts, faculty advising, enrollment status, housing links, and registrar-ready records from one modern university desk.',
      profileLabel: 'Registrar profile',
      profileHref: '/university',
      supportLabel: 'Advising records',
      supportHref: '/university',
      supportStat: 'Advising',
    },
    INSTITUTE: {
      eyebrow: 'Learner information system',
      summary: 'Manage learner IDs, course batches, trainer links, contact records, attendance status, and progress history from one clean institute desk.',
      profileLabel: 'Learner profile',
      profileHref: '/institutes',
      supportLabel: 'Contact records',
      supportHref: '/institutes',
      supportStat: 'Contacts',
    },
  }[terms.type];

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A] p-4 text-white shadow-sm sm:p-5">
        <div className="grid gap-4 xl:grid-cols-[1fr_340px] xl:gap-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">{contextCopy.eyebrow}</p>
            <h1 className="mt-2 break-words text-xl font-extrabold leading-tight sm:text-3xl">{terms.learners} Registry</h1>
            <p className="mt-3 max-w-2xl text-xs leading-5 text-slate-300 sm:text-sm sm:leading-6">
              {contextCopy.summary}
            </p>
            <div className="mt-4 grid gap-2 sm:mt-5 sm:flex sm:flex-wrap">
              <Link href="/students/new" className="inline-flex h-9 w-full min-w-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-3 text-xs font-semibold text-white shadow-sm sm:h-10 sm:w-auto sm:text-sm">
                <UserPlus size={15} className="shrink-0" />
                <span className="truncate">{terms.addLearner}</span>
              </Link>
              <Link href={contextCopy.profileHref} className="inline-flex h-9 w-full min-w-0 items-center justify-center rounded-xl border border-white/10 bg-white/8 px-3 text-xs font-semibold text-white transition hover:bg-white/12 sm:h-10 sm:w-auto sm:text-sm">
                <span className="truncate">{contextCopy.profileLabel}</span>
              </Link>
              <Link href={contextCopy.supportHref} className="inline-flex h-9 w-full min-w-0 items-center justify-center rounded-xl border border-white/10 bg-white/8 px-3 text-xs font-semibold text-white transition hover:bg-white/12 sm:h-10 sm:w-auto sm:text-sm">
                <span className="truncate">{contextCopy.supportLabel}</span>
              </Link>
            </div>
          </div>
          <StudentVisual total={students.length} active={active} assigned={assigned} />
        </div>
      </section>

      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        <Stat icon={<Users size={18} />} label="Shown" value={String(students.length)} tone="from-cyan-500 to-blue-600" />
        <Stat icon={<ShieldCheck size={18} />} label="Active" value={String(active)} tone="from-emerald-500 to-teal-500" />
        <Stat icon={<GraduationCap size={18} />} label={terms.sections} value={String(assigned)} tone="from-violet-600 to-fuchsia-500" />
        <Stat icon={<Users size={18} />} label={contextCopy.supportStat} value={String(guardians)} tone="from-amber-500 to-orange-500" />
      </div>

      <form className="flex min-w-0 items-center gap-2 rounded-2xl border border-white/10 bg-[#0F172A] px-4 py-3 shadow-sm sm:max-w-xl">
        <Search size={18} className="shrink-0 text-cyan-200" />
        <input
          name="q"
          defaultValue={q}
          placeholder={`Search by name or ${terms.idLabel.toLowerCase()}`}
          className="min-w-0 w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
        />
        <button className="rounded-xl bg-white/8 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/12">Search</button>
      </form>

      <div className="hidden overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A] shadow-sm md:block">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
          <div>
            <h2 className="font-bold text-white">{terms.learners} Master Register</h2>
            <p className="text-xs text-slate-400">Profile, section, guardian, status, and record actions.</p>
          </div>
          <span className="rounded-full bg-cyan-300/10 px-2.5 py-1 text-xs font-semibold text-cyan-200">{students.length} records</span>
        </div>
        <table className="w-full min-w-[780px] text-sm">
          <thead className="bg-white/5 text-left text-slate-400">
            <tr>
              <th className="px-4 py-3">{terms.idLabel}</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">{terms.section}</th>
              <th className="px-4 py-3">Gender</th>
              <th className="px-4 py-3">Guardian</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="border-t border-white/10 text-slate-100 transition hover:bg-white/5">
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-cyan-200">{student.admissionNo}</td>
                <td className="px-4 py-3">
                  <Link href={`/students/${student.id}`} className="font-semibold text-white hover:text-cyan-200">
                    {student.firstName} {student.lastName}
                  </Link>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-300">{student.section?.name ?? `No ${terms.section.toLowerCase()}`}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-300">{student.gender ?? 'Not added'}</td>
                <td className="px-4 py-3 text-slate-300">{student.guardianName ?? 'Not added'}</td>
                <td className="px-4 py-3"><StatusBadge value={student.status} /></td>
                <td className="px-4 py-3 text-right">
                  <form action={deleteStudent} className="inline">
                    <input type="hidden" name="id" value={student.id} />
                    <button className="inline-flex items-center gap-1 rounded-lg border border-red-300/20 bg-red-300/10 px-2.5 py-1.5 text-xs font-semibold text-red-200 transition hover:bg-red-300/15">
                      <Trash2 size={13} /> Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                No {terms.learners.toLowerCase()} found.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 md:hidden">
        {students.map((student) => (
          <article key={student.id} className="rounded-2xl border border-white/10 bg-[#0F172A] p-4 shadow-sm">
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-[11px] uppercase tracking-wide text-cyan-200">{student.admissionNo}</p>
                <Link href={`/students/${student.id}`} className="mt-1 block truncate text-base font-semibold text-white">
                  {student.firstName} {student.lastName}
                </Link>
              </div>
              <StatusBadge value={student.status} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <Info label={terms.section} value={student.section?.name ?? `No ${terms.section.toLowerCase()}`} />
              <Info label="Gender" value={student.gender ?? 'Not added'} />
              <Info label="Guardian" value={student.guardianName ?? 'Not added'} wide />
            </div>
            <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/10 pt-3">
              <Link href={`/students/${student.id}`} className="text-sm font-semibold text-cyan-200">Open profile</Link>
              <form action={deleteStudent}>
                <input type="hidden" name="id" value={student.id} />
                <button className="inline-flex items-center gap-1 rounded-lg border border-red-300/20 bg-red-300/10 px-2.5 py-1.5 text-xs font-semibold text-red-200">
                  <Trash2 size={13} /> Delete
                </button>
              </form>
            </div>
          </article>
        ))}
        {students.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-[#0F172A] p-6 text-center shadow-sm">
            <p className="text-sm text-slate-400">No {terms.learners.toLowerCase()} found.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StudentVisual({ total, active, assigned }: { total: number; active: number; assigned: number }) {
  const rows = [
    ['Profiles', total, 'bg-cyan-400'],
    ['Active', active, 'bg-emerald-400'],
    ['Assigned', assigned, 'bg-violet-400'],
  ] as const;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/8 p-3 sm:min-h-56 sm:p-5">
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-400/14" />
      <div className="absolute -bottom-12 left-8 h-32 w-32 rounded-full bg-violet-400/12" />
      <div className="relative grid grid-cols-3 gap-2 sm:gap-3">
        {rows.map(([label, value, color]) => (
          <div key={label} className="min-w-0 rounded-xl border border-white/10 bg-white/8 p-2.5 sm:rounded-2xl sm:p-3">
            <span className={`block h-2 w-8 rounded-full sm:w-10 ${color}`} />
            <p className="mt-3 truncate text-[10px] text-slate-400 sm:mt-4 sm:text-xs">{label}</p>
            <p className="text-xl font-extrabold text-white sm:text-2xl">{value}</p>
          </div>
        ))}
      </div>
      <div className="relative mt-3 rounded-xl border border-white/10 bg-slate-950/35 p-3 sm:mt-4 sm:rounded-2xl sm:p-4">
        <div className="flex items-end gap-2">
          {[42, 68, 50, 82, 58, 74].map((height, index) => (
            <span key={index} className="flex-1 rounded-t-xl bg-gradient-to-t from-cyan-500 to-violet-500" style={{ height }} />
          ))}
        </div>
        <p className="mt-3 text-[11px] font-semibold text-slate-300 sm:text-xs">Admissions and profile growth</p>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, tone }: { icon: ReactNode; label: string; value: string; tone: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0F172A] p-3 text-white shadow-sm sm:rounded-2xl sm:p-4">
      <span className={`grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br ${tone} sm:h-9 sm:w-9`}>{icon}</span>
      <p className="mt-2 truncate text-[10px] font-semibold uppercase tracking-widest text-white/55 sm:mt-3 sm:text-xs">{label}</p>
      <p className="mt-1 text-xl font-extrabold sm:text-2xl">{value}</p>
    </div>
  );
}

function StatusBadge({ value }: { value: string }) {
  const active = value === 'ACTIVE';
  return (
    <span className={`shrink-0 rounded-full border px-2 py-1 text-[11px] font-semibold ${active ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-200' : 'border-amber-300/20 bg-amber-300/10 text-amber-200'}`}>
      {value}
    </span>
  );
}

function Info({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={`min-w-0 rounded-xl bg-white/8 px-3 py-2 ${wide ? 'col-span-2' : ''}`}>
      <p className="text-[11px] text-slate-400">{label}</p>
      <p className="truncate text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
