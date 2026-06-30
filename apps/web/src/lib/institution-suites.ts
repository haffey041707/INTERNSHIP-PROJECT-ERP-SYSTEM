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
      { title: 'Student Lifecycle', items: ['Enquiry to admission', 'Student profile', 'Guardian records', 'Health and conduct notes'] },
      { title: 'Academic Operations', items: ['Class and section setup', 'Timetable planning', 'Lesson coverage', 'Homework and assignments'] },
      { title: 'Attendance and Assessment', items: ['Daily attendance', 'Exam schedules', 'Gradebook entries', 'Report card publishing'] },
      { title: 'Campus Services', items: ['Fee invoices', 'Transport routes', 'Hostel rooms', 'Library circulation'] },
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
      { title: 'Admissions and Enrollment', items: ['Application pipeline', 'Merit list tracking', 'Counseling rounds', 'Document verification'] },
      { title: 'Programs and Semesters', items: ['Departments', 'Course credits', 'Elective groups', 'Semester timetables'] },
      { title: 'Student Services', items: ['Scholarship records', 'Fee installments', 'Hostel allocation', 'Transport passes'] },
      { title: 'Outcomes', items: ['Internal marks', 'Placement drives', 'Alumni records', 'Accreditation reports'] },
    ],
  },
  {
    href: '/university',
    type: 'UNIVERSITY',
    title: 'University ERP',
    shortTitle: 'University',
    eyebrow: 'Multi-campus governance',
    description: 'A university operating model for faculties, registrar work, research, compliance, housing, and transcripts.',
    highlights: ['Faculties', 'Registrar', 'Research', 'Compliance', 'Transcripts', 'Housing'],
    stats: [
      { label: 'Governance areas', value: '14' },
      { label: 'Registrar flows', value: '28' },
      { label: 'Research records', value: '40' },
      { label: 'Compliance packs', value: '9' },
    ],
    sections: [
      { title: 'Structure and Governance', items: ['Campuses', 'Faculties', 'Schools and departments', 'Program ownership'] },
      { title: 'Registrar Operations', items: ['Enrollment', 'Credit transfer', 'Exam control', 'Transcript requests'] },
      { title: 'Research and Compliance', items: ['Grant records', 'Ethics approvals', 'Publications', 'Accreditation evidence'] },
      { title: 'Student Experience', items: ['Advising', 'Scholarships', 'Housing', 'Library and support desks'] },
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
      { title: 'Lead and Course Sales', items: ['Enquiry capture', 'Course catalog', 'Follow-ups', 'Demo class booking'] },
      { title: 'Batch Delivery', items: ['Batch schedules', 'Trainer allocation', 'Attendance', 'Assignments and tests'] },
      { title: 'Revenue and Certification', items: ['Invoices', 'Discounts', 'Installments', 'Certificates'] },
      { title: 'Branch Operations', items: ['Branch dashboards', 'Resource booking', 'Help desk tickets', 'Campaign reports'] },
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
