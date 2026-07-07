export type InstitutionType = 'SCHOOL' | 'COLLEGE' | 'UNIVERSITY' | 'INSTITUTE';

export interface AcademicStructureDefaults {
  className: string;
  grade: string;
  sections: string[];
}

export interface InstitutionTerminology {
  type: InstitutionType;
  learner: string;
  learners: string;
  educator: string;
  educators: string;
  group: string;
  groups: string;
  section: string;
  sections: string;
  structure: string;
  setupTitle: string;
  setupStructure: string;
  addLearner: string;
  addEducator: string;
  attendanceLabel: string;
  resultLabel: string;
  examLabel: string;
  feeLabel: string;
  outstandingLabel: string;
  idLabel: string;
  nav: Record<string, string>;
  defaults: AcademicStructureDefaults;
}

const TERMS: Record<InstitutionType, InstitutionTerminology> = {
  SCHOOL: {
    type: 'SCHOOL',
    learner: 'Student',
    learners: 'Students',
    educator: 'Teacher',
    educators: 'Teachers',
    group: 'Class',
    groups: 'Classes',
    section: 'Section',
    sections: 'Sections',
    structure: 'Classes & Sections',
    setupTitle: 'Get your school set up',
    setupStructure: 'Create a class & section',
    addLearner: 'Add Student',
    addEducator: 'Add Teacher',
    attendanceLabel: 'Attendance today',
    resultLabel: 'Avg result',
    examLabel: 'Exams',
    feeLabel: 'Fees collected',
    outstandingLabel: 'Outstanding',
    idLabel: 'Adm. No',
    nav: {
      '/students': 'Students',
      '/teachers': 'Teachers',
      '/classes': 'Classes',
      '/curriculum': 'Curriculum',
      '/parents': 'Parents',
      '/hostel': 'Hostel',
      '/reports': 'Analytics',
    },
    defaults: { className: 'Grade 1', grade: '1', sections: ['1-A', '1-B'] },
  },
  COLLEGE: {
    type: 'COLLEGE',
    learner: 'Student',
    learners: 'Students',
    educator: 'Faculty',
    educators: 'Faculty',
    group: 'Program',
    groups: 'Programs',
    section: 'Semester Section',
    sections: 'Semester Sections',
    structure: 'Programs & Semesters',
    setupTitle: 'Get your college set up',
    setupStructure: 'Create a program & semester',
    addLearner: 'Add Student',
    addEducator: 'Add Faculty',
    attendanceLabel: 'Attendance today',
    resultLabel: 'Avg outcome',
    examLabel: 'Assessments',
    feeLabel: 'Fee collection',
    outstandingLabel: 'Dues',
    idLabel: 'Roll No',
    nav: {
      '/students': 'Students',
      '/teachers': 'Faculty',
      '/classes': 'Programs',
      '/curriculum': 'Courses',
      '/parents': 'Guardians',
      '/hostel': 'Hostel',
      '/reports': 'Outcome Analytics',
    },
    defaults: { className: 'Year 1 Program', grade: 'Y1', sections: ['Semester 1 · Section A', 'Semester 1 · Section B'] },
  },
  UNIVERSITY: {
    type: 'UNIVERSITY',
    learner: 'Student',
    learners: 'Students',
    educator: 'Faculty Member',
    educators: 'Faculty',
    group: 'Program',
    groups: 'Programs',
    section: 'Cohort',
    sections: 'Cohorts',
    structure: 'Programs & Cohorts',
    setupTitle: 'Get your university set up',
    setupStructure: 'Create a program & cohort',
    addLearner: 'Add Student',
    addEducator: 'Add Faculty',
    attendanceLabel: 'Engagement today',
    resultLabel: 'Avg GPA trend',
    examLabel: 'Assessments',
    feeLabel: 'Receivables',
    outstandingLabel: 'Open balance',
    idLabel: 'Student ID',
    nav: {
      '/students': 'Student Records',
      '/teachers': 'Faculty',
      '/classes': 'Programs',
      '/curriculum': 'Courses',
      '/parents': 'Advising',
      '/hostel': 'Housing',
      '/reports': 'Institutional Analytics',
    },
    defaults: { className: 'Undergraduate Program', grade: 'UG', sections: ['Semester 1 · Cohort A', 'Semester 1 · Cohort B'] },
  },
  INSTITUTE: {
    type: 'INSTITUTE',
    learner: 'Learner',
    learners: 'Learners',
    educator: 'Trainer',
    educators: 'Trainers',
    group: 'Course',
    groups: 'Courses',
    section: 'Batch',
    sections: 'Batches',
    structure: 'Courses & Batches',
    setupTitle: 'Get your institute set up',
    setupStructure: 'Create a course & batch',
    addLearner: 'Add Learner',
    addEducator: 'Add Trainer',
    attendanceLabel: 'Attendance today',
    resultLabel: 'Avg score',
    examLabel: 'Tests',
    feeLabel: 'Revenue collected',
    outstandingLabel: 'Pending dues',
    idLabel: 'Learner ID',
    nav: {
      '/students': 'Learners',
      '/teachers': 'Trainers',
      '/classes': 'Courses & Batches',
      '/curriculum': 'Course Catalog',
      '/parents': 'Contacts',
      '/hostel': 'Facilities',
      '/reports': 'Business Analytics',
    },
    defaults: { className: 'Foundation Course', grade: 'FC', sections: ['Batch A', 'Batch B'] },
  },
};

export function normalizeInstitutionType(type?: string | null): InstitutionType {
  const normalized = (type || 'SCHOOL').toUpperCase();
  return ['SCHOOL', 'COLLEGE', 'UNIVERSITY', 'INSTITUTE'].includes(normalized)
    ? normalized as InstitutionType
    : 'SCHOOL';
}

export function getInstitutionTerminology(type?: string | null) {
  return TERMS[normalizeInstitutionType(type)];
}

export function getAcademicStructureDefaults(type?: string | null) {
  return getInstitutionTerminology(type).defaults;
}
