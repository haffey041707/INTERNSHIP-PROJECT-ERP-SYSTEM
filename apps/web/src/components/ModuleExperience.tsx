import Link from 'next/link';
import type { ReactNode } from 'react';
import { AlertTriangle, Archive, ArrowRight, Award, BadgeCheck, BarChart3, BedDouble, BookOpen, Bookmark, Building2, Bus, CalendarDays, CheckCircle2, ClipboardCheck, Clock3, DoorOpen, FileCheck2, FileText, Flag, Fuel, Gauge, GraduationCap, Headphones, HeartPulse, KeyRound, Library, LifeBuoy, MapPinned, Megaphone, MessageSquare, Navigation, PackageCheck, PenLine, Printer, QrCode, Repeat2, Route, Settings2, ShieldAlert, ShieldCheck, TrafficCone, Upload, UserCheck, Users, Vote, Wrench } from 'lucide-react';
import { slugifyWorkspace } from '@/lib/main-workspaces';

interface WorkflowStep {
  title: string;
  detail: string;
}

interface ModuleExperienceProps {
  moduleSlug?: string;
  featureSlug?: string;
  moduleName: string;
  featureName: string;
  summary?: string;
  capabilities: string[];
  controls: string[];
  output: string;
  workflow: WorkflowStep[];
  reports: string[];
  mode?: 'workspace' | 'feature';
}

function hrefFor(moduleSlug: string | undefined, label: string, featureSlug?: string) {
  if (!moduleSlug) return '#';
  const targetSlug = slugifyWorkspace(label);
  return featureSlug ? `/modules/${moduleSlug}/${featureSlug}/${targetSlug}` : `/modules/${moduleSlug}/${targetSlug}`;
}

function cleanItems(items: string[], fallback: string[]) {
  return (items.length ? items : fallback).slice(0, 8);
}

export function ModuleExperience({
  moduleSlug,
  featureSlug,
  moduleName,
  featureName,
  summary,
  capabilities,
  controls,
  output,
  workflow,
  reports,
  mode = 'feature',
}: ModuleExperienceProps) {
  const safeCapabilities = cleanItems(capabilities, ['Request capture', 'Owner routing', 'Approval control', 'Report export']);
  const safeControls = cleanItems(controls, ['Role-based access', 'Approval routing', 'Audit history', 'Export permissions']);
  const safeReports = cleanItems(reports, ['Summary report', 'Pending actions', 'Audit trail', 'Export pack']);
  const safeWorkflow = workflow.length
    ? workflow
    : [
        { title: 'Configure', detail: 'Set policy, owners, forms, required fields, and visibility.' },
        { title: 'Operate', detail: 'Capture work, route owners, track status, and handle exceptions.' },
        { title: 'Approve', detail: 'Review evidence, validate decisions, and lock outcomes.' },
        { title: 'Report', detail: 'Export summaries, audit trails, and management records.' },
      ];

  if (mode === 'feature') {
    return (
        <FeatureOperationExperience
          moduleSlug={moduleSlug}
          featureSlug={featureSlug}
          moduleName={moduleName}
          featureName={featureName}
        summary={summary}
        capabilities={safeCapabilities}
        controls={safeControls}
        output={output}
        workflow={safeWorkflow}
        reports={safeReports}
      />
    );
  }

  switch (moduleSlug) {
    case 'school':
      return (
        <div className="space-y-4">
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A] p-5 shadow-sm">
            <div className="grid gap-4 xl:grid-cols-[1.08fr_.92fr]">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">{moduleName}</p>
                <h2 className="mt-1 break-words text-lg font-bold text-white">School command board</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                  Admissions, student records, classes, attendance, exams, fees, guardians, and campus services are connected as one school operations flow.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {[
                    { title: 'Admissions', href: 'Admissions and SIS', detail: 'Enquiries, applications, guardian proof, and final student files.', icon: <Users size={18} /> },
                    { title: 'Academics', href: 'Academics and Classes', detail: 'Classes, sections, teacher loads, timetables, curriculum, and homework.', icon: <BookOpen size={18} /> },
                    { title: 'Parents', href: 'Parent and Guardian Portal', detail: 'Guardian contacts, consent forms, meetings, alerts, and student updates.', icon: <MessageSquare size={18} /> },
                    { title: 'Fees', href: 'Fees and Campus Services', detail: 'Invoices, receipts, concessions, balances, and linked campus services.', icon: <BarChart3 size={18} /> },
                  ].map((item) => (
                    <Link key={item.title} href={hrefFor(moduleSlug, item.href)} className="group rounded-2xl border border-white/10 bg-white/8 p-4 transition hover:-translate-y-0.5 hover:bg-white/12">
                      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/12 text-cyan-200">
                        {item.icon}
                      </span>
                      <h3 className="mt-3 text-sm font-bold text-white">{item.title}</h3>
                      <p className="mt-1 text-xs leading-5 text-slate-300">{item.detail}</p>
                      <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-cyan-200">
                        Open page <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
              <div className="erp-main-visual-frame erp-desk-visual-frame min-w-0 border border-white/10 bg-white/8">
                <img src="/images/school-dashboard-banner.png?v=2" alt="School ERP operations" className="erp-desk-panel-image h-full min-h-64 w-full object-cover" />
              </div>
            </div>
          </section>
          <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">
            <CompactBoard title="Student Lifecycle" items={['Enquiry capture', 'Guardian profile', 'Student profile', 'Promotion history', output]} moduleSlug={moduleSlug} />
            <CompactBoard title="Academic Control" items={['Class setup', 'Section allocation', 'Teacher assignment', 'Timetable planning', 'Homework board']} moduleSlug={moduleSlug} />
            <CompactBoard title="Parent Portal" items={['Parent dashboard', 'Guardian contacts', 'Meeting requests', 'Consent forms', 'Message history']} moduleSlug={moduleSlug} />
            <CompactBoard title="Fees Office" items={['Fee invoices', 'Payment collection', 'Receipt register', 'Fee concessions', 'Outstanding balances']} moduleSlug={moduleSlug} />
          </div>
        </div>
      );

    case 'institutes':
      return (
        <div className="space-y-4">
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A] p-5 shadow-sm">
            <div className="grid gap-4 xl:grid-cols-[.86fr_1.14fr]">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-widest text-violet-300">{moduleName}</p>
                <h2 className="mt-1 break-words text-lg font-bold text-white">Institute growth board</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                  Leads, counselling, course batches, trainers, assessments, payments, certificates, branches, and support work together as one institute control room.
                </p>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  {[
                    ['Leads', 'CRM'],
                    ['Batches', 'Delivery'],
                    ['Trainers', 'Ops'],
                    ['Revenue', 'Clearance'],
                  ].map(([value, label]) => (
                    <div key={value} className="rounded-2xl border border-white/10 bg-white/8 p-3">
                      <p className="text-lg font-black text-white">{value}</p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-violet-200">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                {['Lead CRM', 'Batch Delivery', 'Trainer Desk', 'Certification'].map((item, index) => (
                  <Link key={item} href={hrefFor(moduleSlug, item)} className="group rounded-2xl border border-white/10 bg-white/8 p-4 transition hover:-translate-y-0.5 hover:bg-white/12">
                    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/12 text-violet-200">
                      {index === 0 ? <Megaphone size={18} /> : index === 1 ? <CalendarDays size={18} /> : index === 2 ? <Users size={18} /> : <BadgeCheck size={18} />}
                    </span>
                    <h3 className="mt-3 text-sm font-bold text-white">{item}</h3>
                    <p className="mt-1 text-xs leading-5 text-slate-300">{safeCapabilities[index % safeCapabilities.length]}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-violet-200">
                      Open page <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
          <div className="grid gap-4 lg:grid-cols-3">
            <CompactBoard title="Enrollment Engine" items={['Enquiry capture', 'Counselling notes', 'Demo class booking', 'Admission conversion', output]} moduleSlug={moduleSlug} />
            <CompactBoard title="Delivery Studio" items={['Course catalogue', 'Batch schedule', 'Session planner', 'Trainer calendar', ...safeControls]} moduleSlug={moduleSlug} />
            <CompactBoard title="Revenue and Growth" items={['Invoice plan', 'Installment tracker', 'Certificate release', 'Branch dashboard', ...safeReports]} moduleSlug={moduleSlug} />
          </div>
        </div>
      );

    case 'colleges':
      return (
        <div className="space-y-3 sm:space-y-4">
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A] p-3 shadow-sm sm:p-5">
            <div className="grid gap-3 xl:grid-cols-[1.04fr_.96fr] xl:gap-4">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-cyan-300 sm:text-xs">{moduleName}</p>
                <h2 className="mt-1 break-words text-base font-bold leading-snug text-white sm:text-lg">College academic command board</h2>
                <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-300 sm:text-sm sm:leading-6">
                  Students, lecturers, departments, semesters, credits, assessments, fees, scholarships, placements, and outcomes run from one college operations workspace.
                </p>
                <div className="mt-3 grid gap-2 sm:mt-5 sm:grid-cols-2 sm:gap-3">
                  {[
                    { title: 'Students', href: '/students', detail: 'Roll numbers, semester records, mentor notes, and student profiles.', icon: <Users size={18} /> },
                    { title: 'Lecturers', href: '/teachers', detail: 'Course ownership, lecture load, departments, and office hours.', icon: <GraduationCap size={18} /> },
                    { title: 'Fees', href: '/fees', detail: 'Tuition ledger, scholarships, receipts, installments, and balances.', icon: <BarChart3 size={18} /> },
                    { title: 'Programs', href: hrefFor(moduleSlug, 'Programs and Assessments'), detail: 'Credit plans, semester calendars, internal marks, and outcome maps.', icon: <BookOpen size={18} /> },
                  ].map((item) => (
                    <HigherEdQuickCard key={item.title} {...item} tone="cyan" />
                  ))}
                </div>
              </div>
              <div className="erp-main-visual-frame erp-desk-visual-frame min-w-0 border border-white/10 bg-white/8">
                <img src="/images/college-dashboard-banner.png?v=2" alt="College ERP workspace" className="erp-desk-panel-image h-36 w-full object-cover sm:h-full sm:min-h-64" />
              </div>
            </div>
          </section>
          <div className="grid gap-3 lg:grid-cols-3 lg:gap-4">
            <CompactBoard title="Student Services" items={['Student profile', 'Roll number', 'Semester section', 'Mentor record', output]} moduleSlug={moduleSlug} />
            <CompactBoard title="Lecturer Office" items={['Lecturer profile', 'Department allocation', 'Course ownership', 'Lecture load', ...safeControls]} moduleSlug={moduleSlug} />
            <CompactBoard title="Fees and Outcomes" items={['Tuition ledger', 'Scholarship review', 'Receipt register', 'Outcome mapping', ...safeReports]} moduleSlug={moduleSlug} />
          </div>
        </div>
      );

    case 'university':
      return (
        <div className="space-y-3 sm:space-y-4">
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A] p-3 shadow-sm sm:p-5">
            <div className="grid gap-3 xl:grid-cols-[.96fr_1.04fr] xl:gap-4">
              <div className="erp-main-visual-frame erp-desk-visual-frame order-2 min-w-0 border border-white/10 bg-white/8 xl:order-none">
                <img src="/images/university-dashboard-banner.png?v=2" alt="University ERP workspace" className="erp-desk-panel-image h-36 w-full object-cover sm:h-full sm:min-h-64" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-violet-300 sm:text-xs">{moduleName}</p>
                <h2 className="mt-1 break-words text-base font-bold leading-snug text-white sm:text-lg">University registrar command board</h2>
                <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-300 sm:text-sm sm:leading-6">
                  Student registry, lecturers, faculties, registrar records, fees, receivables, research, compliance, housing, and transcripts stay connected.
                </p>
                <div className="mt-3 grid gap-2 sm:mt-5 sm:grid-cols-2 sm:gap-3">
                  {[
                    { title: 'Students', href: '/students', detail: 'Student IDs, cohorts, academic standing, advising, and registry records.', icon: <Users size={18} /> },
                    { title: 'Lecturers', href: '/teachers', detail: 'Faculty workload, course ownership, research supervision, and office hours.', icon: <GraduationCap size={18} /> },
                    { title: 'Fees', href: '/fees', detail: 'Tuition ledger, scholarships, waivers, receipts, and open balances.', icon: <BarChart3 size={18} /> },
                    { title: 'Registrar', href: hrefFor(moduleSlug, 'Registrar Operations'), detail: 'Registration, transcripts, credit transfer, exams, and graduation audit.', icon: <FileText size={18} /> },
                  ].map((item) => (
                    <HigherEdQuickCard key={item.title} {...item} tone="violet" />
                  ))}
                </div>
              </div>
            </div>
          </section>
          <div className="grid gap-3 lg:grid-cols-3 lg:gap-4">
            <CompactBoard title="Student Registry" items={['Student ID profile', 'Enrollment record', 'Programme cohort', 'Advisor notes', output]} moduleSlug={moduleSlug} />
            <CompactBoard title="Lecturer Affairs" items={['Lecturer profile', 'Faculty workload', 'Course ownership', 'Research supervision', ...safeControls]} moduleSlug={moduleSlug} />
            <CompactBoard title="Fees and Registrar" items={['Tuition ledger', 'Open balance', 'Transcript request', 'Graduation audit', ...safeReports]} moduleSlug={moduleSlug} />
          </div>
        </div>
      );

    case 'internship':
      return (
        <div className="grid gap-4 xl:grid-cols-[1.35fr_.65fr]">
          <Surface title="Placement Pipeline" eyebrow={moduleName} note="From eligibility to final completion evidence.">
            <div className="relative mb-4 min-h-44 overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A] sm:min-h-56">
              <img
                src="/images/internship-desk-hero.png?v=3"
                alt="Internship placement workspace"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A]/78 via-[#0F172A]/20 to-transparent" />
              <div className="relative flex min-h-44 items-end p-4 sm:min-h-56">
                <div className="max-w-sm">
                  <p className="text-[10px] font-black uppercase tracking-widest text-cyan-200">Placement desk</p>
                  <h3 className="mt-1 text-lg font-black text-white">Students, partners, mentors</h3>
                </div>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {['Eligibility', 'Matching', 'Mentor Review', 'Completion'].map((lane, index) => (
                <StageCard key={lane} index={index} title={lane} body={safeWorkflow[index % safeWorkflow.length]?.detail ?? summary} />
              ))}
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <LinkedList title="Student Readiness" items={safeCapabilities.slice(0, 4)} moduleSlug={moduleSlug} />
              <LinkedList title="Partner Office" items={['Company directory', 'Mentor contacts', 'Vacancy tracker', 'Agreement storage']} moduleSlug={moduleSlug} />
            </div>
          </Surface>
          <div className="space-y-4">
            <div className="relative min-h-52 overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A] shadow-sm">
              <img
                src="/images/internship-desk-operations.png?v=1"
                alt="Internship operations workspace"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/88 via-[#0F172A]/24 to-transparent" />
              <div className="relative flex min-h-52 items-end p-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-cyan-200">Operations</p>
                  <h3 className="mt-1 text-lg font-black text-white">Logs, review, completion</h3>
                </div>
              </div>
            </div>
            <StackPanel
              title={mode === 'workspace' ? 'Internship Control Desk' : `${featureName} Control Desk`}
              items={['Supervisor ownership', 'Weekly log evidence', 'Risk and escalation notes', output]}
              controls={safeControls}
              moduleSlug={moduleSlug}
            />
          </div>
        </div>
      );

    case 'training':
      return (
        <div className="grid gap-4 lg:grid-cols-[.9fr_1.1fr]">
          <Surface title="Training Delivery Planner" eyebrow={moduleName} note="Batch planning, session flow, trainer ownership, and skill checks.">
            <div className="space-y-3">
              {safeWorkflow.map((step, index) => (
                <TimelineRow key={step.title} index={index} title={step.title} detail={step.detail} />
              ))}
            </div>
          </Surface>
          <Surface title="Skill Matrix" eyebrow={featureName} note="Keeps practical delivery easy to review.">
            <div className="grid gap-3 sm:grid-cols-2">
              {safeCapabilities.slice(0, 6).map((item, index) => (
                <SkillTile key={item} label={item} status={['Planned', 'Delivered', 'Checked'][index % 3]} moduleSlug={moduleSlug} />
              ))}
            </div>
            <ControlStrip items={safeControls.slice(0, 4)} moduleSlug={moduleSlug} />
          </Surface>
        </div>
      );

    case 'programmes':
      return (
        <div className="space-y-4">
          <Surface title="Curriculum Map" eyebrow={moduleName} note="Programme structures need versioning, requisites, credits, and approval history.">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {['Foundation', 'Core', 'Elective', 'Capstone'].map((band, index) => (
                <CurriculumBand key={band} title={band} item={safeCapabilities[index % safeCapabilities.length]} moduleSlug={moduleSlug} />
              ))}
            </div>
          </Surface>
          <div className="grid gap-4 lg:grid-cols-3">
            <CompactBoard title="Governance" items={safeControls} moduleSlug={moduleSlug} />
            <CompactBoard title="Academic Output" items={[output, 'Published catalogue', 'Curriculum change log', 'Outcome map']} moduleSlug={moduleSlug} />
            <CompactBoard title="Reports" items={safeReports} moduleSlug={moduleSlug} />
          </div>
        </div>
      );

    case 'submissions':
      return (
        <div className="space-y-4">
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A] p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">{moduleName}</p>
                <h2 className="mt-1 break-words text-lg font-bold text-white">Submission Review Board</h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-300">Upload intake, evaluator routing, rubric marking, originality checks, revisions, feedback release, and evidence archive.</p>
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-[.92fr_1.08fr]">
              <SubmissionReviewVisual />
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { icon: <Upload size={18} />, title: 'Collect', detail: safeCapabilities[0] ?? 'Assignment uploads', href: hrefFor(moduleSlug, safeCapabilities[0] ?? 'Assignment uploads') },
                  { icon: <ClipboardCheck size={18} />, title: 'Evaluate', detail: safeCapabilities[1] ?? 'Rubric marking', href: hrefFor(moduleSlug, safeCapabilities[1] ?? 'Rubric marking') },
                  { icon: <ShieldCheck size={18} />, title: 'Check', detail: safeControls[2] ?? 'Originality status', href: hrefFor(moduleSlug, safeControls[2] ?? 'Originality status') },
                  { icon: <Archive size={18} />, title: 'Archive', detail: output, href: hrefFor(moduleSlug, output) },
                ].map((item) => (
                  <SubmissionStageTile key={item.title} {...item} />
                ))}
              </div>
            </div>
          </section>
          <div className="grid gap-4 lg:grid-cols-3">
            <SubmissionFocusPanel
              icon={<FileText size={19} />}
              title="Upload Control"
              tone="from-sky-500 to-cyan-500"
              items={['File requirements', 'Submission window', 'Version history', safeCapabilities[0] ?? 'Document evidence']}
              moduleSlug={moduleSlug}
            />
            <SubmissionFocusPanel
              icon={<ClipboardCheck size={19} />}
              title="Rubric Review"
              tone="from-violet-600 to-fuchsia-500"
              items={['Evaluator assignment', 'Rubric lock', 'Reviewer comments', safeControls[1] ?? 'Revision deadline']}
              moduleSlug={moduleSlug}
            />
            <SubmissionFocusPanel
              icon={<Archive size={19} />}
              title="Release Archive"
              tone="from-emerald-500 to-teal-500"
              items={['Feedback release', 'Student visibility', 'Archive policy', output]}
              moduleSlug={moduleSlug}
            />
          </div>
        </div>
      );

    case 'certificates':
      return (
        <div className="space-y-4">
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A] p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-widest text-violet-300">{moduleName}</p>
                <h2 className="mt-1 break-words text-lg font-bold text-white">Certificate Release Board</h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-300">Templates, eligibility checks, approvals, QR verification, print batches, reissue reasons, and audit archive.</p>
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-[.92fr_1.08fr]">
              <CertificateReleaseVisual />
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { icon: <Award size={18} />, title: 'Issue', detail: safeCapabilities[0] ?? 'Issue certificate', href: hrefFor(moduleSlug, safeCapabilities[0] ?? 'Issue certificate') },
                  { icon: <ClipboardCheck size={18} />, title: 'Approve', detail: safeControls[0] ?? 'Approval routing', href: hrefFor(moduleSlug, safeControls[0] ?? 'Approval routing') },
                  { icon: <QrCode size={18} />, title: 'Verify', detail: 'QR verification and access log', href: hrefFor(moduleSlug, 'QR verification') },
                  { icon: <Archive size={18} />, title: 'Archive', detail: output, href: hrefFor(moduleSlug, output) },
                ].map((item) => (
                  <CertificateStageTile key={item.title} {...item} />
                ))}
              </div>
            </div>
          </section>
          <div className="grid gap-4 lg:grid-cols-3">
            <CertificateFocusPanel
              icon={<FileText size={19} />}
              title="Template Control"
              tone="from-violet-600 to-fuchsia-500"
              items={['Template selection', 'Wording lock', 'Version history', safeControls[0] ?? 'Role approval']}
              moduleSlug={moduleSlug}
            />
            <CertificateFocusPanel
              icon={<ShieldCheck size={19} />}
              title="Approval Security"
              tone="from-sky-500 to-cyan-500"
              items={['Approver routing', 'Digital signatures', 'Eligibility rules', safeControls[1] ?? 'Change log']}
              moduleSlug={moduleSlug}
            />
            <CertificateFocusPanel
              icon={<Printer size={19} />}
              title="Print and Archive"
              tone="from-amber-500 to-orange-500"
              items={['Print queue', 'Reissue requests', 'Verification logs', output]}
              moduleSlug={moduleSlug}
            />
          </div>
        </div>
      );

    case 'transport':
      return (
        <div className="space-y-4">
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A] p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">{moduleName}</p>
                <h2 className="mt-1 break-words text-lg font-bold text-white">Route and Fleet Command</h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-300">Route planning, stops, vehicles, drivers, duty checks, trip sheets, fee links, incidents, and guardian communication.</p>
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-[.92fr_1.08fr]">
              <TransportRouteVisual />
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { icon: <MapPinned size={18} />, title: 'Routes', detail: safeCapabilities[0] ?? 'Route map', href: hrefFor(moduleSlug, safeCapabilities[0] ?? 'Route map') },
                  { icon: <Bus size={18} />, title: 'Fleet', detail: safeCapabilities[1] ?? 'Vehicle register', href: hrefFor(moduleSlug, safeCapabilities[1] ?? 'Vehicle register') },
                  { icon: <Navigation size={18} />, title: 'Trips', detail: safeControls[1] ?? 'Stop timing', href: hrefFor(moduleSlug, safeControls[1] ?? 'Stop timing') },
                  { icon: <ShieldAlert size={18} />, title: 'Safety', detail: output, href: hrefFor(moduleSlug, output) },
                ].map((item) => (
                  <TransportStageTile key={item.title} {...item} />
                ))}
              </div>
            </div>
          </section>
          <div className="grid gap-4 lg:grid-cols-3">
            <TransportFocusPanel
              icon={<Route size={19} />}
              title="Route Planning"
              tone="from-sky-500 to-cyan-500"
              items={['Route map', 'Stops', 'Pickup assignment', 'Capacity balancing']}
              moduleSlug={moduleSlug}
            />
            <TransportFocusPanel
              icon={<Bus size={19} />}
              title="Fleet Readiness"
              tone="from-violet-600 to-fuchsia-500"
              items={['Vehicle register', 'Driver assignment', 'Maintenance schedule', 'Fuel logs']}
              moduleSlug={moduleSlug}
            />
            <TransportFocusPanel
              icon={<ClipboardCheck size={19} />}
              title="Daily Operations"
              tone="from-emerald-500 to-teal-500"
              items={['Daily trip sheet', 'Transport fees', 'Incident records', output]}
              moduleSlug={moduleSlug}
            />
          </div>
        </div>
      );

    case 'hostel':
      return (
        <div className="space-y-4">
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A] p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald-300">{moduleName}</p>
                <h2 className="mt-1 break-words text-lg font-bold text-white">Residential Care Command</h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-300">Room allocation, resident movement, warden follow-up, visitor logs, care alerts, fees, inventory, and occupancy reporting.</p>
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-[.92fr_1.08fr]">
              <HostelResidenceVisual />
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { icon: <BedDouble size={18} />, title: 'Rooms', detail: safeCapabilities[0] ?? 'Room allocation', href: hrefFor(moduleSlug, safeCapabilities[0] ?? 'Room allocation') },
                  { icon: <DoorOpen size={18} />, title: 'Movement', detail: safeCapabilities[1] ?? 'Leave passes', href: hrefFor(moduleSlug, safeCapabilities[1] ?? 'Leave passes') },
                  { icon: <HeartPulse size={18} />, title: 'Care', detail: safeControls[1] ?? 'Guardian approval', href: hrefFor(moduleSlug, safeControls[1] ?? 'Guardian approval') },
                  { icon: <ShieldAlert size={18} />, title: 'Incidents', detail: output, href: hrefFor(moduleSlug, output) },
                ].map((item) => (
                  <HostelStageTile key={item.title} {...item} />
                ))}
              </div>
            </div>
          </section>
          <div className="grid gap-4 lg:grid-cols-3">
            <HostelFocusPanel
              icon={<Building2 size={19} />}
              title="Accommodation"
              tone="from-emerald-500 to-teal-500"
              items={['Room allocation', 'Bed capacity', 'Warden assignment', 'Room transfer']}
              moduleSlug={moduleSlug}
            />
            <HostelFocusPanel
              icon={<Users size={19} />}
              title="Resident Care"
              tone="from-violet-600 to-fuchsia-500"
              items={['Leave passes', 'Visitor register', 'Meal plans', 'Health notes']}
              moduleSlug={moduleSlug}
            />
            <HostelFocusPanel
              icon={<PackageCheck size={19} />}
              title="Administration"
              tone="from-sky-500 to-cyan-500"
              items={['Hostel fees', 'Inventory checks', 'Incident records', output]}
              moduleSlug={moduleSlug}
            />
          </div>
        </div>
      );

    case 'library':
      return (
        <div className="space-y-4">
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A] p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">{moduleName}</p>
                <h2 className="mt-1 break-words text-lg font-bold text-white">Library Catalogue Console</h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-300">Catalogue, accession, issue, return, reservations, overdue control, and reading insight in one circulation workspace.</p>
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-[.92fr_1.08fr]">
              <LibraryShelfVisual />
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { icon: <Library size={18} />, title: 'Catalogue', detail: safeCapabilities[0] ?? 'Book records', href: hrefFor(moduleSlug, safeCapabilities[0] ?? 'Book records') },
                  { icon: <Repeat2 size={18} />, title: 'Circulation', detail: safeCapabilities[1] ?? 'Issue and return', href: hrefFor(moduleSlug, safeCapabilities[1] ?? 'Issue and return') },
                  { icon: <Clock3 size={18} />, title: 'Due Control', detail: safeControls[1] ?? 'Due date policy', href: hrefFor(moduleSlug, safeControls[1] ?? 'Due date policy') },
                  { icon: <BarChart3 size={18} />, title: 'Reading Insight', detail: output, href: hrefFor(moduleSlug, output) },
                ].map((item) => (
                  <LibraryStageTile key={item.title} {...item} />
                ))}
              </div>
            </div>
          </section>
          <div className="grid gap-4 lg:grid-cols-3">
            <LibraryFocusPanel
              icon={<BookOpen size={19} />}
              title="Catalogue Control"
              tone="from-teal-500 to-cyan-500"
              items={['Book records', 'ISBN lookup', 'Categories', 'Digital resources']}
              moduleSlug={moduleSlug}
            />
            <LibraryFocusPanel
              icon={<Bookmark size={19} />}
              title="Borrowing Desk"
              tone="from-violet-600 to-fuchsia-500"
              items={['Issue and return', 'Reservations', 'Borrowing limits', 'Due date policy']}
              moduleSlug={moduleSlug}
            />
            <LibraryFocusPanel
              icon={<BarChart3 size={19} />}
              title="Reading Reports"
              tone="from-emerald-500 to-teal-500"
              items={['Reading history', 'Popular titles', 'Class reading lists', output]}
              moduleSlug={moduleSlug}
            />
          </div>
        </div>
      );

    case 'support':
      return (
        <div className="space-y-4">
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A] p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">{moduleName}</p>
                <h2 className="mt-1 break-words text-lg font-bold text-white">Support Command Desk</h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-300">Requests move through intake, owner routing, SLA control, escalation, resolution, and feedback.</p>
              </div>
            </div>
            <div className="grid gap-4 xl:grid-cols-[.94fr_1.06fr]">
              <SupportDeskVisual />
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { icon: <LifeBuoy size={18} />, title: 'Intake', detail: safeCapabilities[0] ?? 'Student support', href: hrefFor(moduleSlug, safeCapabilities[0] ?? 'Student support') },
                  { icon: <UserCheck size={18} />, title: 'Ownership', detail: safeCapabilities[1] ?? 'Ticket assignment', href: hrefFor(moduleSlug, safeCapabilities[1] ?? 'Ticket assignment') },
                  { icon: <Clock3 size={18} />, title: 'SLA Control', detail: safeControls[1] ?? 'SLA timer', href: hrefFor(moduleSlug, safeControls[1] ?? 'SLA timer') },
                  { icon: <AlertTriangle size={18} />, title: 'Escalation', detail: safeControls[2] ?? 'Escalation path', href: hrefFor(moduleSlug, safeControls[2] ?? 'Escalation path') },
                ].map((item) => (
                  <SupportStageTile key={item.title} {...item} />
                ))}
              </div>
            </div>
          </section>
          <div className="grid gap-4 lg:grid-cols-3">
            <SupportFocusPanel
              icon={<Headphones size={19} />}
              title="Request Channels"
              tone="from-sky-500 to-cyan-500"
              items={safeCapabilities.slice(0, 4)}
              moduleSlug={moduleSlug}
            />
            <SupportFocusPanel
              icon={<ShieldCheck size={19} />}
              title="Resolution Controls"
              tone="from-violet-600 to-fuchsia-500"
              items={['Priority rules', 'Owner queue', 'Response templates', output]}
              moduleSlug={moduleSlug}
            />
            <SupportFocusPanel
              icon={<BarChart3 size={19} />}
              title="Quality Reports"
              tone="from-emerald-500 to-teal-500"
              items={safeReports}
              moduleSlug={moduleSlug}
            />
          </div>
        </div>
      );

    case 'community':
      return (
        <div className="community-module space-y-4">
          <Surface title="Community Activity Studio" eyebrow={moduleName} note="Built for groups, announcements, events, polls, and moderation work instead of a static list.">
            <div className="grid gap-4 xl:grid-cols-[.92fr_1.08fr]">
              <CommunityBroadcastVisual />
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { icon: <Users size={18} />, title: 'Groups', detail: safeCapabilities[0] ?? 'Student groups', href: hrefFor(moduleSlug, safeCapabilities[0] ?? 'Groups and clubs') },
                  { icon: <CalendarDays size={18} />, title: 'Events', detail: safeCapabilities[1] ?? 'Event calendar', href: hrefFor(moduleSlug, safeCapabilities[1] ?? 'Event calendar') },
                  { icon: <Vote size={18} />, title: 'Polls', detail: safeCapabilities[2] ?? 'Polls and feedback', href: hrefFor(moduleSlug, safeCapabilities[2] ?? 'Polls and feedback') },
                  { icon: <ShieldCheck size={18} />, title: 'Moderation', detail: safeControls[0] ?? 'Content review', href: hrefFor(moduleSlug, safeControls[0] ?? 'Content review') },
                ].map((item) => (
                  <CommunityStudioTile key={item.title} {...item} />
                ))}
              </div>
            </div>
          </Surface>
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr]">
            <CommunityVisualPanel
              moduleSlug={moduleSlug}
              icon={<MessageSquare size={19} />}
              title="Discussion Wall"
              tone="from-emerald-500 to-teal-500"
              items={['Discussion boards', 'Feedback windows', 'Audience replies', output]}
            />
            <CommunityVisualPanel
              moduleSlug={moduleSlug}
              icon={<Megaphone size={19} />}
              title="Announcement Flow"
              tone="from-sky-500 to-cyan-500"
              items={['Audience targeting', 'Event capacity', 'Publish approval', 'Participation feedback']}
            />
            <CommunityVisualPanel
              moduleSlug={moduleSlug}
              icon={<Flag size={19} />}
              title="Governance Desk"
              tone="from-amber-500 to-orange-500"
              items={[...safeControls.slice(0, 3), safeReports[0] ?? 'Moderation log']}
            />
          </div>
        </div>
      );

    case 'help-centre':
      return (
        <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
          <Surface title="Help Knowledge Base" eyebrow={moduleName} note="Guides should be searchable, owned, reviewed, published, and improved from support feedback.">
            <KnowledgeBase items={safeCapabilities} moduleSlug={moduleSlug} />
          </Surface>
          <Surface title="Article Lifecycle" eyebrow={featureName} note="A help centre works best when content has ownership and review dates.">
            <div className="space-y-3">
              {['Draft', 'Review', 'Publish', 'Improve'].map((step, index) => (
                <TimelineRow key={step} index={index} title={step} detail={safeWorkflow[index % safeWorkflow.length]?.detail ?? summary} />
              ))}
            </div>
            <ControlStrip items={safeControls.slice(0, 4)} moduleSlug={moduleSlug} />
          </Surface>
        </div>
      );

    case 'settings':
      return (
        <div className="grid gap-4 lg:grid-cols-3">
          <SecurityPanel title="Institution Profile" items={['Institution name', 'Institution type', 'Workspace labels', 'System-wide update']} moduleSlug={moduleSlug} />
          <SecurityPanel title="Brand and Interface" items={['Theme color', 'Logo area', 'Navigation labels', 'Responsive preview']} moduleSlug={moduleSlug} />
          <SecurityPanel title="Access and Safety" items={['Email ownership', 'Password reset', 'Provider link', 'Session control']} moduleSlug={moduleSlug} />
        </div>
      );

    default:
      return (
        <div className="grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
          <Surface title="Operational Capabilities" eyebrow={moduleName} note={summary}>
            <div className="grid gap-2 sm:grid-cols-2">
              {safeCapabilities.map((item) => (
                <LinkedTile key={item} label={item} moduleSlug={moduleSlug} />
              ))}
            </div>
          </Surface>
          <StackPanel title={featureName} items={[output, ...safeReports.slice(0, 3)]} controls={safeControls} moduleSlug={moduleSlug} />
        </div>
      );
  }
}

function featureTheme(moduleSlug?: string) {
  switch (moduleSlug) {
    case 'certificates':
      return {
        eyebrow: 'text-violet-300',
        soft: 'bg-violet-300/14 text-violet-200',
        tone: 'from-violet-600 to-fuchsia-500',
        altTone: 'from-sky-500 to-cyan-500',
        lastTone: 'from-amber-500 to-orange-500',
        hover: 'hover:border-violet-300/50',
      };
    case 'hostel':
      return {
        eyebrow: 'text-emerald-300',
        soft: 'bg-emerald-300/14 text-emerald-200',
        tone: 'from-emerald-500 to-teal-500',
        altTone: 'from-violet-600 to-fuchsia-500',
        lastTone: 'from-amber-500 to-orange-500',
        hover: 'hover:border-emerald-300/50',
      };
    case 'library':
      return {
        eyebrow: 'text-teal-300',
        soft: 'bg-teal-300/14 text-teal-200',
        tone: 'from-teal-500 to-cyan-500',
        altTone: 'from-violet-600 to-fuchsia-500',
        lastTone: 'from-amber-500 to-orange-500',
        hover: 'hover:border-teal-300/50',
      };
    case 'community':
      return {
        eyebrow: 'text-violet-300',
        soft: 'bg-violet-300/14 text-violet-200',
        tone: 'from-violet-600 to-fuchsia-500',
        altTone: 'from-emerald-500 to-teal-500',
        lastTone: 'from-sky-500 to-cyan-500',
        hover: 'hover:border-violet-300/50',
      };
    default:
      return {
        eyebrow: 'text-cyan-300',
        soft: 'bg-cyan-300/14 text-cyan-200',
        tone: 'from-sky-500 to-cyan-500',
        altTone: 'from-violet-600 to-fuchsia-500',
        lastTone: 'from-emerald-500 to-teal-500',
        hover: 'hover:border-cyan-300/50',
      };
  }
}

function uniqueFeatureLinks(moduleSlug: string | undefined, featureName: string, groups: Array<{ kind: string; labels: string[]; icon: ReactNode }>, featureSlug?: string) {
  const currentSlug = slugifyWorkspace(featureName);
  const seen = new Set<string>();
  const links: Array<{ kind: string; label: string; href: string; icon: ReactNode }> = [];

  groups.forEach((group) => {
    group.labels.forEach((label) => {
      const slug = slugifyWorkspace(label);
      if (!label || !slug || slug === currentSlug || seen.has(slug)) return;
      seen.add(slug);
      links.push({
        kind: group.kind,
        label,
        href: hrefFor(moduleSlug, label, featureSlug),
        icon: group.icon,
      });
    });
  });

  return links;
}

function FeatureOperationExperience({
  moduleSlug,
  featureSlug,
  moduleName,
  featureName,
  summary,
  capabilities,
  controls,
  output,
  workflow,
  reports,
}: {
  moduleSlug?: string;
  featureSlug?: string;
  moduleName: string;
  featureName: string;
  summary?: string;
  capabilities: string[];
  controls: string[];
  output: string;
  workflow: WorkflowStep[];
  reports: string[];
}) {
  const theme = featureTheme(moduleSlug);
  const nestedFeatureSlug = featureSlug ?? slugifyWorkspace(featureName);
  const pageLinks = uniqueFeatureLinks(moduleSlug, featureName, [
    { kind: 'Work page', labels: capabilities, icon: <FileCheck2 size={18} /> },
    { kind: 'Control page', labels: controls, icon: <ShieldCheck size={18} /> },
    { kind: 'Output page', labels: [output], icon: <Archive size={18} /> },
    { kind: 'Report page', labels: reports, icon: <BarChart3 size={18} /> },
    { kind: 'Workflow page', labels: workflow.map((step) => step.title), icon: <ClipboardCheck size={18} /> },
  ], nestedFeatureSlug);
  const focusPanels = [
    {
      title: 'Workspace Data',
      href: hrefFor(moduleSlug, capabilities[0] ?? featureName, nestedFeatureSlug),
      icon: <FileText size={19} />,
      tone: theme.tone,
      items: capabilities,
    },
    {
      title: 'Controls and Approval',
      href: hrefFor(moduleSlug, controls[0] ?? featureName, nestedFeatureSlug),
      icon: <ShieldCheck size={19} />,
      tone: theme.altTone,
      items: controls,
    },
    {
      title: 'Reports and Archive',
      href: hrefFor(moduleSlug, reports[0] ?? output, nestedFeatureSlug),
      icon: <Archive size={19} />,
      tone: theme.lastTone,
      items: [output, ...reports],
    },
  ];

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A] p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className={`text-xs font-semibold uppercase tracking-widest ${theme.eyebrow}`}>{moduleName}</p>
            <h2 className="mt-1 break-words text-lg font-bold text-white">{featureName} Workspace</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-300">
              {summary ?? `Manage ${featureName.toLowerCase()} records, controls, approvals, reports, and audit evidence.`}
            </p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[.82fr_1.18fr]">
          <div className="relative min-h-64 overflow-hidden rounded-2xl bg-[#08111F] p-4 text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(14,165,233,.28),transparent_32%),radial-gradient(circle_at_82%_22%,rgba(124,58,237,.26),transparent_30%)]" />
            <div className="relative flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className={`text-xs font-semibold uppercase tracking-widest ${theme.eyebrow}`}>Live feature board</p>
                <h3 className="mt-1 break-words text-lg font-bold text-white">{featureName}</h3>
              </div>
              <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${theme.soft} ring-1 ring-white/15`}>
                <ClipboardCheck size={21} />
              </span>
            </div>
            <div className="relative mt-5 space-y-3">
              {workflow.slice(0, 4).map((step, index) => (
                <Link key={step.title} href={hrefFor(moduleSlug, step.title, nestedFeatureSlug)} className="group block rounded-2xl bg-white/8 p-3 ring-1 ring-white/10 transition hover:bg-white/12">
                  <div className="flex items-center justify-between gap-2">
                    <p className="min-w-0 break-words text-xs font-bold text-white">{step.title}</p>
                    <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${theme.tone} text-[10px] font-black text-white`}>{index + 1}</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-300">{step.detail}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="min-w-0 rounded-2xl border border-white/10 bg-white/6 p-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className={`text-xs font-semibold uppercase tracking-widest ${theme.eyebrow}`}>Connected work pages</p>
                <h3 className="mt-1 text-lg font-black text-white">Open related operations</h3>
              </div>
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold text-slate-300">{pageLinks.length} pages</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {pageLinks.map((item) => (
                <Link key={item.href} href={item.href} className={`group min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-white/8 p-3 transition hover:-translate-y-0.5 ${theme.hover} hover:bg-white/12 hover:shadow-sm`}>
                  <div className="flex items-start gap-2">
                    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-2xl ${theme.soft} shadow-sm`}>{item.icon}</span>
                    <div className="min-w-0">
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${theme.eyebrow}`}>{item.kind}</p>
                      <h4 className="mt-1 break-words text-sm font-bold text-white">{item.label}</h4>
                    </div>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-slate-300">Opens its own ERP page with entry, approval, saved records, controls, and reports.</p>
                  <span className={`mt-3 inline-flex items-center gap-1 text-xs font-bold ${theme.eyebrow}`}>
                    Open operation <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        {focusPanels.map((panel) => (
          <section key={panel.title} className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A] shadow-sm">
            <Link href={panel.href} className={`group block bg-gradient-to-br ${panel.tone} p-4 text-white transition hover:brightness-110`}>
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/18 ring-1 ring-white/25">{panel.icon}</span>
              <span className="mt-4 flex min-w-0 items-center gap-2">
                <h2 className="min-w-0 break-words font-bold text-white">{panel.title}</h2>
                <ArrowRight size={14} className="shrink-0 opacity-75 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
              </span>
            </Link>
            <div className="space-y-2 p-4">
              {panel.items.map((item) => (
                <Link key={item} href={hrefFor(moduleSlug, item, nestedFeatureSlug)} className="group flex min-w-0 items-center gap-2 rounded-xl bg-white/8 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/12">
                  <CheckCircle2 size={15} className={`shrink-0 ${theme.eyebrow}`} />
                  <span className="min-w-0 break-words">{item}</span>
                  <ArrowRight size={13} className="ml-auto shrink-0 opacity-0 transition group-hover:opacity-100" />
                </Link>
              ))}
              <Link href={panel.href} className={`inline-flex items-center gap-1 pt-2 text-xs font-bold ${theme.eyebrow}`}>
                Open main section <ArrowRight size={13} />
              </Link>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function Surface({ title, eyebrow, note, children }: { title: string; eyebrow: string; note?: string; children: ReactNode }) {
  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">{eyebrow}</p>
          <h2 className="mt-1 break-words text-lg font-bold text-slate-950">{title}</h2>
          {note && <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">{note}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function StageCard({ index, title, body }: { index: number; title: string; body?: string }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-4">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-aurora text-xs font-bold text-white">{index + 1}</span>
      <h3 className="mt-3 break-words font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 break-words text-xs leading-5 text-slate-500">{body}</p>
    </div>
  );
}

function TimelineRow({ index, title, detail }: { index: number; title: string; detail?: string }) {
  return (
    <div className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-600 text-xs font-bold text-white">{index + 1}</span>
      <div className="min-w-0">
        <h3 className="break-words font-semibold text-slate-900">{title}</h3>
        {detail && <p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p>}
      </div>
    </div>
  );
}

function SkillTile({ label, status, moduleSlug }: { label: string; status: string; moduleSlug?: string }) {
  return (
    <Link href={hrefFor(moduleSlug, label)} className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-brand-300 hover:bg-white">
      <div className="flex items-center justify-between gap-3">
        <h3 className="min-w-0 break-words font-semibold text-slate-900">{label}</h3>
        <span className="rounded-full bg-brand-50 px-2 py-1 text-xs font-medium text-brand-600">{status}</span>
      </div>
      <div className="mt-3 h-2 rounded-full bg-slate-200">
        <div className="h-2 rounded-full bg-aurora" style={{ width: status === 'Checked' ? '82%' : status === 'Delivered' ? '64%' : '42%' }} />
      </div>
    </Link>
  );
}

function CurriculumBand({ title, item, moduleSlug }: { title: string; item: string; moduleSlug?: string }) {
  return (
    <Link href={hrefFor(moduleSlug, item)} className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-brand-300 hover:bg-white">
      <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">{title}</span>
      <h3 className="mt-3 break-words font-semibold text-slate-900">{item}</h3>
      <p className="mt-2 text-xs leading-5 text-slate-500">Version, credit, outcome, and approval rules stay attached to this academic layer.</p>
    </Link>
  );
}

function ReviewLane({ title, item, moduleSlug }: { title: string; item: string; moduleSlug?: string }) {
  return (
    <Link href={hrefFor(moduleSlug, item)} className="min-h-36 min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3 transition hover:border-brand-300 hover:bg-white">
      <p className="rounded-lg bg-white px-2 py-1 text-xs font-semibold text-brand-600 shadow-sm">{title}</p>
      <p className="mt-3 break-words text-sm font-semibold text-slate-900">{item}</p>
      <p className="mt-2 text-xs leading-5 text-slate-500">Owner, due window, evidence rules, and release status are tracked here.</p>
    </Link>
  );
}

function SubmissionReviewVisual() {
  return (
    <div className="relative min-h-64 overflow-hidden rounded-2xl bg-[#08111F] p-4 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(14,165,233,.34),transparent_32%),radial-gradient(circle_at_82%_22%,rgba(124,58,237,.30),transparent_30%)]" />
      <div className="relative flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300/80">Live review board</p>
          <h3 className="mt-1 text-lg font-bold text-white">Collect, mark, release</h3>
        </div>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/10 text-cyan-200 ring-1 ring-white/15">
          <ClipboardCheck size={21} />
        </span>
      </div>
      <div className="relative mt-5 grid gap-3 sm:grid-cols-[.82fr_1.18fr]">
        <div className="rounded-2xl bg-white p-3 text-slate-950 shadow-[0_18px_42px_rgba(2,6,23,.25)]">
          <div className="flex items-center justify-between gap-2">
            <span className="h-2.5 w-20 rounded-full bg-slate-200" />
            <Upload size={18} className="text-sky-500" />
          </div>
          <div className="mt-5 rounded-2xl bg-sky-50 p-4 text-center">
            <Upload size={30} className="mx-auto text-sky-500" />
            <p className="mt-2 text-[11px] font-black text-slate-700">Evidence upload</p>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {['PDF', 'DOC', 'ZIP'].map((item) => (
              <span key={item} className="rounded-xl bg-slate-100 py-2 text-center text-[10px] font-black text-slate-500">{item}</span>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          {['Rubric review', 'Originality check', 'Feedback release'].map((item, index) => (
            <div key={item} className="rounded-2xl bg-white/8 p-3 ring-1 ring-white/10">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-white">{item}</p>
                <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-bold text-cyan-200">{index + 1}</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-white/10">
                <span className="block h-2 rounded-full bg-gradient-to-r from-sky-400 to-cyan-300" style={{ width: `${82 - index * 14}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SubmissionStageTile({ icon, title, detail, href }: { icon: ReactNode; title: string; detail: string; href: string }) {
  return (
    <Link href={href} className="group min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-white/8 p-4 transition hover:-translate-y-0.5 hover:border-cyan-300/50 hover:bg-white/12 hover:shadow-sm">
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-300/14 text-cyan-200 shadow-sm">{icon}</span>
      <h3 className="mt-4 break-words text-sm font-bold text-white">{title}</h3>
      <p className="mt-1 break-words text-xs leading-5 text-slate-300">{detail}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-cyan-200">
        Open <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

function SubmissionFocusPanel({ icon, title, tone, items, moduleSlug }: { icon: ReactNode; title: string; tone: string; items: string[]; moduleSlug?: string }) {
  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A] shadow-sm">
      <div className={`bg-gradient-to-br ${tone} p-4 text-white`}>
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/18 ring-1 ring-white/25">{icon}</span>
        <h2 className="mt-4 break-words font-bold text-white">{title}</h2>
      </div>
      <div className="space-y-2 p-4">
        {items.slice(0, 4).map((item, index) => (
          <Link key={item} href={hrefFor(moduleSlug, item)} className="group flex min-w-0 items-center gap-2 rounded-xl bg-white/8 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/12 hover:text-cyan-200">
            {index === 0 ? <FileCheck2 size={15} className="shrink-0 text-cyan-300" /> : index === 1 ? <PenLine size={15} className="shrink-0 text-cyan-300" /> : index === 2 ? <ShieldCheck size={15} className="shrink-0 text-cyan-300" /> : <Archive size={15} className="shrink-0 text-cyan-300" />}
            <span className="min-w-0 break-words">{item}</span>
            <ArrowRight size={13} className="ml-auto shrink-0 opacity-0 transition group-hover:opacity-100" />
          </Link>
        ))}
      </div>
    </section>
  );
}

function ProcessStep({ index, title, detail }: { index: number; title: string; detail: string }) {
  return (
    <div className="relative min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-4">
      <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">{index + 1}</span>
      <h3 className="mt-3 break-words font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 break-words text-xs leading-5 text-slate-500">{detail}</p>
    </div>
  );
}

function CertificateReleaseVisual() {
  return (
    <div className="relative min-h-64 overflow-hidden rounded-2xl bg-[#08111F] p-4 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(124,58,237,.34),transparent_32%),radial-gradient(circle_at_82%_22%,rgba(20,184,166,.28),transparent_30%)]" />
      <div className="relative flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-300/80">Live certificate board</p>
          <h3 className="mt-1 text-lg font-bold text-white">Issue, approve, verify</h3>
        </div>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/10 text-violet-200 ring-1 ring-white/15">
          <Award size={21} />
        </span>
      </div>
      <div className="relative mt-5 grid gap-3 sm:grid-cols-[.82fr_1.18fr]">
        <div className="rounded-2xl bg-white p-3 text-slate-950 shadow-[0_18px_42px_rgba(2,6,23,.25)]">
          <div className="flex items-center justify-between gap-2">
            <span className="h-2.5 w-20 rounded-full bg-slate-200" />
            <BadgeCheck size={18} className="text-violet-600" />
          </div>
          <div className="mt-5 space-y-2">
            <span className="block h-2 rounded-full bg-slate-200" />
            <span className="block h-2 w-4/5 rounded-full bg-slate-100" />
            <span className="block h-2 w-2/3 rounded-full bg-slate-100" />
          </div>
          <div className="mt-5 flex items-end justify-between gap-3">
            <div className="grid h-14 w-14 grid-cols-3 gap-1 rounded-xl bg-slate-950 p-1.5">
              {Array.from({ length: 9 }).map((_, index) => (
                <span key={index} className={index % 2 === 0 || index === 5 ? 'rounded bg-white' : 'rounded bg-slate-500'} />
              ))}
            </div>
            <span className="grid h-10 w-10 place-items-center rounded-full bg-amber-400 text-slate-950">
              <Award size={19} />
            </span>
          </div>
        </div>
        <div className="space-y-3">
          {['Template lock', 'Approval route', 'QR verification'].map((item, index) => (
            <div key={item} className="rounded-2xl bg-white/8 p-3 ring-1 ring-white/10">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-white">{item}</p>
                <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-bold text-violet-200">{index + 1}</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-white/10">
                <span className="block h-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400" style={{ width: `${82 - index * 14}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CertificateStageTile({ icon, title, detail, href }: { icon: ReactNode; title: string; detail: string; href: string }) {
  return (
    <Link href={href} className="group min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-white/8 p-4 transition hover:-translate-y-0.5 hover:border-violet-300/50 hover:bg-white/12 hover:shadow-sm">
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-violet-300/14 text-violet-200 shadow-sm">{icon}</span>
      <h3 className="mt-4 break-words text-sm font-bold text-white">{title}</h3>
      <p className="mt-1 break-words text-xs leading-5 text-slate-300">{detail}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-violet-200">
        Open <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

function CertificateFocusPanel({ icon, title, tone, items, moduleSlug }: { icon: ReactNode; title: string; tone: string; items: string[]; moduleSlug?: string }) {
  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A] shadow-sm">
      <div className={`bg-gradient-to-br ${tone} p-4 text-white`}>
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/18 ring-1 ring-white/25">{icon}</span>
        <h2 className="mt-4 break-words font-bold text-white">{title}</h2>
      </div>
      <div className="space-y-2 p-4">
        {items.slice(0, 4).map((item, index) => (
          <Link key={item} href={hrefFor(moduleSlug, item)} className="group flex min-w-0 items-center gap-2 rounded-xl bg-white/8 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/12 hover:text-violet-200">
            {index === 0 ? <FileCheck2 size={15} className="shrink-0 text-violet-300" /> : index === 1 ? <PenLine size={15} className="shrink-0 text-violet-300" /> : index === 2 ? <ShieldCheck size={15} className="shrink-0 text-violet-300" /> : <Archive size={15} className="shrink-0 text-violet-300" />}
            <span className="min-w-0 break-words">{item}</span>
            <ArrowRight size={13} className="ml-auto shrink-0 opacity-0 transition group-hover:opacity-100" />
          </Link>
        ))}
      </div>
    </section>
  );
}

function RouteBoard({ capabilities, moduleSlug }: { capabilities: string[]; moduleSlug?: string }) {
  return (
    <div className="grid gap-3 md:grid-cols-[.85fr_1.15fr]">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Coverage</p>
        <div className="mt-4 space-y-3">
          {['Pickup points', 'Stop order', 'Area ownership', 'Capacity rules'].map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm text-slate-700">
              <span className="h-2 w-2 rounded-full bg-aurora" />
              {item}
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-2">
        {capabilities.slice(0, 5).map((item) => (
          <LinkedTile key={item} label={item} moduleSlug={moduleSlug} />
        ))}
      </div>
    </div>
  );
}

function TransportRouteVisual() {
  return (
    <div className="relative min-h-64 overflow-hidden rounded-2xl bg-[#08111F] p-4 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(14,165,233,.34),transparent_32%),radial-gradient(circle_at_82%_22%,rgba(20,184,166,.30),transparent_30%)]" />
      <div className="relative flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300/80">Live dispatch board</p>
          <h3 className="mt-1 text-lg font-bold text-white">Routes, vehicles, trips</h3>
        </div>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/10 text-cyan-200 ring-1 ring-white/15">
          <Bus size={21} />
        </span>
      </div>
      <div className="relative mt-5 grid items-stretch gap-3 sm:grid-cols-[.85fr_1.15fr]">
        <div className="erp-main-visual-frame shadow-[0_16px_38px_rgba(2,6,23,.24)]">
          <img
            src="/images/transport-route-planning-map-rounded.png?v=1"
            alt=""
            className="erp-main-visual-image h-full min-h-48 w-full object-cover object-center"
          />
        </div>
        <div className="space-y-3">
          {['Vehicle readiness', 'Driver duty', 'Trip sheet'].map((item, index) => (
            <div key={item} className="rounded-2xl bg-white/8 p-3 ring-1 ring-white/10">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-white">{item}</p>
                <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-bold text-cyan-200">{index + 1}</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-white/10">
                <span className="block h-2 rounded-full bg-gradient-to-r from-cyan-400 to-teal-300" style={{ width: `${80 - index * 14}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TransportStageTile({ icon, title, detail, href }: { icon: ReactNode; title: string; detail: string; href: string }) {
  return (
    <Link href={href} className="group min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-white/8 p-4 transition hover:-translate-y-0.5 hover:border-cyan-300/50 hover:bg-white/12 hover:shadow-sm">
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-300/14 text-cyan-200 shadow-sm">{icon}</span>
      <h3 className="mt-4 break-words text-sm font-bold text-white">{title}</h3>
      <p className="mt-1 break-words text-xs leading-5 text-slate-300">{detail}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-cyan-200">
        Open <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

function TransportFocusPanel({ icon, title, tone, items, moduleSlug }: { icon: ReactNode; title: string; tone: string; items: string[]; moduleSlug?: string }) {
  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A] shadow-sm">
      <div className={`bg-gradient-to-br ${tone} p-4 text-white`}>
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/18 ring-1 ring-white/25">{icon}</span>
        <h2 className="mt-4 break-words font-bold text-white">{title}</h2>
      </div>
      <div className="space-y-2 p-4">
        {items.slice(0, 4).map((item, index) => (
          <Link key={item} href={hrefFor(moduleSlug, item)} className="group flex min-w-0 items-center gap-2 rounded-xl bg-white/8 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/12 hover:text-cyan-200">
            {index === 0 ? <Gauge size={15} className="shrink-0 text-cyan-300" /> : index === 1 ? <Wrench size={15} className="shrink-0 text-cyan-300" /> : index === 2 ? <Fuel size={15} className="shrink-0 text-cyan-300" /> : <TrafficCone size={15} className="shrink-0 text-cyan-300" />}
            <span className="min-w-0 break-words">{item}</span>
            <ArrowRight size={13} className="ml-auto shrink-0 opacity-0 transition group-hover:opacity-100" />
          </Link>
        ))}
      </div>
    </section>
  );
}

function RoomGrid({ items, moduleSlug }: { items: string[]; moduleSlug?: string }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-4">
      {items.slice(0, 8).map((item, index) => (
        <Link key={item} href={hrefFor(moduleSlug, item)} className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3 transition hover:border-brand-300 hover:bg-white">
          <span className="text-xs font-semibold text-slate-400">Zone {index + 1}</span>
          <p className="mt-2 break-words text-sm font-semibold leading-5 text-slate-900">{item}</p>
          <p className="mt-2 break-words text-xs leading-5 text-slate-500">Capacity, owner, and care status visible.</p>
        </Link>
      ))}
    </div>
  );
}

function HostelResidenceVisual() {
  return (
    <div className="relative min-h-64 overflow-hidden rounded-2xl bg-[#08111F] p-4 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(16,185,129,.34),transparent_32%),radial-gradient(circle_at_82%_20%,rgba(124,58,237,.30),transparent_30%)]" />
      <div className="relative flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-300/80">Live hostel board</p>
          <h3 className="mt-1 text-lg font-bold text-white">Rooms, residents, wardens</h3>
        </div>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/10 text-emerald-200 ring-1 ring-white/15">
          <KeyRound size={21} />
        </span>
      </div>
      <div className="relative mt-5 grid gap-3 sm:grid-cols-[.82fr_1.18fr]">
        <div className="rounded-2xl bg-white/8 p-3 ring-1 ring-white/10">
          <div className="grid grid-cols-3 gap-2">
            {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((room, index) => (
              <span key={room} className={`rounded-xl px-2 py-3 text-center text-[11px] font-bold text-white ${index % 3 === 0 ? 'bg-emerald-400/24' : index % 2 ? 'bg-violet-500/22' : 'bg-white/10'}`}>
                {room}
              </span>
            ))}
          </div>
          <p className="mt-4 text-xs font-semibold text-slate-300">Block occupancy</p>
        </div>
        <div className="space-y-3">
          {['Leave pass', 'Visitor check', 'Care alert'].map((item, index) => (
            <div key={item} className="rounded-2xl bg-white/8 p-3 ring-1 ring-white/10">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-white">{item}</p>
                <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-bold text-emerald-200">{index + 1}</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-white/10">
                <span className="block h-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-300" style={{ width: `${78 - index * 16}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HostelStageTile({ icon, title, detail, href }: { icon: ReactNode; title: string; detail: string; href: string }) {
  return (
    <Link href={href} className="group min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-white/8 p-4 transition hover:-translate-y-0.5 hover:border-emerald-300/50 hover:bg-white/12 hover:shadow-sm">
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-300/14 text-emerald-200 shadow-sm">{icon}</span>
      <h3 className="mt-4 break-words text-sm font-bold text-white">{title}</h3>
      <p className="mt-1 break-words text-xs leading-5 text-slate-300">{detail}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-emerald-200">
        Open <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

function HostelFocusPanel({ icon, title, tone, items, moduleSlug }: { icon: ReactNode; title: string; tone: string; items: string[]; moduleSlug?: string }) {
  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A] shadow-sm">
      <div className={`bg-gradient-to-br ${tone} p-4 text-white`}>
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/18 ring-1 ring-white/25">{icon}</span>
        <h2 className="mt-4 break-words font-bold text-white">{title}</h2>
      </div>
      <div className="space-y-2 p-4">
        {items.slice(0, 4).map((item) => (
          <Link key={item} href={hrefFor(moduleSlug, item)} className="group flex min-w-0 items-center gap-2 rounded-xl bg-white/8 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/12 hover:text-emerald-200">
            <CheckCircle2 size={15} className="shrink-0 text-emerald-300" />
            <span className="min-w-0 break-words">{item}</span>
            <ArrowRight size={13} className="ml-auto shrink-0 opacity-0 transition group-hover:opacity-100" />
          </Link>
        ))}
      </div>
    </section>
  );
}

function CatalogPanel({ title, items, moduleSlug }: { title: string; items: string[]; moduleSlug?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <Link key={item} href={hrefFor(moduleSlug, item)} className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition hover:text-brand-600">
            <FileText size={14} />
            {item}
          </Link>
        ))}
      </div>
    </div>
  );
}

function LibraryShelfVisual() {
  return (
    <div className="relative min-h-64 overflow-hidden rounded-2xl bg-[#08111F] p-4 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(20,184,166,.34),transparent_32%),radial-gradient(circle_at_80%_26%,rgba(124,58,237,.28),transparent_30%)]" />
      <div className="relative flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300/80">Live shelf map</p>
          <h3 className="mt-1 text-lg font-bold text-white">Catalogue, issue, return</h3>
        </div>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/10 text-cyan-200 ring-1 ring-white/15">
          <Library size={21} />
        </span>
      </div>
      <div className="relative mt-5 grid gap-3 sm:grid-cols-[.8fr_1.2fr]">
        <div className="rounded-2xl bg-white/8 p-3 ring-1 ring-white/10">
          <div className="grid grid-cols-4 gap-2">
            {['h-20', 'h-24', 'h-16', 'h-28'].map((height, index) => (
              <span key={`${height}-${index}`} className={`block ${height} rounded-xl ${index % 2 ? 'bg-violet-500' : 'bg-teal-400'}`} />
            ))}
          </div>
          <p className="mt-4 text-xs font-semibold text-slate-300">Resource shelf</p>
        </div>
        <div className="space-y-3">
          {['Issue and return', 'Reservations', 'Overdue tracking'].map((item, index) => (
            <div key={item} className="rounded-2xl bg-white/8 p-3 ring-1 ring-white/10">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-white">{item}</p>
                <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-bold text-cyan-200">{index + 1}</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-white/10">
                <span className="block h-2 rounded-full bg-gradient-to-r from-teal-400 to-cyan-300" style={{ width: `${78 - index * 14}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LibraryStageTile({ icon, title, detail, href }: { icon: ReactNode; title: string; detail: string; href: string }) {
  return (
    <Link href={href} className="group min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-white/8 p-4 transition hover:-translate-y-0.5 hover:border-teal-300/50 hover:bg-white/12 hover:shadow-sm">
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-teal-300/14 text-teal-200 shadow-sm">{icon}</span>
      <h3 className="mt-4 break-words text-sm font-bold text-white">{title}</h3>
      <p className="mt-1 break-words text-xs leading-5 text-slate-300">{detail}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-cyan-200">
        Open <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

function LibraryFocusPanel({ icon, title, tone, items, moduleSlug }: { icon: ReactNode; title: string; tone: string; items: string[]; moduleSlug?: string }) {
  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A] shadow-sm">
      <div className={`bg-gradient-to-br ${tone} p-4 text-white`}>
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/18 ring-1 ring-white/25">{icon}</span>
        <h2 className="mt-4 break-words font-bold text-white">{title}</h2>
      </div>
      <div className="space-y-2 p-4">
        {items.slice(0, 4).map((item) => (
          <Link key={item} href={hrefFor(moduleSlug, item)} className="group flex min-w-0 items-center gap-2 rounded-xl bg-white/8 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/12 hover:text-cyan-200">
            <CheckCircle2 size={15} className="shrink-0 text-cyan-300" />
            <span className="min-w-0 break-words">{item}</span>
            <ArrowRight size={13} className="ml-auto shrink-0 opacity-0 transition group-hover:opacity-100" />
          </Link>
        ))}
      </div>
    </section>
  );
}

function ServiceLane({ title, items, moduleSlug }: { title: string; items: string[]; moduleSlug?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <div className="mt-3 space-y-2">
        {(items.length ? items : ['Owner queue', 'Service notes']).map((item) => (
          <LinkedTile key={item} label={item} moduleSlug={moduleSlug} />
        ))}
      </div>
    </div>
  );
}

function SupportDeskVisual() {
  return (
    <div className="relative min-h-64 overflow-hidden rounded-2xl bg-[#08111F] p-4 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(14,165,233,.34),transparent_32%),radial-gradient(circle_at_80%_22%,rgba(20,184,166,.28),transparent_28%)]" />
      <div className="relative flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300/80">Live service desk</p>
          <h3 className="mt-1 text-lg font-bold text-white">Tickets, SLA, owners</h3>
        </div>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/10 text-cyan-200 ring-1 ring-white/15">
          <Headphones size={21} />
        </span>
      </div>
      <div className="relative mt-5 grid gap-3 sm:grid-cols-[.82fr_1.18fr]">
        <div className="rounded-2xl bg-white/8 p-3 ring-1 ring-white/10">
          <div className="grid grid-cols-2 gap-2">
            {['New', 'Open', 'SLA', 'Done'].map((item, index) => (
              <span key={item} className={`rounded-xl px-2 py-3 text-center text-[11px] font-bold text-white ${index === 2 ? 'bg-amber-400/20' : 'bg-cyan-300/12'}`}>
                {item}
              </span>
            ))}
          </div>
          <p className="mt-4 text-xs font-semibold text-slate-300">Queue status</p>
        </div>
        <div className="space-y-3">
          {['Student issue', 'Parent request', 'Department case'].map((item, index) => (
            <div key={item} className="rounded-2xl bg-white/8 p-3 ring-1 ring-white/10">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-white">{item}</p>
                <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-bold text-cyan-200">{index + 1}</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-white/10">
                <span className="block h-2 rounded-full bg-gradient-to-r from-cyan-400 to-teal-300" style={{ width: `${76 - index * 15}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SupportStageTile({ icon, title, detail, href }: { icon: ReactNode; title: string; detail: string; href: string }) {
  return (
    <Link href={href} className="group min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-white/8 p-4 transition hover:-translate-y-0.5 hover:border-cyan-300/50 hover:bg-white/12 hover:shadow-sm">
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-300/14 text-cyan-200 shadow-sm">{icon}</span>
      <h3 className="mt-4 break-words text-sm font-bold text-white">{title}</h3>
      <p className="mt-1 break-words text-xs leading-5 text-slate-300">{detail}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-cyan-200">
        Open <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

function SupportFocusPanel({ icon, title, tone, items, moduleSlug }: { icon: ReactNode; title: string; tone: string; items: string[]; moduleSlug?: string }) {
  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A] shadow-sm">
      <div className={`bg-gradient-to-br ${tone} p-4 text-white`}>
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/18 ring-1 ring-white/25">{icon}</span>
        <h2 className="mt-4 break-words font-bold text-white">{title}</h2>
      </div>
      <div className="space-y-2 p-4">
        {items.slice(0, 4).map((item) => (
          <Link key={item} href={hrefFor(moduleSlug, item)} className="group flex min-w-0 items-center gap-2 rounded-xl bg-white/8 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/12 hover:text-cyan-200">
            <CheckCircle2 size={15} className="shrink-0 text-cyan-300" />
            <span className="min-w-0 break-words">{item}</span>
            <ArrowRight size={13} className="ml-auto shrink-0 opacity-0 transition group-hover:opacity-100" />
          </Link>
        ))}
      </div>
    </section>
  );
}

function EventStack({ items, moduleSlug }: { items: string[]; moduleSlug?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="font-semibold text-slate-900">Engagement Calendar</h3>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <Link key={item} href={hrefFor(moduleSlug, item)} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:text-brand-600">
            {item}
            <ArrowRight size={14} />
          </Link>
        ))}
      </div>
    </div>
  );
}

function CommunityBroadcastVisual() {
  return (
    <div className="relative min-h-64 overflow-hidden rounded-2xl bg-slate-950 p-4 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(124,58,237,.44),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(20,184,166,.34),transparent_30%)]" />
      <div className="relative flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/55">Live community board</p>
          <h3 className="mt-1 text-lg font-bold text-white">Groups, posts, events</h3>
        </div>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/12 ring-1 ring-white/15">
          <Megaphone size={21} />
        </span>
      </div>
      <div className="relative mt-5 grid gap-3 sm:grid-cols-[.86fr_1.14fr]">
        <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/10">
          <div className="flex -space-x-2">
            {['ST', 'FC', 'AL', 'CL'].map((item, index) => (
              <span key={item} className={`grid h-10 w-10 place-items-center rounded-full border-2 border-slate-950 text-xs font-bold text-white ${index % 2 ? 'bg-emerald-500' : 'bg-violet-600'}`}>
                {item}
              </span>
            ))}
          </div>
          <p className="mt-4 text-xs font-semibold text-white/75">Member spaces</p>
          <div className="mt-3 space-y-2">
            <span className="block h-2 rounded-full bg-white/20" />
            <span className="block h-2 w-2/3 rounded-full bg-white/20" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="community-light-card rounded-2xl bg-white p-3 text-slate-900">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-sky-50 text-sky-600">
                <CalendarDays size={17} />
              </span>
              <div>
                <p className="text-xs font-bold text-slate-950">Event schedule</p>
                <p className="text-[11px] text-slate-500">Publish and invite</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/10">
            <p className="text-xs font-semibold text-white/70">Poll response</p>
            <div className="mt-3 h-2 rounded-full bg-white/15">
              <span className="block h-2 w-3/4 rounded-full bg-gradient-to-r from-violet-400 to-cyan-300" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CommunityStudioTile({ icon, title, detail, href }: { icon: ReactNode; title: string; detail: string; href: string }) {
  return (
    <Link href={href} className="community-light-card group min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-brand-300 hover:bg-white hover:shadow-sm">
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-brand-600 shadow-sm">{icon}</span>
      <h3 className="mt-4 break-words text-sm font-bold text-slate-950">{title}</h3>
      <p className="mt-1 break-words text-xs leading-5 text-slate-500">{detail}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-brand-600">
        Open <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

function HigherEdQuickCard({
  icon,
  title,
  detail,
  href,
  tone,
}: {
  icon: ReactNode;
  title: string;
  detail: string;
  href: string;
  tone: 'cyan' | 'violet';
}) {
  const toneClasses = tone === 'cyan'
    ? { icon: 'text-cyan-200', link: 'text-cyan-200' }
    : { icon: 'text-violet-200', link: 'text-violet-200' };

  return (
    <Link
      href={href}
      className="group flex min-w-0 items-start gap-3 rounded-xl border border-white/10 bg-white/8 p-3 transition hover:-translate-y-0.5 hover:bg-white/12 sm:block sm:rounded-2xl sm:p-4"
    >
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/12 sm:h-10 sm:w-10 sm:rounded-2xl ${toneClasses.icon}`}>
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block break-words text-sm font-bold leading-tight text-white">{title}</span>
        <span className="mt-1 block break-words text-[11px] leading-4 text-slate-300 sm:text-xs sm:leading-5">{detail}</span>
        <span className={`mt-2 hidden items-center gap-1 text-xs font-bold sm:inline-flex ${toneClasses.link}`}>
          Open page <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
        </span>
      </span>
    </Link>
  );
}

function CommunityVisualPanel({ moduleSlug, icon, title, tone, items }: { moduleSlug?: string; icon: ReactNode; title: string; tone: string; items: string[] }) {
  return (
    <section className="community-light-card min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className={`bg-gradient-to-br ${tone} p-4 text-white`}>
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/18 ring-1 ring-white/25">{icon}</span>
        <h2 className="mt-4 break-words font-bold text-white">{title}</h2>
      </div>
      <div className="space-y-2 p-4">
        {items.slice(0, 4).map((item) => (
          <Link key={item} href={hrefFor(moduleSlug, item)} className="community-light-card group flex min-w-0 items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700 transition hover:border-brand-300 hover:bg-white hover:text-brand-700">
            <CheckCircle2 size={15} className="shrink-0 text-brand-600" />
            <span className="min-w-0 break-words">{item}</span>
            <ArrowRight size={13} className="ml-auto shrink-0 text-slate-400 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
          </Link>
        ))}
      </div>
    </section>
  );
}

function KnowledgeBase({ items, moduleSlug }: { items: string[]; moduleSlug?: string }) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-400">Search guides, policies, workflows, contacts...</div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.slice(0, 6).map((item) => (
          <LinkedTile key={item} label={item} moduleSlug={moduleSlug} />
        ))}
      </div>
    </div>
  );
}

function LinkedList({ title, items, moduleSlug }: { title: string; items: string[]; moduleSlug?: string }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="break-words font-semibold text-slate-900">{title}</h3>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <Link key={item} href={hrefFor(moduleSlug, item)} className="group flex min-w-0 items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:text-brand-600">
            <span className="h-2 w-2 shrink-0 rounded-full bg-aurora" />
            <span className="min-w-0 break-words">{item}</span>
            <ArrowRight size={14} className="ml-auto shrink-0 text-slate-400 opacity-0 transition group-hover:opacity-100" />
          </Link>
        ))}
      </div>
    </div>
  );
}

function LinkedTile({ label, moduleSlug }: { label: string; moduleSlug?: string }) {
  return (
    <Link href={hrefFor(moduleSlug, label)} className="group flex min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm transition hover:border-brand-400 hover:bg-white">
      <span className="h-2 w-2 rounded-full bg-aurora shrink-0" />
      <span className="min-w-0 break-words font-medium text-slate-700">{label}</span>
      <ArrowRight size={14} className="ml-auto shrink-0 text-slate-400 opacity-0 transition group-hover:opacity-100" />
    </Link>
  );
}

function CompactBoard({ title, items, moduleSlug }: { title: string; items: string[]; moduleSlug?: string }) {
  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:rounded-2xl sm:p-5">
      <h2 className="break-words text-sm font-semibold leading-snug text-slate-900 sm:text-base">{title}</h2>
      <div className="mt-2 space-y-1.5 sm:mt-3 sm:space-y-2">
        {items.slice(0, 5).map((item) => (
          <Link key={item} href={hrefFor(moduleSlug, item)} className="group flex min-w-0 items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-2 text-xs text-slate-700 transition hover:bg-white hover:text-brand-600 sm:px-3 sm:text-sm">
            <CheckCircle2 size={13} className="shrink-0 text-brand-600 sm:size-3.5" />
            <span className="min-w-0 break-words">{item}</span>
            <ArrowRight size={13} className="ml-auto shrink-0 text-slate-400 opacity-0 transition group-hover:opacity-100" />
          </Link>
        ))}
      </div>
    </section>
  );
}

function StackPanel({ title, items, controls, moduleSlug }: { title: string; items: string[]; controls: string[]; moduleSlug?: string }) {
  return (
    <Surface title={title} eyebrow="Control desk" note="Focused controls, expected output, and audit-ready management records.">
      <Checklist items={items} moduleSlug={moduleSlug} />
      <ControlStrip items={controls.slice(0, 4)} moduleSlug={moduleSlug} />
    </Surface>
  );
}

function SecurityPanel({ title, items, moduleSlug }: { title: string; items: string[]; moduleSlug?: string }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-600">
          <ShieldCheck size={18} />
        </span>
        <h2 className="font-semibold text-slate-900">{title}</h2>
      </div>
      <div className="mt-4 space-y-2">
        {items.slice(0, 5).map((item) => (
          <Link key={item} href={hrefFor(moduleSlug, item)} className="group flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition hover:border-brand-300 hover:bg-white hover:text-brand-600">
            <Settings2 size={14} className="text-brand-600" />
            <span className="min-w-0 flex-1 break-words">{item}</span>
            <ArrowRight size={13} className="shrink-0 text-slate-400 opacity-0 transition group-hover:opacity-100" />
          </Link>
        ))}
      </div>
    </section>
  );
}

function Checklist({ items, moduleSlug }: { items: string[]; moduleSlug?: string }) {
  return (
    <div className="space-y-2">
      {items.slice(0, 6).map((item) => (
        <Link key={item} href={hrefFor(moduleSlug, item)} className="group flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition hover:border-brand-300 hover:bg-white hover:text-brand-600">
          <CheckCircle2 size={15} className="text-brand-600" />
          <span className="min-w-0 flex-1 break-words">{item}</span>
          <ArrowRight size={13} className="shrink-0 text-slate-400 opacity-0 transition group-hover:opacity-100" />
        </Link>
      ))}
    </div>
  );
}

function ControlStrip({ items, moduleSlug }: { items: string[]; moduleSlug?: string }) {
  if (!items.length) return null;

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {items.map((item) => (
        <Link key={item} href={hrefFor(moduleSlug, item)} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:border-brand-300 hover:text-brand-600">
          {item}
        </Link>
      ))}
    </div>
  );
}
