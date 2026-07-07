export interface InstitutionSuite {
  href: string;
  type: 'SCHOOL' | 'COLLEGE' | 'UNIVERSITY' | 'INSTITUTE';
  title: string;
  shortTitle: string;
  eyebrow: string;
  description: string;
  highlights: string[];
  stats: Array<{ label: string; value: string }>;
  sections: Array<{ title: string; items: string[] }>;
}

export const institutionSuites: InstitutionSuite[] = [
  {
    href: '/school',
    type: 'SCHOOL',
    title: 'School ERP',
    shortTitle: 'School',
    eyebrow: 'K-12 operations',
    description: 'A complete school workspace for admissions, academics, attendance, fees, guardians, and campus services.',
    highlights: ['Admissions', 'Classroom planning', 'Attendance', 'Report cards', 'Guardians', 'Transport'],
    stats: [
      { label: 'Core modules', value: '18' },
      { label: 'Daily workflows', value: '52' },
      { label: 'Parent touchpoints', value: '12' },
      { label: 'Campus services', value: '8' },
    ],
    sections: [
      { title: 'Admissions and SIS', items: ['Enquiry to admission', 'Student profile', 'Guardian records', 'Document checklist', 'Transfer certificates'] },
      { title: 'Academic Operations', items: ['Class and section setup', 'Timetable planning', 'Lesson coverage', 'Homework and assignments', 'Substitution planning'] },
      { title: 'Attendance and Behavior', items: ['Daily attendance', 'Late arrival tracking', 'Conduct notes', 'Parent alerts', 'House activities'] },
      { title: 'Assessment and Reports', items: ['Exam schedules', 'Gradebook entries', 'Report card publishing', 'Promotion rules', 'Performance analytics'] },
      { title: 'Campus Services', items: ['Fee invoices', 'Transport routes', 'Hostel rooms', 'Library circulation', 'Help desk tickets'] },
    ],
  },
  {
    href: '/colleges',
    type: 'COLLEGE',
    title: 'College ERP',
    shortTitle: 'Colleges',
    eyebrow: 'Higher education operations',
    description: 'A college suite for admissions, departments, semesters, credit plans, fee control, placements, and alumni.',
    highlights: ['Merit lists', 'Semesters', 'Credits', 'Placements', 'Scholarships', 'Alumni'],
    stats: [
      { label: 'Departments', value: '12' },
      { label: 'Programs', value: '34' },
      { label: 'Semester flows', value: '16' },
      { label: 'Outcome reports', value: '22' },
    ],
    sections: [
      { title: 'Admissions and Enrollment', items: ['Application pipeline', 'Merit list tracking', 'Counseling rounds', 'Document verification', 'Seat matrix'] },
      { title: 'Programs and Departments', items: ['Department setup', 'Program catalog', 'Course credits', 'Elective groups', 'Academic calendar'] },
      { title: 'Semester Operations', items: ['Semester sections', 'Timetable planning', 'Faculty workload', 'Internal assessments', 'Attendance shortage'] },
      { title: 'Student Services', items: ['Scholarship records', 'Fee installments', 'Hostel allocation', 'Transport passes', 'Mentor meetings'] },
      { title: 'Outcomes and Placements', items: ['Outcome mapping', 'Placement drives', 'Internship tracking', 'Alumni records', 'Accreditation reports'] },
    ],
  },
  {
    href: '/university',
    type: 'UNIVERSITY',
    title: 'University ERP',
    shortTitle: 'University',
    eyebrow: 'Multi-campus governance',
    description: 'A university operating model for faculties, registrar work, research, compliance, housing, and transcripts.',
    highlights: ['Campuses', 'Faculties', 'Registrar', 'Research', 'Compliance', 'Transcripts', 'Housing'],
    stats: [
      { label: 'Governance areas', value: '14' },
      { label: 'Registrar flows', value: '28' },
      { label: 'Research records', value: '40' },
      { label: 'Compliance packs', value: '9' },
    ],
    sections: [
      { title: 'Governance and Campuses', items: ['Campus registry', 'Faculty hierarchy', 'Schools and departments', 'Program ownership', 'Senate workflows'] },
      { title: 'Registrar Operations', items: ['Enrollment records', 'Credit transfer', 'Course registration', 'Exam control', 'Transcript requests'] },
      { title: 'Academic Affairs', items: ['Program outcomes', 'Curriculum versions', 'Faculty workload', 'Academic calendar', 'Graduation audit'] },
      { title: 'Research Administration', items: ['Grant records', 'Ethics approvals', 'Publications', 'Research milestones', 'Funding reports'] },
      { title: 'Compliance and Student Life', items: ['Accreditation evidence', 'Scholarships', 'Housing', 'Library services', 'Support desk cases'] },
    ],
  },
  {
    href: '/institutes',
    type: 'INSTITUTE',
    title: 'Institute ERP',
    shortTitle: 'Institutes',
    eyebrow: 'Training center operations',
    description: 'An institute suite for leads, course batches, trainers, memberships, certificates, branches, and support.',
    highlights: ['Leads', 'Batches', 'Trainers', 'Certificates', 'Branches', 'Support'],
    stats: [
      { label: 'Course flows', value: '20' },
      { label: 'Batch actions', value: '45' },
      { label: 'Revenue controls', value: '15' },
      { label: 'Branch tools', value: '10' },
    ],
    sections: [
      { title: 'Lead and Enrollment CRM', items: ['Enquiry capture', 'Course catalog', 'Follow-ups', 'Demo class booking', 'Admission conversion'] },
      { title: 'Course and Batch Delivery', items: ['Batch schedules', 'Trainer allocation', 'Learner attendance', 'Assignments and tests', 'Session recordings'] },
      { title: 'Trainer Operations', items: ['Trainer calendar', 'Workload tracking', 'Resource requests', 'Performance notes', 'Replacement planning'] },
      { title: 'Revenue and Certification', items: ['Invoices', 'Discounts', 'Installments', 'Payment reminders', 'Certificates'] },
      { title: 'Branch and Support', items: ['Branch dashboards', 'Resource booking', 'Help desk tickets', 'Campaign reports', 'Renewal pipelines'] },
    ],
  },
];

export function getInstitutionSuite(href: string) {
  const suite = institutionSuites.find((item) => item.href === href);
  if (!suite) throw new Error(`Unknown institution suite: ${href}`);
  return suite;
}

export function getInstitutionSuiteForType(type?: string | null) {
  const normalized = (type || 'SCHOOL').toUpperCase();
  return institutionSuites.find((item) => item.type === normalized) ?? institutionSuites[0];
}

export function slugifyFeature(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
