export interface WorkspaceStat {
  label: string;
  value: string;
  note?: string;
}

export interface WorkspaceSection {
  title: string;
  summary: string;
  items: string[];
  controls: string[];
  output: string;
}

export interface WorkspaceWorkflow {
  title: string;
  detail: string;
}

export interface MainWorkspace {
  slug: string;
  href: string;
  title: string;
  eyebrow: string;
  description: string;
  stats: WorkspaceStat[];
  workflow: WorkspaceWorkflow[];
  quickActions: string[];
  reports: string[];
  sections: WorkspaceSection[];
}

export interface WorkspaceFeature {
  title: string;
  summary: string;
  items: string[];
  controls: string[];
  output: string;
  sectionTitle: string;
}

export function slugifyWorkspace(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const SCHOOL_WORKSPACE: MainWorkspace = {
  slug: 'school',
  href: '/school',
  title: 'School ERP',
  eyebrow: 'K-12 operations',
  description: 'A complete school operating workspace for admissions, student records, classes, attendance, exams, fees, guardians, transport, hostel, library, and support.',
  stats: [
    { label: 'School desk', value: 'Complete', note: 'Admissions to reports' },
    { label: 'Academic flow', value: 'Structured', note: 'Classes, timetable, exams' },
    { label: 'Guardian touchpoints', value: 'Connected', note: 'Alerts and records' },
    { label: 'Campus services', value: 'Managed', note: 'Fees, transport, hostel, library' },
  ],
  workflow: [
    { title: 'Enroll', detail: 'Capture enquiries, applications, guardian details, documents, and admission decisions.' },
    { title: 'Organize', detail: 'Place students into classes and sections, assign teachers, and prepare timetable structure.' },
    { title: 'Operate', detail: 'Run attendance, homework, behaviour notes, fees, campus services, and parent communication.' },
    { title: 'Report', detail: 'Publish marks, report cards, promotion decisions, service summaries, and management reports.' },
  ],
  quickActions: ['New admission', 'Add student', 'Assign class', 'Parent notice', 'Mark attendance', 'Create exam', 'Collect fee', 'Issue receipt'],
  reports: ['Admissions register', 'Class strength report', 'Guardian communication report', 'Attendance summary', 'Report card pack', 'Fee collection report', 'Campus service summary'],
  sections: [
    {
      title: 'Admissions and SIS',
      summary: 'Controls the full school admission journey and keeps the student information system clean.',
      items: ['Enquiry capture', 'Application review', 'Guardian profile', 'Document verification', 'Admission decision'],
      controls: ['Admission number rule', 'Document checklist', 'Seat capacity', 'Guardian consent'],
      output: 'Student admission file',
    },
    {
      title: 'Student Records',
      summary: 'Maintains profiles, health notes, behaviour records, transfer certificates, and promotion history.',
      items: ['Student profile', 'Health record', 'Discipline note', 'Transfer certificate', 'Promotion history'],
      controls: ['Profile validation', 'Roll number lock', 'Access permission', 'Archive rule'],
      output: 'Student master register',
    },
    {
      title: 'Academics and Classes',
      summary: 'Organizes classes, sections, teacher allocation, timetable planning, curriculum coverage, and homework.',
      items: ['Class setup', 'Section allocation', 'Teacher assignment', 'Timetable planning', 'Homework board'],
      controls: ['Class capacity', 'Teacher workload', 'Timetable lock', 'Curriculum mapping'],
      output: 'Class operations plan',
    },
    {
      title: 'Parent and Guardian Portal',
      summary: 'Keeps parent communication, guardian contacts, consent forms, meetings, alerts, and student follow-up organized.',
      items: ['Parent dashboard', 'Guardian contacts', 'Meeting requests', 'Consent forms', 'Student updates', 'Message history'],
      controls: ['Guardian access', 'Message template', 'Consent approval', 'Meeting slots', 'Notification rule'],
      output: 'Parent communication log',
    },
    {
      title: 'Attendance and Behaviour',
      summary: 'Tracks daily attendance, late arrivals, leave requests, conduct notes, alerts, and house activity.',
      items: ['Daily attendance', 'Late arrivals', 'Leave requests', 'Parent alerts', 'House activity'],
      controls: ['Attendance threshold', 'Alert rule', 'Leave approval', 'Conduct review'],
      output: 'Attendance behaviour report',
    },
    {
      title: 'Exams and Report Cards',
      summary: 'Manages exam schedules, gradebook entry, marks approval, report cards, and promotion decisions.',
      items: ['Exam schedule', 'Gradebook entry', 'Marks approval', 'Report card publish', 'Promotion decision'],
      controls: ['Mark entry lock', 'Grade scale', 'Result approval', 'Publish permission'],
      output: 'Report card pack',
    },
    {
      title: 'Fees and Campus Services',
      summary: 'Connects school fee invoices, receipts, concessions, balances, transport, hostel, library, and service access.',
      items: ['Fee invoices', 'Payment collection', 'Receipt register', 'Fee concessions', 'Outstanding balances', 'Transport routes', 'Hostel rooms', 'Library circulation'],
      controls: ['Fee category', 'Payment approval', 'Concession rule', 'Receipt lock', 'Route capacity', 'Service access'],
      output: 'Campus fee and service summary',
    },
  ],
};

const COLLEGE_WORKSPACE: MainWorkspace = {
  slug: 'colleges',
  href: '/colleges',
  title: 'College ERP',
  eyebrow: 'Higher education operations',
  description: 'A complete college workspace for admissions, students, lecturers, departments, semesters, fees, placements, scholarships, and outcome reporting.',
  stats: [
    { label: 'College desk', value: 'Complete', note: 'Admissions to outcomes' },
    { label: 'Departments', value: 'Structured', note: 'Programs and semesters' },
    { label: 'Lecturer flow', value: 'Mapped', note: 'Courses and workload' },
    { label: 'Finance', value: 'Controlled', note: 'Fees and scholarships' },
  ],
  workflow: [
    { title: 'Admit', detail: 'Capture applications, merit lists, counseling rounds, document checks, and seat decisions.' },
    { title: 'Allocate', detail: 'Place students into programs, departments, semesters, cohorts, and lecturer-owned courses.' },
    { title: 'Operate', detail: 'Run lecture loads, attendance, assessments, submissions, fees, scholarships, and student services.' },
    { title: 'Report', detail: 'Export outcomes, placement reports, fee summaries, lecturer workload, and accreditation evidence.' },
  ],
  quickActions: ['New admission', 'Add student', 'Add lecturer', 'Create program', 'Collect fee', 'Scholarship review', 'Open placement drive'],
  reports: ['Student roll register', 'Lecturer workload report', 'Semester attendance report', 'Fee collection report', 'Scholarship summary', 'Placement outcome report'],
  sections: [
    {
      title: 'Admissions and Enrollment',
      summary: 'Controls the college intake journey from applications to enrollment confirmation.',
      items: ['Application pipeline', 'Merit list tracking', 'Counseling rounds', 'Document verification', 'Seat matrix'],
      controls: ['Admission quota', 'Merit rule', 'Document checklist', 'Seat lock'],
      output: 'College enrollment file',
    },
    {
      title: 'Students and Semester Records',
      summary: 'Maintains roll numbers, student profiles, semester allocation, mentoring, scholarships, and academic status.',
      items: ['Student profile', 'Roll number', 'Semester section', 'Mentor record', 'Scholarship note'],
      controls: ['Roll number lock', 'Semester promotion', 'Mentor access', 'Scholarship approval'],
      output: 'College student master register',
    },
    {
      title: 'Lecturers and Departments',
      summary: 'Organizes lecturer profiles, course ownership, departments, workload, office hours, and substitution plans.',
      items: ['Lecturer profile', 'Department allocation', 'Course ownership', 'Lecture load', 'Office hours'],
      controls: ['Workload limit', 'Department access', 'Course assignment', 'Substitute rule'],
      output: 'Lecturer workload sheet',
    },
    {
      title: 'Programs and Assessments',
      summary: 'Handles program catalogues, credit structures, semester calendars, internal marks, and outcome mapping.',
      items: ['Program catalogue', 'Credit plan', 'Semester calendar', 'Internal marks', 'Outcome mapping'],
      controls: ['Credit rule', 'Calendar lock', 'Mark approval', 'Outcome version'],
      output: 'Program assessment pack',
    },
    {
      title: 'Fees and Student Services',
      summary: 'Connects tuition invoices, scholarships, installments, receipts, hostel, transport, library, and support access.',
      items: ['Tuition ledger', 'Payment collection', 'Scholarship review', 'Installment plan', 'Receipt register', 'Hostel access', 'Library access'],
      controls: ['Fee category', 'Scholarship approval', 'Receipt lock', 'Service clearance'],
      output: 'College finance and service summary',
    },
  ],
};

const UNIVERSITY_WORKSPACE: MainWorkspace = {
  slug: 'university',
  href: '/university',
  title: 'University ERP',
  eyebrow: 'Multi-campus governance',
  description: 'A university operating workspace for student registry, lecturers, faculties, registrar operations, fees, research, compliance, housing, and transcripts.',
  stats: [
    { label: 'University desk', value: 'Complete', note: 'Registrar to reports' },
    { label: 'Faculties', value: 'Governed', note: 'Departments and schools' },
    { label: 'Lecturers', value: 'Coordinated', note: 'Courses and advising' },
    { label: 'Receivables', value: 'Tracked', note: 'Fees and balances' },
  ],
  workflow: [
    { title: 'Register', detail: 'Manage student IDs, enrollment records, course registration, credit transfers, and programme ownership.' },
    { title: 'Coordinate', detail: 'Connect faculties, departments, lecturers, cohorts, lecture load, advising, and academic calendars.' },
    { title: 'Control', detail: 'Run exams, transcripts, fees, scholarships, housing, compliance, and research administration.' },
    { title: 'Govern', detail: 'Publish registrar reports, compliance packs, lecturer workload, financial receivables, and graduation audit outputs.' },
  ],
  quickActions: ['Add student', 'Add lecturer', 'Course registration', 'Collect fee', 'Transcript request', 'Graduation audit', 'Compliance evidence'],
  reports: ['Student registry report', 'Lecturer workload report', 'Course registration report', 'Receivables report', 'Transcript queue', 'Compliance evidence pack'],
  sections: [
    {
      title: 'Student Registry',
      summary: 'Maintains student IDs, enrollment records, programme cohorts, academic standing, advising, and registrar status.',
      items: ['Student ID profile', 'Enrollment record', 'Programme cohort', 'Academic standing', 'Advisor notes'],
      controls: ['Student ID lock', 'Registrar approval', 'Cohort access', 'Academic status rule'],
      output: 'University student registry',
    },
    {
      title: 'Lecturers and Academic Affairs',
      summary: 'Coordinates lecturer profiles, faculty workload, course ownership, research supervision, office hours, and advising.',
      items: ['Lecturer profile', 'Faculty workload', 'Course ownership', 'Research supervision', 'Office hours'],
      controls: ['Workload policy', 'Faculty access', 'Course owner rule', 'Advising permission'],
      output: 'Faculty workload and advising sheet',
    },
    {
      title: 'Registrar Operations',
      summary: 'Controls course registration, credit transfer, exam approvals, transcripts, graduation audit, and record locks.',
      items: ['Course registration', 'Credit transfer', 'Exam approval', 'Transcript request', 'Graduation audit'],
      controls: ['Registration window', 'Credit approval', 'Transcript lock', 'Graduation rule'],
      output: 'Registrar operations pack',
    },
    {
      title: 'Fees and Receivables',
      summary: 'Tracks tuition, invoices, scholarships, waivers, receipts, student balances, housing charges, and finance reports.',
      items: ['Tuition ledger', 'Invoice schedule', 'Scholarship review', 'Waiver approval', 'Receipt register', 'Open balance'],
      controls: ['Fee plan', 'Scholarship policy', 'Waiver approval', 'Receipt lock'],
      output: 'University receivables report',
    },
    {
      title: 'Research and Compliance',
      summary: 'Manages grants, ethics approvals, publication evidence, accreditation packs, senate workflows, and audit records.',
      items: ['Grant record', 'Ethics approval', 'Publication evidence', 'Accreditation pack', 'Senate workflow'],
      controls: ['Ethics gate', 'Funding access', 'Evidence checklist', 'Senate approval'],
      output: 'Research and compliance pack',
    },
  ],
};

const INSTITUTE_WORKSPACE: MainWorkspace = {
  slug: 'institutes',
  href: '/institutes',
  title: 'Institute ERP',
  eyebrow: 'Training center operations',
  description: 'A professional institute workspace for leads, admissions, course batches, trainers, learning delivery, assessments, revenue, certificates, branches, and support.',
  stats: [
    { label: 'Lead flow', value: 'Tracked', note: 'Enquiry to admission' },
    { label: 'Batch delivery', value: 'Managed', note: 'Courses and trainers' },
    { label: 'Learner progress', value: 'Measured', note: 'Attendance and assessments' },
    { label: 'Revenue desk', value: 'Connected', note: 'Payments and certificates' },
  ],
  workflow: [
    { title: 'Capture', detail: 'Collect enquiries, demo bookings, counselling notes, eligibility, and admission intent.' },
    { title: 'Convert', detail: 'Move leads into course batches with fee plans, trainer allocation, and learning access.' },
    { title: 'Deliver', detail: 'Run sessions, attendance, assessments, assignments, progress reviews, and trainer worklogs.' },
    { title: 'Close', detail: 'Clear payments, approve completion, issue certificates, and review branch performance.' },
  ],
  quickActions: ['Capture enquiry', 'Book demo class', 'Create batch', 'Assign trainer', 'Record payment', 'Issue certificate'],
  reports: ['Lead conversion report', 'Batch progress report', 'Trainer workload report', 'Revenue collection report', 'Certificate readiness report', 'Branch performance report'],
  sections: [
    {
      title: 'Lead and Enrollment CRM',
      summary: 'Handles enquiries, counselling, demo classes, follow-ups, admission conversion, and enrollment proof.',
      items: ['Enquiry capture', 'Counselling notes', 'Demo class booking', 'Follow-up pipeline', 'Admission conversion'],
      controls: ['Lead source', 'Follow-up SLA', 'Counsellor owner', 'Admission checklist'],
      output: 'Enrollment conversion file',
    },
    {
      title: 'Course and Batch Delivery',
      summary: 'Builds courses, batches, schedules, session plans, attendance rules, and learner progress tracking.',
      items: ['Course catalogue', 'Batch schedule', 'Session planner', 'Learner attendance', 'Progress tracker'],
      controls: ['Batch capacity', 'Schedule lock', 'Attendance rule', 'Course visibility'],
      output: 'Batch delivery plan',
    },
    {
      title: 'Trainer Operations',
      summary: 'Coordinates trainer calendars, workload, resource requests, replacement planning, and performance notes.',
      items: ['Trainer calendar', 'Workload allocation', 'Resource request', 'Replacement planning', 'Trainer performance'],
      controls: ['Trainer availability', 'Workload limit', 'Resource approval', 'Replacement rule'],
      output: 'Trainer operations sheet',
    },
    {
      title: 'Assessment and Submissions',
      summary: 'Controls assignments, practical tasks, tests, rubric review, feedback release, and remedial plans.',
      items: ['Assignment task', 'Practical test', 'Rubric review', 'Feedback release', 'Remedial plan'],
      controls: ['Submission window', 'Evaluator access', 'Pass mark rule', 'Feedback lock'],
      output: 'Learner assessment file',
    },
    {
      title: 'Revenue and Certification',
      summary: 'Connects invoices, discounts, installments, payment reminders, completion approval, and certificates.',
      items: ['Invoice plan', 'Discount approval', 'Installment tracker', 'Payment reminders', 'Certificate release'],
      controls: ['Discount rule', 'Payment clearance', 'Completion lock', 'Certificate template'],
      output: 'Revenue certification pack',
    },
    {
      title: 'Branch and Support',
      summary: 'Tracks branch dashboards, resource booking, support tickets, campaign outcomes, and renewal pipelines.',
      items: ['Branch dashboard', 'Resource booking', 'Support tickets', 'Campaign report', 'Renewal pipeline'],
      controls: ['Branch access', 'Resource capacity', 'Ticket SLA', 'Renewal owner'],
      output: 'Branch support report',
    },
  ],
};

export const MAIN_WORKSPACES: MainWorkspace[] = [
  SCHOOL_WORKSPACE,
  COLLEGE_WORKSPACE,
  UNIVERSITY_WORKSPACE,
  INSTITUTE_WORKSPACE,
  {
    slug: 'internship',
    href: '/internship',
    title: 'Internship',
    eyebrow: 'Career readiness',
    description: 'A placement office workspace for internships, industry partners, student eligibility, supervisor reviews, and completion evidence.',
    stats: [
      { label: 'Placement flow', value: 'Structured', note: 'Eligibility to completion' },
      { label: 'Partner CRM', value: 'Managed', note: 'Companies and mentors' },
      { label: 'Progress logs', value: 'Reviewed', note: 'Student and supervisor updates' },
      { label: 'Completion', value: 'Approved', note: 'Evidence-based closure' },
    ],
    workflow: [
      { title: 'Prepare', detail: 'Define eligibility, internship terms, partner requirements, and student readiness checklist.' },
      { title: 'Place', detail: 'Match students with organizations, supervisors, role descriptions, and approval owners.' },
      { title: 'Monitor', detail: 'Track weekly logs, mentor feedback, attendance evidence, and risk notes.' },
      { title: 'Certify', detail: 'Approve completion, archive documents, and issue internship completion records.' },
    ],
    quickActions: ['Register partner', 'Create placement drive', 'Assign supervisor', 'Request weekly log', 'Approve completion'],
    reports: ['Placement pipeline', 'Partner performance', 'Pending supervisor reviews', 'Completion evidence pack'],
    sections: [
      {
        title: 'Placement Pipeline',
        summary: 'Controls the full student journey from eligibility to organization matching.',
        items: ['Internship requests', 'Eligibility review', 'Company matching', 'Offer letters'],
        controls: ['Eligibility rules', 'Approval routing', 'Owner assignment', 'Document checklist'],
        output: 'Placement approval pack',
      },
      {
        title: 'Partner Management',
        summary: 'Keeps industry partners, mentor contacts, vacancies, and agreements organized.',
        items: ['Company directory', 'Mentor contacts', 'Vacancy tracker', 'MoU documents'],
        controls: ['Partner status', 'Validity dates', 'Contact ownership', 'Agreement storage'],
        output: 'Partner readiness register',
      },
      {
        title: 'Progress Tracking',
        summary: 'Monitors internship delivery through logs, reviews, feedback, and completion decisions.',
        items: ['Weekly logs', 'Supervisor review', 'Performance notes', 'Completion approval'],
        controls: ['Review cycles', 'Risk flags', 'Feedback release', 'Evidence archive'],
        output: 'Completion verification file',
      },
    ],
  },
  {
    slug: 'training',
    href: '/training',
    title: 'Training',
    eyebrow: 'Skill development',
    description: 'A training delivery workspace for batches, trainers, sessions, attendance, resources, assessments, and progress reviews.',
    stats: [
      { label: 'Batch model', value: 'Planned', note: 'Capacity and calendar aligned' },
      { label: 'Trainer load', value: 'Balanced', note: 'Availability and allocation' },
      { label: 'Delivery', value: 'Tracked', note: 'Sessions and attendance' },
      { label: 'Skills', value: 'Measured', note: 'Assessments and feedback' },
    ],
    workflow: [
      { title: 'Plan', detail: 'Create batches, learning outcomes, capacity, trainer needs, and delivery calendar.' },
      { title: 'Deliver', detail: 'Run sessions with trainer allocation, resource sharing, and attendance capture.' },
      { title: 'Assess', detail: 'Evaluate practical tasks, skill checks, feedback, and learner progress.' },
      { title: 'Improve', detail: 'Publish progress reports, identify gaps, and schedule follow-up sessions.' },
    ],
    quickActions: ['Create batch', 'Assign trainer', 'Schedule session', 'Upload resources', 'Publish progress'],
    reports: ['Batch delivery summary', 'Trainer workload', 'Attendance gaps', 'Skill progress report'],
    sections: [
      {
        title: 'Batch Planning',
        summary: 'Builds training calendars, learner batches, capacity plans, and session structures.',
        items: ['Training calendar', 'Batch allocation', 'Session timetable', 'Capacity planning'],
        controls: ['Capacity limits', 'Session owners', 'Calendar locks', 'Batch status'],
        output: 'Training delivery plan',
      },
      {
        title: 'Delivery',
        summary: 'Coordinates trainer activity, class materials, attendance, and delivery evidence.',
        items: ['Trainer assignment', 'Attendance capture', 'Resource sharing', 'Class recordings'],
        controls: ['Trainer availability', 'Attendance policy', 'Resource permissions', 'Session proof'],
        output: 'Session delivery record',
      },
      {
        title: 'Assessment',
        summary: 'Tracks practical tasks, skill checks, trainer feedback, and progress summaries.',
        items: ['Skill checks', 'Practical tasks', 'Trainer feedback', 'Progress reports'],
        controls: ['Rubrics', 'Review deadlines', 'Result publishing', 'Remedial flags'],
        output: 'Learner progress report',
      },
    ],
  },
  {
    slug: 'programmes',
    href: '/programmes',
    title: 'Programmes',
    eyebrow: 'Academic catalogue',
    description: 'A programme administration workspace for catalogues, curriculum versions, eligibility rules, approvals, departments, and outcomes.',
    stats: [
      { label: 'Catalogue', value: 'Governed', note: 'Programme and course structure' },
      { label: 'Curriculum', value: 'Versioned', note: 'Controlled academic changes' },
      { label: 'Eligibility', value: 'Defined', note: 'Entry and progression rules' },
      { label: 'Compliance', value: 'Audited', note: 'Evidence and approvals' },
    ],
    workflow: [
      { title: 'Design', detail: 'Define programme structure, departments, credits, duration, and eligibility rules.' },
      { title: 'Approve', detail: 'Route curriculum changes through academic owners and governance checks.' },
      { title: 'Publish', detail: 'Release approved programme versions to admissions, training, and certification workflows.' },
      { title: 'Review', detail: 'Track outcomes, compliance evidence, and periodic programme improvement.' },
    ],
    quickActions: ['Create programme', 'Update curriculum', 'Set eligibility', 'Route approval', 'Publish catalogue'],
    reports: ['Programme catalogue', 'Curriculum change log', 'Eligibility matrix', 'Outcome mapping report'],
    sections: [
      {
        title: 'Programme Setup',
        summary: 'Defines the official programme catalogue, course structure, eligibility, and intake rules.',
        items: ['Programme catalogue', 'Course structure', 'Eligibility rules', 'Intake capacity'],
        controls: ['Department owner', 'Version status', 'Admission visibility', 'Approval gate'],
        output: 'Published programme profile',
      },
      {
        title: 'Curriculum',
        summary: 'Maintains curriculum versions, credit maps, elective groups, and outcome alignment.',
        items: ['Curriculum versions', 'Credit mapping', 'Elective groups', 'Outcome mapping'],
        controls: ['Version control', 'Credit rules', 'Outcome matrix', 'Change approvals'],
        output: 'Curriculum governance pack',
      },
      {
        title: 'Governance',
        summary: 'Manages academic approval, ownership, compliance documents, and programme reporting.',
        items: ['Approval workflow', 'Department ownership', 'Compliance files', 'Programme reports'],
        controls: ['Committee review', 'Audit history', 'Document evidence', 'Review cycle'],
        output: 'Accreditation-ready record',
      },
    ],
  },
  {
    slug: 'submissions',
    href: '/submissions',
    title: 'Submissions',
    eyebrow: 'Academic evidence',
    description: 'A submission management workspace for assignments, projects, internship reports, document evidence, evaluator review, and feedback release.',
    stats: [
      { label: 'Submission flow', value: 'Organized', note: 'Upload to archive' },
      { label: 'Evaluation', value: 'Rubric-led', note: 'Consistent review criteria' },
      { label: 'Integrity', value: 'Checked', note: 'Policy and originality status' },
      { label: 'Feedback', value: 'Released', note: 'Learner-facing outcomes' },
    ],
    workflow: [
      { title: 'Collect', detail: 'Open submission windows, collect files, and validate required evidence.' },
      { title: 'Evaluate', detail: 'Assign evaluators, rubrics, comments, originality checks, and revision rules.' },
      { title: 'Approve', detail: 'Confirm marks, feedback, late cases, and exception decisions.' },
      { title: 'Archive', detail: 'Publish feedback and preserve evidence for audits, certificates, and reports.' },
    ],
    quickActions: ['Create submission task', 'Assign evaluator', 'Open revision', 'Publish feedback', 'Export evidence'],
    reports: ['Submission status', 'Late submissions', 'Evaluator workload', 'Evidence archive'],
    sections: [
      {
        title: 'Submission Desk',
        summary: 'Captures academic work, project files, internship evidence, and required documents.',
        items: ['Assignment uploads', 'Project reports', 'Internship reports', 'Document evidence'],
        controls: ['File requirements', 'Submission window', 'Late policy', 'Version history'],
        output: 'Validated submission record',
      },
      {
        title: 'Review Queue',
        summary: 'Routes submissions to evaluators with rubrics, comments, and revision decisions.',
        items: ['Evaluator assignment', 'Rubric marking', 'Plagiarism status', 'Revision requests'],
        controls: ['Evaluator roles', 'Rubric lock', 'Originality check', 'Revision deadline'],
        output: 'Reviewed assessment file',
      },
      {
        title: 'Publishing',
        summary: 'Releases outcomes and keeps complete evidence for audit and progress reporting.',
        items: ['Result posting', 'Feedback release', 'Archive records', 'Submission analytics'],
        controls: ['Release approval', 'Student visibility', 'Archive policy', 'Export permissions'],
        output: 'Published feedback record',
      },
    ],
  },
  {
    slug: 'certificates',
    href: '/certificates',
    title: 'Certificates',
    eyebrow: 'Verified documents',
    description: 'A certificate operations workspace for template control, approval routing, digital verification, print queues, reissue requests, and archives.',
    stats: [
      { label: 'Templates', value: 'Controlled', note: 'Approved layouts and wording' },
      { label: 'Issuing', value: 'Verified', note: 'Eligibility and approval checks' },
      { label: 'Security', value: 'Traceable', note: 'QR and audit history' },
      { label: 'Archive', value: 'Searchable', note: 'Reissue and verification support' },
    ],
    workflow: [
      { title: 'Request', detail: 'Select certificate type, student record, eligibility evidence, and required template.' },
      { title: 'Approve', detail: 'Route through academic or administrative approval with document checks.' },
      { title: 'Issue', detail: 'Generate certificate, apply verification metadata, and prepare print or digital delivery.' },
      { title: 'Verify', detail: 'Store certificate logs, verification events, and reissue history.' },
    ],
    quickActions: ['Issue certificate', 'Create template', 'Approve request', 'Verify certificate', 'Print batch'],
    reports: ['Issue register', 'Pending approvals', 'Template usage', 'Verification log'],
    sections: [
      {
        title: 'Certificate Issuing',
        summary: 'Handles academic, training, internship, and institutional document generation.',
        items: ['Completion certificates', 'Bonafide letters', 'Transfer certificates', 'Internship letters'],
        controls: ['Eligibility rules', 'Template mapping', 'Request validation', 'Issuing owner'],
        output: 'Verified certificate draft',
      },
      {
        title: 'Approval Control',
        summary: 'Keeps document approval, wording, signatures, and QR verification under control.',
        items: ['Template selection', 'Approver routing', 'Digital signatures', 'QR verification'],
        controls: ['Role approvals', 'Signature authority', 'QR status', 'Change log'],
        output: 'Approved certificate file',
      },
      {
        title: 'Archive',
        summary: 'Maintains print batches, reissue requests, verification logs, and certificate reports.',
        items: ['Print queue', 'Reissue requests', 'Verification logs', 'Certificate reports'],
        controls: ['Print lock', 'Reissue reason', 'Access log', 'Retention rules'],
        output: 'Certificate audit archive',
      },
    ],
  },
  {
    slug: 'transport',
    href: '/transport',
    title: 'Transport',
    eyebrow: 'Route operations',
    description: 'A transport operations workspace for routes, stops, vehicles, drivers, pickup assignment, daily trips, incidents, and guardian communication.',
    stats: [
      { label: 'Routes', value: 'Mapped', note: 'Stops and coverage planned' },
      { label: 'Fleet', value: 'Maintained', note: 'Vehicle and driver records' },
      { label: 'Trips', value: 'Monitored', note: 'Daily operations and exceptions' },
      { label: 'Safety', value: 'Logged', note: 'Incidents and checks recorded' },
    ],
    workflow: [
      { title: 'Map', detail: 'Define routes, stops, capacity, pickup points, and rider assignment.' },
      { title: 'Assign', detail: 'Allocate vehicles, drivers, attendants, schedules, and backup plans.' },
      { title: 'Operate', detail: 'Track daily trip sheets, rider status, incidents, and route changes.' },
      { title: 'Report', detail: 'Review fleet use, safety logs, fee links, and service performance.' },
    ],
    quickActions: ['Create route', 'Assign vehicle', 'Add stop', 'Record trip sheet', 'Log incident'],
    reports: ['Route utilization', 'Vehicle maintenance', 'Daily trip sheet', 'Incident summary'],
    sections: [
      {
        title: 'Route Planning',
        summary: 'Designs route coverage, stop order, pickup assignment, and rider capacity.',
        items: ['Route map', 'Stops', 'Pickup assignment', 'Capacity balancing'],
        controls: ['Capacity rules', 'Stop timing', 'Area ownership', 'Route status'],
        output: 'Route operating plan',
      },
      {
        title: 'Fleet',
        summary: 'Manages vehicles, drivers, maintenance schedules, fuel logs, and compliance documents.',
        items: ['Vehicle register', 'Driver assignment', 'Maintenance schedule', 'Fuel logs'],
        controls: ['License validity', 'Maintenance reminders', 'Driver duty', 'Fleet document store'],
        output: 'Fleet readiness register',
      },
      {
        title: 'Operations',
        summary: 'Runs daily trips, transport fee links, incidents, and guardian communication.',
        items: ['Daily trip sheet', 'Transport fees', 'Incident records', 'Guardian notifications'],
        controls: ['Trip confirmation', 'Incident severity', 'Fee category', 'Notification templates'],
        output: 'Daily transport report',
      },
    ],
  },
  {
    slug: 'hostel',
    href: '/hostel',
    title: 'Hostel',
    eyebrow: 'Residential management',
    description: 'A residential operations workspace for rooms, beds, wardens, student care, leave passes, visitors, inventory, fees, and occupancy reports.',
    stats: [
      { label: 'Rooms', value: 'Allocated', note: 'Beds and capacity controlled' },
      { label: 'Student care', value: 'Supervised', note: 'Leave, visitors, and health notes' },
      { label: 'Warden desk', value: 'Assigned', note: 'Responsibility and escalation' },
      { label: 'Occupancy', value: 'Reported', note: 'Residential utilization' },
    ],
    workflow: [
      { title: 'Allocate', detail: 'Assign hostel, room, bed, warden, and resident category.' },
      { title: 'Supervise', detail: 'Manage leave passes, visitors, health notes, and student care follow-up.' },
      { title: 'Operate', detail: 'Track inventory, meal plans, incidents, maintenance, and fee links.' },
      { title: 'Review', detail: 'Publish occupancy, room transfer, care, and administration reports.' },
    ],
    quickActions: ['Allocate room', 'Issue leave pass', 'Register visitor', 'Log incident', 'Review occupancy'],
    reports: ['Occupancy summary', 'Leave pass register', 'Visitor log', 'Hostel administration report'],
    sections: [
      {
        title: 'Accommodation',
        summary: 'Controls room allocation, bed capacity, wardens, and room transfers.',
        items: ['Room allocation', 'Bed capacity', 'Warden assignment', 'Room transfer'],
        controls: ['Capacity rules', 'Resident category', 'Transfer approval', 'Warden ownership'],
        output: 'Room allocation register',
      },
      {
        title: 'Student Care',
        summary: 'Supports residential care through leave passes, visitors, meals, and health notes.',
        items: ['Leave passes', 'Visitor register', 'Meal plans', 'Health notes'],
        controls: ['Guardian approval', 'Visitor ID check', 'Meal category', 'Care alerts'],
        output: 'Resident care log',
      },
      {
        title: 'Administration',
        summary: 'Coordinates hostel fees, inventory, incidents, and management reporting.',
        items: ['Hostel fees', 'Inventory checks', 'Incident records', 'Occupancy reports'],
        controls: ['Fee mapping', 'Stock checks', 'Incident severity', 'Report approval'],
        output: 'Hostel operations pack',
      },
    ],
  },
  {
    slug: 'library',
    href: '/library',
    title: 'Library',
    eyebrow: 'Learning resources',
    description: 'A library operations workspace for cataloguing, circulation, reservations, overdue control, digital resources, and reading engagement.',
    stats: [
      { label: 'Catalogue', value: 'Organized', note: 'Physical and digital resources' },
      { label: 'Circulation', value: 'Controlled', note: 'Issue, return, reservation' },
      { label: 'Overdue', value: 'Tracked', note: 'Rules and reminders' },
      { label: 'Engagement', value: 'Measured', note: 'Reading and usage insights' },
    ],
    workflow: [
      { title: 'Catalogue', detail: 'Register resources, categories, copies, access rules, and digital links.' },
      { title: 'Circulate', detail: 'Manage issue, return, reservations, overdue cases, and fines.' },
      { title: 'Engage', detail: 'Build reading lists, recommend resources, and monitor popular titles.' },
      { title: 'Report', detail: 'Review resource usage, overdue trends, and class reading activity.' },
    ],
    quickActions: ['Add resource', 'Issue book', 'Reserve item', 'Record return', 'Create reading list'],
    reports: ['Catalogue summary', 'Circulation register', 'Overdue report', 'Reading engagement'],
    sections: [
      {
        title: 'Catalogue',
        summary: 'Maintains book records, metadata, categories, copies, and digital resources.',
        items: ['Book records', 'ISBN lookup', 'Categories', 'Digital resources'],
        controls: ['Copy status', 'Resource category', 'Access rules', 'Digital link ownership'],
        output: 'Library catalogue record',
      },
      {
        title: 'Circulation',
        summary: 'Controls issue, return, reservation, overdue tracking, and fine rules.',
        items: ['Issue and return', 'Reservations', 'Overdue tracking', 'Fine rules'],
        controls: ['Borrowing limits', 'Due date policy', 'Reservation priority', 'Fine calculation'],
        output: 'Circulation register',
      },
      {
        title: 'Engagement',
        summary: 'Tracks reading history, popular resources, reading lists, and library analytics.',
        items: ['Reading history', 'Popular titles', 'Class reading lists', 'Library reports'],
        controls: ['Privacy rules', 'List ownership', 'Recommendation tags', 'Report exports'],
        output: 'Learning resource insight',
      },
    ],
  },
  {
    slug: 'support',
    href: '/support',
    title: 'Support',
    eyebrow: 'Service operations',
    description: 'A service desk workspace for student, staff, parent, and department requests with priorities, ownership, escalation, and quality tracking.',
    stats: [
      { label: 'Intake', value: 'Centralized', note: 'All request channels' },
      { label: 'Ownership', value: 'Assigned', note: 'Team and responsibility' },
      { label: 'SLA', value: 'Monitored', note: 'Priority and escalation' },
      { label: 'Quality', value: 'Reviewed', note: 'Feedback and improvement' },
    ],
    workflow: [
      { title: 'Capture', detail: 'Collect requests from students, staff, parents, and departments.' },
      { title: 'Route', detail: 'Classify request type, priority, owner, and service deadline.' },
      { title: 'Resolve', detail: 'Track internal notes, actions, escalations, and requester communication.' },
      { title: 'Improve', detail: 'Review feedback, issue trends, SLA gaps, and knowledge base needs.' },
    ],
    quickActions: ['Create request', 'Assign owner', 'Escalate case', 'Send update', 'Close request'],
    reports: ['Request summary', 'SLA review', 'Owner performance', 'Issue trend report'],
    sections: [
      {
        title: 'Request Intake',
        summary: 'Centralizes student, staff, parent, and departmental support channels.',
        items: ['Student support', 'Staff requests', 'Parent messages', 'Department issues'],
        controls: ['Request category', 'Priority level', 'Requester type', 'Visibility rules'],
        output: 'Classified service request',
      },
      {
        title: 'Resolution Desk',
        summary: 'Manages owner assignment, priority rules, internal notes, and escalations.',
        items: ['Ticket assignment', 'Priority rules', 'Internal notes', 'Escalations'],
        controls: ['Owner queue', 'SLA timer', 'Escalation path', 'Response templates'],
        output: 'Resolution history',
      },
      {
        title: 'Service Quality',
        summary: 'Tracks SLA health, feedback, issue trends, and service reports.',
        items: ['SLA dashboard', 'Feedback ratings', 'Issue trends', 'Support reports'],
        controls: ['Feedback rules', 'Trend categories', 'SLA exceptions', 'Management exports'],
        output: 'Service improvement report',
      },
    ],
  },
  {
    slug: 'community',
    href: '/community',
    title: 'Community',
    eyebrow: 'Engagement hub',
    description: 'A community engagement workspace for groups, clubs, events, alumni, announcements, discussions, moderation, and feedback.',
    stats: [
      { label: 'Groups', value: 'Curated', note: 'Clubs and communities' },
      { label: 'Events', value: 'Scheduled', note: 'Campus and online activity' },
      { label: 'Communication', value: 'Moderated', note: 'Posts and announcements' },
      { label: 'Engagement', value: 'Analyzed', note: 'Participation and feedback' },
    ],
    workflow: [
      { title: 'Create', detail: 'Set up groups, clubs, memberships, purpose, and moderators.' },
      { title: 'Engage', detail: 'Publish announcements, events, discussions, polls, and feedback forms.' },
      { title: 'Moderate', detail: 'Review posts, membership requests, community rules, and reported content.' },
      { title: 'Measure', detail: 'Analyze participation, reach, feedback, and community outcomes.' },
    ],
    quickActions: ['Create group', 'Publish announcement', 'Schedule event', 'Open poll', 'Review post'],
    reports: ['Community activity', 'Event participation', 'Announcement reach', 'Moderation log'],
    sections: [
      {
        title: 'Groups and Clubs',
        summary: 'Manages student groups, faculty circles, alumni communities, and club memberships.',
        items: ['Student groups', 'Faculty circles', 'Alumni communities', 'Club memberships'],
        controls: ['Membership rules', 'Moderator roles', 'Group visibility', 'Approval queue'],
        output: 'Community directory',
      },
      {
        title: 'Engagement',
        summary: 'Runs announcements, events, discussion boards, polls, and feedback channels.',
        items: ['Announcements', 'Event calendar', 'Discussion boards', 'Polls and feedback'],
        controls: ['Audience targeting', 'Event capacity', 'Post permissions', 'Feedback windows'],
        output: 'Engagement activity feed',
      },
      {
        title: 'Moderation',
        summary: 'Protects community quality through approvals, rules, reports, and analytics.',
        items: ['Post approvals', 'Community rules', 'Member reports', 'Engagement analytics'],
        controls: ['Content review', 'Rule enforcement', 'Report handling', 'Analytics access'],
        output: 'Community governance report',
      },
    ],
  },
  {
    slug: 'help-centre',
    href: '/help-centre',
    title: 'Help Centre',
    eyebrow: 'Knowledge base',
    description: 'A self-service help workspace for guides, FAQs, policies, onboarding steps, troubleshooting articles, and contact paths.',
    stats: [
      { label: 'Knowledge base', value: 'Structured', note: 'Categories and guides' },
      { label: 'Self-service', value: 'Searchable', note: 'FAQ and how-to flow' },
      { label: 'Content', value: 'Versioned', note: 'Approved article changes' },
      { label: 'Adoption', value: 'Measured', note: 'Usage and gaps' },
    ],
    workflow: [
      { title: 'Write', detail: 'Create guides, policy articles, FAQ entries, and onboarding steps.' },
      { title: 'Approve', detail: 'Route content through review, ownership, and publishing checks.' },
      { title: 'Serve', detail: 'Organize categories, search terms, contact paths, and featured guidance.' },
      { title: 'Improve', detail: 'Review usage, failed searches, feedback, and support deflection.' },
    ],
    quickActions: ['Write article', 'Create category', 'Feature guide', 'Review feedback', 'Publish update'],
    reports: ['Article usage', 'Search gaps', 'Feedback summary', 'Content review log'],
    sections: [
      {
        title: 'Knowledge Base',
        summary: 'Organizes articles for students, staff, policies, onboarding, and daily operations.',
        items: ['Getting started', 'Student guides', 'Staff guides', 'Policy articles'],
        controls: ['Category ownership', 'Article status', 'Review cycle', 'Audience access'],
        output: 'Published help article',
      },
      {
        title: 'Self Service',
        summary: 'Provides FAQ, how-to workflows, troubleshooting, and contact directories.',
        items: ['FAQ library', 'How-to workflows', 'Troubleshooting', 'Contact directory'],
        controls: ['Search keywords', 'Escalation route', 'Related articles', 'Contact ownership'],
        output: 'Self-service guide path',
      },
      {
        title: 'Content Control',
        summary: 'Manages approvals, version history, featured guides, and usage analytics.',
        items: ['Article approvals', 'Version history', 'Featured guides', 'Usage analytics'],
        controls: ['Approval owner', 'Version notes', 'Feature schedule', 'Analytics permissions'],
        output: 'Content governance report',
      },
    ],
  },
  {
    slug: 'settings',
    href: '/settings',
    title: 'Settings',
    eyebrow: 'System control',
    description: 'Institution profile, branding, account access, security, academic terminology, and workspace configuration.',
    stats: [
      { label: 'Profile', value: 'Editable', note: 'Institution identity and type' },
      { label: 'Branding', value: 'Controlled', note: 'System colour and name' },
      { label: 'Security', value: 'Protected', note: 'Access and password controls' },
      { label: 'Data', value: 'Scoped', note: 'Institution workspace isolation' },
    ],
    workflow: [
      { title: 'Profile', detail: 'Maintain institution identity, type, contacts, and workspace name.' },
      { title: 'Brand', detail: 'Control visual identity, colours, labels, and institutional presentation.' },
      { title: 'Access', detail: 'Manage accounts, authentication, reset flows, and role visibility.' },
      { title: 'Audit', detail: 'Review system configuration, data ownership, and change safety.' },
    ],
    quickActions: ['Edit institution profile', 'Update brand colour', 'Manage account', 'Reset password', 'Review security'],
    reports: ['Configuration summary', 'Account access review', 'Branding status', 'Security checklist'],
    sections: [
      {
        title: 'Institution Profile',
        summary: 'Controls the institution name, type, code, terminology, and workspace identity.',
        items: ['Profile details', 'Institution type', 'Workspace labels', 'System name'],
        controls: ['Admin approval', 'Terminology mapping', 'Change preview', 'System-wide update'],
        output: 'Institution configuration',
      },
      {
        title: 'Brand and UI',
        summary: 'Manages theme colour, brand display, visible labels, and presentation consistency.',
        items: ['Theme colour', 'Logo area', 'Navigation labels', 'Display preferences'],
        controls: ['Brand lock', 'Preview mode', 'Responsive check', 'Rollback point'],
        output: 'Brand configuration',
      },
      {
        title: 'Security',
        summary: 'Protects login, password reset, account ownership, and session behaviour.',
        items: ['Account profile', 'Password reset', 'Google sign-in', 'Session control'],
        controls: ['Email ownership', 'Provider link', 'Reset validation', 'Session expiry'],
        output: 'Security settings record',
      },
    ],
  },
];

export function getMainWorkspace(slug: string) {
  return MAIN_WORKSPACES.find((workspace) => workspace.slug === slug);
}

export function findWorkspaceFeature(moduleSlug: string, featureSlug: string): WorkspaceFeature | undefined {
  const workspace = getMainWorkspace(moduleSlug);
  if (!workspace) return undefined;

  const buildFeature = (
    title: string,
    section: WorkspaceSection,
    summary?: string,
    items?: string[],
    controls?: string[],
    output?: string,
  ) => ({
    title,
    summary: summary ?? section.summary,
    items: items ?? section.items,
    controls: controls ?? section.controls,
    output: output ?? section.output,
    sectionTitle: section.title,
  });

  for (const section of workspace.sections) {
    if (slugifyWorkspace(section.title) === featureSlug) {
      return buildFeature(section.title, section);
    }

    const item = section.items.find((entry) => slugifyWorkspace(entry) === featureSlug);
    if (item) {
      return buildFeature(item, section);
    }

    const control = section.controls.find((entry) => slugifyWorkspace(entry) === featureSlug);
    if (control) {
      return buildFeature(
        control,
        section,
        `${control} for ${section.title.toLowerCase()} with ownership, validation, audit trail, exceptions, and reporting.`,
        [control, ...section.items].slice(0, 4),
      );
    }

    if (slugifyWorkspace(section.output) === featureSlug) {
      return buildFeature(
        section.output,
        section,
        `${section.output} workspace for saved evidence, approval history, exports, and management review.`,
        [section.output, ...section.items].slice(0, 4),
      );
    }
  }

  const aliasMap: Record<string, Record<string, string>> = {
    submissions: {
      'create-task': 'Create submission task',
      'create-submission': 'Create submission task',
      'upload-submission': 'Assignment uploads',
      'submit-work': 'Assignment uploads',
      'review-submission': 'Review Queue',
      'mark-submission': 'Rubric marking',
      'publish-results': 'Publish feedback',
    },
    certificates: {
      'issue-certificate': 'Issue certificate',
      'create-template': 'Create template',
      'approve-request': 'Approve request',
      'verify-certificate': 'Verify certificate',
      'print-batch': 'Print batch',
    },
    transport: {
      'create-route': 'Create route',
      'assign-vehicle': 'Assign vehicle',
      'add-stop': 'Add stop',
      'record-trip-sheet': 'Record trip sheet',
      'log-incident': 'Log incident',
      'route-planning': 'Route Planning',
      'fleet-control': 'Fleet',
      'daily-operations': 'Operations',
      'safety-and-incidents': 'Incident records',
    },
    hostel: {
      'allocate-room': 'Allocate room',
      'issue-leave-pass': 'Issue leave pass',
      'register-visitor': 'Register visitor',
      'log-incident': 'Log incident',
      'review-occupancy': 'Review occupancy',
      'visitors-and-movement': 'Visitor register',
    },
    library: {
      'add-resource': 'Add resource',
      'issue-book': 'Issue book',
      'reserve-item': 'Reserve item',
      'record-return': 'Record return',
      'create-reading-list': 'Create reading list',
      'reading-engagement': 'Engagement',
      'overdue-and-fines': 'Overdue tracking',
    },
    support: {
      'create-request': 'Create request',
      'assign-owner': 'Assign owner',
      'escalate-case': 'Escalate case',
      'send-update': 'Send update',
      'close-request': 'Close request',
    },
    community: {
      'create-group': 'Create group',
      'publish-announcement': 'Publish announcement',
      announcement: 'Publish announcement',
      'schedule-event': 'Schedule event',
      'open-poll': 'Open poll',
      'review-post': 'Review post',
      reports: 'Community activity',
    },
    'help-centre': {
      'write-article': 'Write article',
      'create-category': 'Create category',
      'feature-guide': 'Feature guide',
      'review-feedback': 'Review feedback',
      'publish-update': 'Publish update',
    },
  };

  const aliasTitle = aliasMap[moduleSlug]?.[featureSlug];
  if (aliasTitle) {
    const aliasSlug = slugifyWorkspace(aliasTitle);
    if (aliasSlug !== featureSlug) {
      const aliasFeature = findWorkspaceFeature(moduleSlug, aliasSlug);
      if (aliasFeature) return { ...aliasFeature, title: aliasTitle };
    }
  }

  const allSections = workspace.sections;
  const allItems = allSections.flatMap((section) => section.items);
  const allControls = allSections.flatMap((section) => section.controls);
  const firstSection = allSections[0];
  if (!firstSection) return undefined;

  const sectionForLabel = (label: string): WorkspaceSection => {
    const normalized = slugifyWorkspace(label);
    return (
      allSections.find((section) => slugifyWorkspace(section.title) === normalized) ??
      allSections.find((section) => section.items.some((item) => normalized.includes(slugifyWorkspace(item)) || slugifyWorkspace(item).includes(normalized))) ??
      allSections.find((section) => section.controls.some((control) => normalized.includes(slugifyWorkspace(control)) || slugifyWorkspace(control).includes(normalized))) ??
      firstSection
    );
  };

  const operationLabel = [...workspace.quickActions, ...workspace.reports].find((entry) => slugifyWorkspace(entry) === featureSlug);
  if (operationLabel && firstSection) {
    const section = sectionForLabel(operationLabel);
    const isReport = workspace.reports.some((report) => slugifyWorkspace(report) === featureSlug);
    const isCreate = /^create|^add|^register|^issue|^assign|^publish|^record|^log|^review|^open|^print|^reserve|^allocate|^schedule|^send|^close|^escalate/i.test(operationLabel);
    return buildFeature(
      operationLabel,
      section,
      isReport
        ? `${operationLabel} workspace with filters, saved records, export-ready evidence, approval status, and audit trail.`
        : `${operationLabel} workflow for ${workspace.title.toLowerCase()} with guided entry, ownership, controls, approval status, and record history.`,
      isReport
        ? [operationLabel, section.output, ...workspace.reports.filter((report) => report !== operationLabel)].slice(0, 4)
        : [operationLabel, ...section.items, ...allItems].filter((item, index, list) => list.indexOf(item) === index).slice(0, 4),
      [operationLabel, ...section.controls, ...allControls].filter((item, index, list) => list.indexOf(item) === index).slice(0, 4),
      isReport ? operationLabel : section.output,
    );
  }

  if (firstSection && featureSlug.endsWith('-report')) {
    const title = featureSlug
      .split('-')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
    const section = sectionForLabel(title);
    return buildFeature(
      title,
      section,
      `${title} workspace with real saved records, status summaries, filters, exports, and management-ready review.`,
      [title, section.output, ...workspace.reports].slice(0, 4),
      ['Export permissions', 'Audit history', ...section.controls].slice(0, 4),
      title,
    );
  }

  return undefined;
}
