import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  ArrowLeft,
  Award,
  BarChart3,
  BedDouble,
  BookOpen,
  BriefcaseBusiness,
  Bus,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Database,
  FileText,
  GraduationCap,
  Headphones,
  KeyRound,
  MapPinned,
  MessageSquare,
  Send,
  ShieldCheck,
  Trash2,
  Upload,
  Users,
} from 'lucide-react';
import { db } from '@/lib/db';
import { findWorkspaceFeature, getMainWorkspace } from '@/lib/main-workspaces';
import { getSession } from '@/lib/session';
import { createModuleRecord, deleteModuleRecord, updateModuleRecordStatus } from '../../../../../actions';

export const dynamic = 'force-dynamic';

const STATUS_FLOW = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'IN_REVIEW', label: 'In Review' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'CLOSED', label: 'Closed' },
];

type ModuleRecordRow = {
  id: string;
  title: string;
  requester: string | null;
  owner: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  details: string | null;
};

type DetailBlock = {
  title: string;
  detail: string;
  items: string[];
  icon: ReactNode;
  tone: string;
};

type DetailProfile = {
  eyebrow: string;
  title: string;
  summary: string;
  icon: ReactNode;
  tone: string;
  formTitle: string;
  titleLabel: string;
  titlePlaceholder: string;
  subjectLabel: string;
  subjectPlaceholder: string;
  ownerLabel: string;
  ownerPlaceholder: string;
  detailsLabel: string;
  detailsPlaceholder: string;
  blocks: DetailBlock[];
  controls: string[];
  outputs: string[];
};

type OptionField = {
  name: string;
  label: string;
  placeholder?: string;
  kind?: 'text' | 'date' | 'textarea' | 'select';
  options?: string[];
  full?: boolean;
  required?: boolean;
};

function metaName(label: string) {
  return `meta_${label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')}`;
}

function field(label: string, placeholder: string, full = false): OptionField {
  return { name: metaName(label), label, placeholder, full };
}

function selectField(label: string, options: string[], full = false): OptionField {
  return { name: metaName(label), label, kind: 'select', options, full };
}

function baseField(name: string, label: string, placeholder: string, full = false, kind: OptionField['kind'] = 'text'): OptionField {
  return { name, label, placeholder, full, kind, required: name === 'title' };
}

function optionFields(moduleSlug: string, featureName: string, sectionName: string, detailName: string, profile: DetailProfile): OptionField[] {
  const context = `${featureName} ${sectionName} ${detailName}`.toLowerCase();
  const has = (...words: string[]) => words.some((word) => context.includes(word));
  const priority = selectField('Priority', ['LOW', 'NORMAL', 'HIGH', 'URGENT']);
  priority.name = 'priority';
  const dueDate = baseField('dueDate', 'Due date', '', false, 'date');

  if (moduleSlug === 'school') {
    const routeText = `${featureName} ${sectionName} ${detailName}`.toLowerCase();
    const featureLower = featureName.toLowerCase();
    const isParentPortal =
      featureLower.includes('parent') ||
      /(parent dashboard|guardian contacts|meeting|consent|student updates|message history|notice|communication)/.test(routeText);

    if (isParentPortal) {
      return [
        baseField('title', 'Parent portal record', `${detailName} message, meeting, consent, alert, or family update`),
        baseField('requester', 'Parent / guardian / student', 'Parent name, guardian contact, student, class, phone, or email'),
        baseField('owner', 'Parent desk owner', 'Class teacher, counsellor, admin desk, principal office, or coordinator'),
        field('Student reference', 'Student name, admission number, class, section, or roll number'),
        field('Communication channel', 'Phone, email, app message, SMS, meeting, or notice board'),
        selectField('Parent page status', ['Draft', 'Sent', 'Acknowledged', 'Meeting booked', 'Consent received', 'Escalated', 'Closed']),
        field('Consent / response', 'Consent type, response note, meeting time, acknowledgement, or escalation'),
        priority,
        dueDate,
        baseField('details', 'Parent communication details', 'Message body, guardian reply, meeting minutes, consent proof, student concern, next action, and staff follow-up.', true, 'textarea'),
      ];
    }
    if (has('admission', 'enquiry', 'application', 'guardian', 'document', 'file')) {
      return [
        baseField('title', 'Admission / student file', `${detailName} for applicant, student, or guardian`),
        baseField('requester', 'Student / guardian', 'Student name, applicant number, guardian, or admission ID'),
        baseField('owner', 'School office owner', 'Admission officer, class teacher, principal office, or records admin'),
        field('Requested class', 'Grade, class, section, academic year, or seat group'),
        field('Guardian proof', 'Parent name, phone, relationship, consent, or ID reference'),
        field('Document status', 'Birth proof, transfer certificate, previous report, missing files'),
        selectField('School admission status', ['Enquiry', 'Applied', 'Document pending', 'Interview', 'Approved', 'Rejected']),
        priority,
        dueDate,
        baseField('details', 'Admission file notes', 'Eligibility, seat decision, guardian communication, document gaps, fee link, and class placement.', true, 'textarea'),
      ];
    }
    if (has('class', 'section', 'teacher', 'timetable', 'homework', 'curriculum')) {
      return [
        baseField('title', 'Class / section operation', `${detailName} class setup, teacher allocation, timetable, or homework item`),
        baseField('requester', 'Class / section / subject', 'Grade, section, subject, house, or student group'),
        baseField('owner', 'Academic owner', 'Class teacher, subject teacher, timetable coordinator, or school admin'),
        field('Room / period', 'Room, period, day, lab, or subject slot'),
        field('Teacher workload', 'Teacher, substitute, number of periods, or conflict note'),
        field('Curriculum / homework', 'Unit, lesson plan, homework title, or coverage target'),
        selectField('Academic status', ['Planning', 'Assigned', 'Published', 'Needs revision', 'Completed']),
        priority,
        dueDate,
        baseField('details', 'Class operations notes', 'Capacity, timetable conflict, homework plan, teacher allocation, parent alert, and follow-up.', true, 'textarea'),
      ];
    }
    if (has('attendance', 'late', 'leave', 'parent', 'behaviour', 'conduct', 'house')) {
      return [
        baseField('title', 'Attendance / behaviour record', `${detailName} attendance, leave, alert, conduct, or house item`),
        baseField('requester', 'Student / class', 'Student, class, section, house, or guardian'),
        baseField('owner', 'Attendance / pastoral owner', 'Class teacher, attendance clerk, discipline office, or house master'),
        field('Attendance session', 'Date, period, day, range, or session'),
        field('Guardian alert', 'Phone, email, alert note, acknowledgement, or escalation'),
        selectField('Attendance decision', ['Present', 'Absent', 'Late', 'Excused', 'Leave approved', 'Follow-up needed']),
        field('Conduct note', 'Merit, warning, incident, house activity, or support action'),
        priority,
        dueDate,
        baseField('details', 'Attendance and conduct details', 'Reason, evidence, parent response, teacher note, intervention, and closure decision.', true, 'textarea'),
      ];
    }
    if (has('exam', 'grade', 'marks', 'report', 'promotion')) {
      return [
        baseField('title', 'Exam / report card record', `${detailName} marks, gradebook, report, or promotion case`),
        baseField('requester', 'Student / class / subject', 'Student, class, exam, subject, section, or roll number'),
        baseField('owner', 'Exam owner', 'Exam coordinator, subject teacher, class teacher, or principal office'),
        field('Exam and subject', 'Term, paper, subject, exam room, or assessment type'),
        field('Marks / grade', 'Marks, grade, result band, pass mark, GPA, or correction'),
        selectField('Publish status', ['Draft', 'Marks entered', 'Under review', 'Approved', 'Published', 'Correction needed']),
        field('Promotion note', 'Promoted, repeat, remedial, conditional, or held'),
        priority,
        dueDate,
        baseField('details', 'Exam and report card details', 'Moderation note, result approval, parent remarks, publish lock, and promotion decision.', true, 'textarea'),
      ];
    }
    if (has('fee', 'payment', 'receipt', 'invoice', 'balance', 'concession')) {
      return [
        baseField('title', 'Fee ledger record', `${detailName} invoice, receipt, concession, balance, or payment item`),
        baseField('requester', 'Student / guardian / account', 'Student name, guardian payer, invoice number, receipt number, or fee account'),
        baseField('owner', 'Finance owner', 'Cashier, accounts officer, bursar, school office, or finance admin'),
        selectField('Fee item type', ['Invoice', 'Payment', 'Receipt', 'Concession', 'Outstanding balance', 'Refund review']),
        field('Amount and term', 'Amount, term, category, transaction ID, receipt number, or due date'),
        field('Payer confirmation', 'Parent payer, payment channel, bank/gateway reference, or acknowledgement'),
        selectField('Fee ledger status', ['Draft', 'Pending payment', 'Part paid', 'Paid', 'Concession review', 'Overdue', 'Closed']),
        priority,
        dueDate,
        baseField('details', 'Fee ledger notes', 'Invoice breakdown, receipt proof, balance reason, concession approval, service block, parent confirmation, and final account action.', true, 'textarea'),
      ];
    }
    return [
      baseField('title', 'School operations item', `${detailName} student, class, attendance, exam, fee, or campus service`),
      baseField('requester', 'Student / class / service', 'Student, guardian, class, section, fee account, route, room, or library card'),
      baseField('owner', 'School owner', 'Class teacher, accounts desk, transport manager, warden, librarian, or admin'),
      field('Class / service reference', 'Grade, section, invoice, route, room, accession, or service code'),
      field('Guardian / contact', 'Guardian phone, email, consent, or notification channel'),
      selectField('School work status', ['Draft', 'Active', 'Pending review', 'Approved', 'Published', 'Closed']),
      priority,
      dueDate,
      baseField('details', 'School work details', 'Student profile, academic context, service link, evidence, approvals, reports, and next action.', true, 'textarea'),
    ];
  }

  if (moduleSlug === 'institutes') {
    if (has('lead', 'enquiry', 'counselling', 'demo', 'follow', 'admission', 'conversion')) {
      return [
        baseField('title', 'Lead / enrollment item', `${detailName} enquiry, demo, counselling, or conversion record`),
        baseField('requester', 'Lead / learner', 'Prospect, learner, phone, email, company, or branch'),
        baseField('owner', 'Counsellor / admission owner', 'Counsellor, branch admin, sales owner, or admissions desk'),
        field('Lead source', 'Website, referral, campaign, walk-in, phone, or social'),
        field('Course interest', 'Course, duration, delivery mode, branch, and start preference'),
        field('Demo / follow-up', 'Demo slot, call date, counsellor note, or next action'),
        selectField('Lead pipeline status', ['New lead', 'Contacted', 'Demo booked', 'Follow-up', 'Converted', 'Lost']),
        priority,
        dueDate,
        baseField('details', 'Lead CRM details', 'Need, budget, counselling notes, objection, demo response, fee plan, and conversion reason.', true, 'textarea'),
      ];
    }
    if (has('course', 'batch', 'session', 'learner', 'progress')) {
      return [
        baseField('title', 'Course / batch delivery item', `${detailName} course, batch, session, attendance, or progress item`),
        baseField('requester', 'Course / batch / learner', 'Course name, batch code, learner group, branch, or online cohort'),
        baseField('owner', 'Delivery owner', 'Trainer, course coordinator, branch admin, or academic owner'),
        field('Schedule', 'Start date, days, time, room, online link, or branch'),
        field('Learner progress', 'Attendance %, module coverage, LMS progress, or pending lessons'),
        selectField('Batch status', ['Planned', 'Enrolling', 'Running', 'On hold', 'Completed', 'Closed']),
        field('Resource note', 'Lab, software, material, recording, or assistant trainer'),
        priority,
        dueDate,
        baseField('details', 'Batch delivery details', 'Session plan, trainer, attendance, resources, progress risk, and learner follow-up.', true, 'textarea'),
      ];
    }
    if (has('trainer', 'workload', 'resource', 'replacement', 'performance')) {
      return [
        baseField('title', 'Trainer desk item', `${detailName} trainer calendar, workload, resource, or performance item`),
        baseField('requester', 'Batch / course / branch', 'Batch, course, branch, room, or learner group'),
        baseField('owner', 'Trainer operations owner', 'Trainer, training manager, replacement owner, or branch admin'),
        field('Availability', 'Available slot, blocked slot, leave, conflict, or backup trainer'),
        field('Workload load', 'Sessions, hours, active batches, learner count, or branch duty'),
        field('Resource requirement', 'Lab, equipment, software, material, or LMS access'),
        selectField('Trainer operation status', ['Assigned', 'Conflict', 'Replacement needed', 'Approved', 'Completed']),
        priority,
        dueDate,
        baseField('details', 'Trainer operation details', 'Allocation, workload, resource request, replacement plan, feedback score, and review note.', true, 'textarea'),
      ];
    }
    if (has('assessment', 'assignment', 'practical', 'test', 'rubric', 'feedback', 'remedial')) {
      return [
        baseField('title', 'Assessment / feedback item', `${detailName} assignment, practical, rubric, or remedial item`),
        baseField('requester', 'Learner / batch', 'Learner, batch, course, assessment group, or submission ID'),
        baseField('owner', 'Evaluator', 'Trainer, evaluator, course owner, or branch academic lead'),
        field('Assessment method', 'Assignment, practical, viva, project, quiz, or final test'),
        field('Rubric / score', 'Rubric, marks, pass mark, competency, or score'),
        selectField('Assessment status', ['Assigned', 'Submitted', 'Under review', 'Remedial needed', 'Passed', 'Failed']),
        field('Feedback and remedial', 'Feedback note, retest date, remedial session, or release status'),
        priority,
        dueDate,
        baseField('details', 'Assessment details', 'Instructions, file proof, score, revision, feedback release, remedial plan, and certificate readiness.', true, 'textarea'),
      ];
    }
    return [
      baseField('title', 'Institute operations item', `${detailName} lead, learner, batch, trainer, revenue, certificate, or support record`),
      baseField('requester', 'Lead / learner / batch', 'Lead, learner, batch, course, trainer, branch, invoice, or support requester'),
      baseField('owner', 'Institute owner', 'Counsellor, trainer, branch admin, finance owner, certificate owner, or support desk'),
      field('Course / branch reference', 'Course, batch code, branch, online mode, invoice, or certificate ID'),
      field('Next action', 'Call, demo, class, assessment, payment reminder, certificate release, or support reply'),
      selectField('Institute work status', ['New', 'In progress', 'Under review', 'Approved', 'Completed', 'Closed']),
      priority,
      dueDate,
      baseField('details', 'Institute work details', 'CRM notes, delivery plan, trainer action, assessment proof, revenue status, certificate status, and follow-up.', true, 'textarea'),
    ];
  }

  if (moduleSlug === 'certificates') {
    if (has('template', 'layout', 'seal', 'version')) {
      return [
        baseField('title', 'Template name', 'Graduation certificate / completion template / bonafide format'),
        baseField('requester', 'Certificate type', 'Completion, internship, training, bonafide, transfer, award'),
        baseField('owner', 'Template approver', 'Registrar, principal, department head, or certificate admin'),
        selectField('Paper size', ['A4 portrait', 'A4 landscape', 'Letter', 'Digital only']),
        field('Design version', 'v1.0, 2026 official, board approved'),
        field('Seal and signature block', 'Institution seal, registrar signature, QR position'),
        priority,
        dueDate,
        baseField('details', 'Template rules', 'Eligibility rules, print margin, QR rule, language, reissue note, and approval conditions.', true, 'textarea'),
      ];
    }
    if (has('qr', 'verify', 'verification')) {
      return [
        baseField('title', 'Verification case', 'Certificate QR verification / serial check'),
        baseField('requester', 'Certificate serial / QR code', 'QR-2026-0001 or public verification code'),
        baseField('owner', 'Verification officer', 'Certificate desk, registrar office, or digital verification owner'),
        selectField('Verification status', ['Pending check', 'Verified', 'Mismatch found', 'Expired', 'Revoked']),
        field('Recipient identifier', 'Admission number, student email, or national ID reference'),
        field('Issuer record', 'Issue batch, ceremony, programme, or department'),
        priority,
        dueDate,
        baseField('details', 'Verification notes', 'Public URL, metadata, mismatch reason, expiry rule, and verification result.', true, 'textarea'),
      ];
    }
    return [
      baseField('title', 'Certificate issue request', `${detailName} for student, batch, programme, or ceremony`),
      baseField('requester', 'Recipient / student ID', 'Student name, admission number, batch, or programme'),
      baseField('owner', 'Issuing officer', 'Registrar, exams office, certificate desk, or approver'),
      selectField('Certificate type', ['Completion', 'Internship', 'Training', 'Achievement', 'Transfer', 'Bonafide']),
      selectField('Eligibility status', ['Not checked', 'Eligible', 'Fees pending', 'Results pending', 'Document missing']),
      field('Signature route', 'Registrar -> Department head -> Principal'),
      field('Delivery mode', 'Print counter, email PDF, student portal, courier'),
      priority,
      dueDate,
      baseField('details', 'Certificate release notes', 'Template version, eligibility proof, QR status, print queue, delivery note, and reissue reason.', true, 'textarea'),
    ];
  }

  if (moduleSlug === 'support') {
    if (has('sla', 'triage', 'priority', 'escalation')) {
      return [
        baseField('title', 'SLA case title', 'Login outage / payment failed / certificate blocked'),
        baseField('requester', 'Affected user or department', 'Student, staff, admin office, or department'),
        baseField('owner', 'Escalation owner', 'IT lead, support manager, finance owner, or admin lead'),
        selectField('Impact level', ['Single user', 'Class / batch', 'Department', 'Institution wide']),
        selectField('Urgency', ['Low', 'Normal', 'High', 'Critical']),
        field('SLA target', '1 hour, 4 hours, same day, 24 hours'),
        field('Escalation reason', 'Blocked login, payment stuck, data missing, page unavailable'),
        priority,
        dueDate,
        baseField('details', 'Triage notes', 'Symptoms, affected module, proof, actions tried, escalation path, and response promise.', true, 'textarea'),
      ];
    }
    if (has('resolution', 'quality', 'root', 'close')) {
      return [
        baseField('title', 'Resolution item', 'Fix applied / account restored / payment verified'),
        baseField('requester', 'Requester confirmation', 'User name, email, phone, or department'),
        baseField('owner', 'Resolving agent', 'Support agent, IT owner, finance desk, or module admin'),
        selectField('Root cause', ['User account issue', 'Configuration', 'Network', 'Payment provider', 'Data correction', 'Other']),
        selectField('User confirmation', ['Waiting', 'Confirmed fixed', 'Needs follow-up', 'Reopened']),
        field('Fix applied', 'Password reset, callback corrected, receipt rechecked, profile updated'),
        priority,
        dueDate,
        baseField('details', 'Closure notes', 'Cause, fix, customer response, satisfaction, reopened rule, and knowledge-base note.', true, 'textarea'),
      ];
    }
    return [
      baseField('title', 'Support ticket subject', `${detailName} request or issue`),
      baseField('requester', 'Requester name / email', 'Student, staff, guardian, or admin email'),
      baseField('owner', 'Assigned agent', 'Help desk agent, IT owner, finance desk, or admin owner'),
      selectField('Issue category', ['Login', 'Payment', 'Certificate', 'Profile', 'Transport', 'Hostel', 'Library', 'Other']),
      selectField('Channel', ['Portal', 'Email', 'Phone', 'WhatsApp', 'Walk-in']),
      field('Affected page', 'Login, dashboard, certificates, payments, or module path'),
      field('Screenshot / proof link', 'Paste link or describe the uploaded proof'),
      priority,
      dueDate,
      baseField('details', 'Ticket description', 'Problem, steps tried, expected result, actual result, user device, and follow-up note.', true, 'textarea'),
    ];
  }

  if (moduleSlug === 'help-centre') {
    if (has('password', 'reset', 'google', 'account', 'login')) {
      return [
        baseField('title', 'Account help article', 'Reset password / Google login / account access guide'),
        baseField('requester', 'User problem', 'Cannot login, forgot password, Google blocked, account not created'),
        baseField('owner', 'Guide owner', 'Support writer, admin, or account support owner'),
        field('Search keywords', 'reset password, forgot password, Google access, create account'),
        selectField('User role', ['Student', 'Staff', 'Admin', 'Guardian', 'Applicant']),
        field('Required screenshots', 'Login page, reset email, Google error, account form'),
        priority,
        dueDate,
        baseField('details', 'Step-by-step answer', 'Exact steps, expected result, fallback support path, and related pages.', true, 'textarea'),
      ];
    }
    return [
      baseField('title', 'Guide title', `${detailName} article, FAQ, or walkthrough`),
      baseField('requester', 'User question', 'What question should this guide answer?'),
      baseField('owner', 'Article owner', 'Support writer, module owner, or admin reviewer'),
      field('Search keywords', 'payments, certificates, submissions, profile, support'),
      selectField('Content type', ['FAQ', 'Step guide', 'Troubleshooting', 'Video guide', 'Policy']),
      field('Related pages', 'Support request, payment failed, certificate issue, settings'),
      priority,
      dueDate,
      baseField('details', 'Guide content', 'Answer, numbered steps, screenshots needed, related links, and feedback notes.', true, 'textarea'),
    ];
  }

  if (moduleSlug === 'community') {
    if (has('event', 'calendar', 'schedule')) {
      return [
        baseField('title', 'Event title', 'Workshop, alumni meetup, club session, campus event'),
        baseField('requester', 'Audience group', 'Students, alumni, staff, club, batch, or department'),
        baseField('owner', 'Event owner', 'Moderator, mentor, club lead, or engagement owner'),
        field('Venue / online link', 'Auditorium, classroom, Zoom, Google Meet, campus ground'),
        field('Capacity', '50 attendees, open capacity, invite only'),
        selectField('Visibility', ['Public', 'Students only', 'Staff only', 'Club members', 'Invite only']),
        priority,
        dueDate,
        baseField('details', 'Event plan', 'Agenda, speakers, RSVP rule, attendance capture, reminders, and feedback plan.', true, 'textarea'),
      ];
    }
    if (has('poll', 'feedback', 'survey')) {
      return [
        baseField('title', 'Poll question', 'Which training topic should run next?'),
        baseField('requester', 'Target audience', 'Students, alumni, staff, club, batch, or group'),
        baseField('owner', 'Poll owner', 'Community moderator or engagement owner'),
        field('Option 1', 'First answer choice'),
        field('Option 2', 'Second answer choice'),
        field('Option 3', 'Optional third answer choice'),
        selectField('Result visibility', ['After vote', 'Always visible', 'Moderator only', 'After close']),
        priority,
        dueDate,
        baseField('details', 'Poll notes', 'Purpose, audience rule, closing time, decision owner, and follow-up action.', true, 'textarea'),
      ];
    }
    if (has('moderation', 'review', 'report', 'permission')) {
      return [
        baseField('title', 'Moderation case', 'Reported post, membership approval, rule exception'),
        baseField('requester', 'Reported item / group', 'Post title, member name, group name, or audience'),
        baseField('owner', 'Moderator', 'Moderator or community admin'),
        selectField('Decision', ['Pending', 'Approve', 'Reject', 'Hide', 'Escalate', 'Request changes']),
        field('Community rule', 'Spam, abuse, off-topic, privacy, or membership rule'),
        field('Evidence', 'Screenshot, report message, member note, or link'),
        priority,
        dueDate,
        baseField('details', 'Moderation notes', 'Reported content, audience impact, rule matched, decision reason, and audit note.', true, 'textarea'),
      ];
    }
    return [
      baseField('title', 'Group / announcement title', `${detailName} group, post, announcement, or discussion`),
      baseField('requester', 'Audience / group', 'Students, alumni, staff, mentors, club, or batch'),
      baseField('owner', 'Community owner', 'Moderator, mentor, club lead, or engagement owner'),
      selectField('Membership rule', ['Open', 'Request approval', 'Invite only', 'Admin assigned']),
      field('Group purpose', 'Announcements, mentoring, project group, alumni network, club work'),
      field('Posting rule', 'Anyone can post, moderator approval, owner only'),
      priority,
      dueDate,
      baseField('details', 'Community details', 'Purpose, audience, content plan, moderation rule, feedback channel, and engagement target.', true, 'textarea'),
    ];
  }

  if (moduleSlug === 'transport') {
    return [
      baseField('title', 'Route / trip title', `${detailName} pickup route, stop plan, or vehicle duty`),
      baseField('requester', 'Route / pickup zone', 'Route A, Hostel route, North gate, campus zone, or student group'),
      baseField('owner', 'Driver / dispatcher', 'Driver, route supervisor, transport manager, or dispatcher'),
      field('Start point', 'Campus main gate, hostel block, city stop'),
      field('End point', 'Final stop, campus drop, hostel return'),
      field('Vehicle number', 'Bus 01, van 04, vehicle registration'),
      field('Driver contact', 'Driver name and phone number'),
      field('Pickup time', '07:30 AM, 04:45 PM'),
      field('Passenger capacity', '40 seats, 12 seats, staff only'),
      priority,
      dueDate,
      baseField('details', 'Transport operation notes', 'Stop sequence, GPS notes, students assigned, delay rule, incident handling, and trip closure.', true, 'textarea'),
    ];
  }

  if (moduleSlug === 'hostel') {
    if (has('leave', 'visitor', 'safety', 'incident')) {
      return [
        baseField('title', 'Residential request', `${detailName} leave, visitor, incident, or safety case`),
        baseField('requester', 'Resident / room', 'Student name, room, bed, block, or floor'),
        baseField('owner', 'Warden / safety owner', 'Warden, floor in-charge, security, or hostel admin'),
        field('Guardian contact', 'Guardian name and phone'),
        selectField('Request type', ['Leave pass', 'Visitor entry', 'Safety incident', 'Complaint', 'Medical note']),
        field('Exit / visit time', 'Date and time'),
        field('Return / close time', 'Expected return or closure time'),
        priority,
        dueDate,
        baseField('details', 'Residential care notes', 'Reason, approval, safety action, visitor ID, incident details, and follow-up.', true, 'textarea'),
      ];
    }
    return [
      baseField('title', 'Room / resident record', `${detailName} allocation, bed, resident profile, or maintenance`),
      baseField('requester', 'Resident / student', 'Student name, admission number, or resident group'),
      baseField('owner', 'Warden / room owner', 'Warden, floor in-charge, maintenance owner, or hostel admin'),
      field('Block', 'Block A, Block B, girls hostel, boys hostel'),
      field('Floor / room', 'Floor 2, Room 204'),
      field('Bed number', 'B1, B2, upper bed, lower bed'),
      selectField('Occupancy status', ['Available', 'Reserved', 'Occupied', 'Maintenance', 'Blocked']),
      priority,
      dueDate,
      baseField('details', 'Hostel details', 'Room condition, roommate, guardian contact, move-in date, maintenance, meal plan, and warden note.', true, 'textarea'),
    ];
  }

  if (moduleSlug === 'library') {
    if (has('issue', 'return', 'renewal', 'borrow')) {
      return [
        baseField('title', 'Issue / return record', `${detailName} circulation entry`),
        baseField('requester', 'Member / borrower', 'Student, staff, member ID, or library card number'),
        baseField('owner', 'Circulation librarian', 'Librarian or circulation desk owner'),
        field('Accession number', 'ACC-0001, shelf copy, barcode'),
        field('Book title', 'Book or resource name'),
        field('Issue date', 'Date issued'),
        field('Return due date', 'Due date or renewal date'),
        selectField('Circulation status', ['Issued', 'Returned', 'Renewed', 'Overdue', 'Lost']),
        priority,
        dueDate,
        baseField('details', 'Circulation notes', 'Borrower, copy condition, renewal, overdue days, fine, lost book note, and return proof.', true, 'textarea'),
      ];
    }
    if (has('overdue', 'fine', 'lost')) {
      return [
        baseField('title', 'Overdue case', `${detailName} fine or lost book case`),
        baseField('requester', 'Member / borrower', 'Student, staff, member ID, or card number'),
        baseField('owner', 'Library recovery owner', 'Librarian, finance desk, or admin owner'),
        field('Accession number', 'Book accession or barcode'),
        field('Days overdue', '3 days, 14 days, one month'),
        field('Fine amount', 'Amount due or waived'),
        selectField('Recovery status', ['Reminder sent', 'Fine pending', 'Fine paid', 'Book returned', 'Marked lost']),
        priority,
        dueDate,
        baseField('details', 'Overdue notes', 'Reminder history, fine rule, condition, lost status, recovery action, and member communication.', true, 'textarea'),
      ];
    }
    return [
      baseField('title', 'Catalogue item', `${detailName} book, digital resource, accession, or reservation`),
      baseField('requester', 'Book / resource title', 'Title, ISBN, accession, category, or digital file'),
      baseField('owner', 'Catalogue owner', 'Librarian, archive owner, or digital resource owner'),
      field('Author / publisher', 'Author, publisher, edition'),
      field('ISBN / accession', 'ISBN, barcode, accession number'),
      field('Shelf / category', 'Shelf A2, reference, fiction, science, digital'),
      selectField('Copy status', ['Available', 'Issued', 'Reserved', 'Damaged', 'Lost', 'Digital']),
      priority,
      dueDate,
      baseField('details', 'Catalogue notes', 'Category, copy count, shelf location, reservation queue, digital link, and circulation rule.', true, 'textarea'),
    ];
  }

  if (moduleSlug === 'submissions') {
    return [
      baseField('title', 'Submission task', `${detailName} assignment, project, report, or evidence upload`),
      baseField('requester', 'Student / batch', 'Student, group, batch, programme, or project team'),
      baseField('owner', 'Evaluator / reviewer', 'Teacher, mentor, evaluator, coordinator, or academic owner'),
      field('Allowed file type', 'PDF, DOCX, ZIP, image, video link'),
      field('Submission window', 'Open date/time and close date/time'),
      field('Rubric / marks', 'Rubric name, max marks, pass mark'),
      selectField('Review status', ['Not submitted', 'Submitted', 'Under review', 'Revision needed', 'Approved', 'Rejected']),
      priority,
      dueDate,
      baseField('details', 'Submission requirements', 'Instructions, required files, originality status, evaluator comments, revision rule, and feedback release.', true, 'textarea'),
    ];
  }

  if (moduleSlug === 'internship') {
    return [
      baseField('title', 'Placement record', `${detailName} company, role, offer, log, or completion record`),
      baseField('requester', 'Student / company', 'Student name, company, mentor, role, or department'),
      baseField('owner', 'Placement owner', 'Placement officer, supervisor, mentor, or coordinator'),
      field('Company / partner', 'Company name, industry, contact person'),
      field('Role / project', 'Intern role, project title, department'),
      field('Mentor contact', 'Industry mentor or supervisor contact'),
      selectField('Placement status', ['Applied', 'Shortlisted', 'Offered', 'Active', 'Completed', 'Rejected']),
      priority,
      dueDate,
      baseField('details', 'Internship notes', 'Eligibility, offer letter, weekly log, attendance proof, risk note, mentor feedback, and completion evidence.', true, 'textarea'),
    ];
  }

  if (moduleSlug === 'training') {
    return [
      baseField('title', 'Training record', `${detailName} batch, session, resource, skill check, or feedback`),
      baseField('requester', 'Batch / learner', 'Batch, learner, trainer, course, or skill group'),
      baseField('owner', 'Trainer / coordinator', 'Trainer, coordinator, department owner, or evaluator'),
      field('Session / module', 'Session title, module name, topic, or lesson'),
      field('Trainer allocation', 'Trainer name, assistant, room, online link'),
      field('Attendance rule', 'Required attendance %, exception rule'),
      selectField('Progress status', ['Planned', 'In progress', 'Completed', 'Needs remedial', 'Published']),
      priority,
      dueDate,
      baseField('details', 'Training delivery notes', 'Resources, attendance, skill task, feedback, remedial plan, and progress report.', true, 'textarea'),
    ];
  }

  if (moduleSlug === 'programmes') {
    return [
      baseField('title', 'Programme record', `${detailName} catalogue, curriculum, credit, eligibility, or approval`),
      baseField('requester', 'Programme / department', 'Programme, department, course, intake, curriculum version, or batch'),
      baseField('owner', 'Academic owner', 'Dean, HOD, academic board, programme owner, or coordinator'),
      field('Credit / duration', 'Credits, semesters, hours, programme duration'),
      field('Eligibility rule', 'Entry requirements, prerequisites, progression rule'),
      field('Curriculum version', 'v2026, draft, board approved'),
      selectField('Governance status', ['Draft', 'Under review', 'Approved', 'Published', 'Archived']),
      priority,
      dueDate,
      baseField('details', 'Programme governance notes', 'Course structure, outcomes, intake capacity, approval route, compliance evidence, and publishing note.', true, 'textarea'),
    ];
  }

  if (moduleSlug === 'settings') {
    return [
      baseField('title', 'Setting change', `${detailName} profile, permission, branding, backup, or branch setting`),
      baseField('requester', 'Setting scope', 'Institution, branch, role, module, user group, or academic year'),
      baseField('owner', 'Admin owner', 'Super admin, institution admin, branch admin, or system owner'),
      field('Current value', 'Existing setting value before change'),
      field('New value', 'Updated setting value'),
      selectField('Change type', ['Profile', 'Permission', 'Branding', 'Academic year', 'Backup', 'Notification']),
      field('Rollback note', 'How to restore this setting if needed'),
      priority,
      dueDate,
      baseField('details', 'Configuration notes', 'Reason, affected modules, validation rule, approval, backup, and audit history.', true, 'textarea'),
    ];
  }

  return [
    baseField('title', profile.titleLabel, profile.titlePlaceholder),
    baseField('requester', profile.subjectLabel, profile.subjectPlaceholder),
    baseField('owner', profile.ownerLabel, profile.ownerPlaceholder),
    priority,
    dueDate,
    baseField('details', profile.detailsLabel, profile.detailsPlaceholder, true, 'textarea'),
  ];
}

function optionBlocks(moduleSlug: string, featureName: string, sectionName: string, detailName: string, fallback: DetailBlock[]): DetailBlock[] {
  const context = `${featureName} ${sectionName} ${detailName}`.toLowerCase();
  const has = (...words: string[]) => words.some((word) => context.includes(word));

  if (moduleSlug === 'school') {
    const isParentPortal =
      featureName.toLowerCase().includes('parent') ||
      /(parent dashboard|guardian contacts|meeting|consent|student updates|message history|notice|communication)/.test(context);

    if (isParentPortal) {
      return [
        { title: 'Family Access', detail: 'Connect parent accounts, guardian roles, student links, and visibility rules.', items: ['Account', 'Guardian', 'Student', 'Access'], icon: <Users size={18} />, tone: 'from-fuchsia-500 to-violet-600' },
        { title: 'Communication Log', detail: 'Track messages, SMS, email, app alerts, acknowledgements, and reply history.', items: ['Message', 'SMS', 'Email', 'Reply'], icon: <MessageSquare size={18} />, tone: 'from-sky-500 to-cyan-500' },
        { title: 'Meeting and Consent', detail: 'Schedule meetings, record minutes, consent decisions, evidence, and follow-up.', items: ['Meeting', 'Minutes', 'Consent', 'Proof'], icon: <CalendarDays size={18} />, tone: 'from-amber-500 to-orange-500' },
        { title: 'Student Update Trail', detail: 'Summarize attendance, homework, fees, behaviour, result notes, and parent tasks.', items: ['Attendance', 'Homework', 'Fees', 'Results'], icon: <BarChart3 size={18} />, tone: 'from-emerald-500 to-teal-500' },
      ];
    }
    if (has('fee', 'payment', 'receipt', 'invoice', 'balance', 'concession')) {
      return [
        { title: 'Fee Account', detail: 'Link student, guardian payer, class, fee category, term, and account status.', items: ['Student', 'Payer', 'Term', 'Status'], icon: <Database size={18} />, tone: 'from-emerald-500 to-teal-500' },
        { title: 'Receipt Control', detail: 'Capture payment channel, transaction ID, receipt number, cashier, and proof.', items: ['Channel', 'Transaction', 'Receipt', 'Cashier'], icon: <CheckCircle2 size={18} />, tone: 'from-sky-500 to-cyan-500' },
        { title: 'Concession Approval', detail: 'Review scholarship, sibling discount, waiver, refund, and approval trail.', items: ['Scholarship', 'Sibling', 'Waiver', 'Refund'], icon: <ShieldCheck size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
        { title: 'Balance Report', detail: 'Show due, paid, part-paid, overdue, blocked service, and statement output.', items: ['Due', 'Paid', 'Overdue', 'Statement'], icon: <BarChart3 size={18} />, tone: 'from-amber-500 to-orange-500' },
      ];
    }
    if (has('class', 'section', 'teacher', 'timetable', 'homework', 'curriculum')) {
      return [
        { title: 'Academic Structure', detail: 'Set class, section, subject, room, roll range, capacity, and active term.', items: ['Class', 'Section', 'Subject', 'Capacity'], icon: <GraduationCap size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
        { title: 'Teacher Workload', detail: 'Balance class teacher, subject teachers, substitutes, periods, and conflicts.', items: ['Teacher', 'Subject', 'Periods', 'Conflict'], icon: <Users size={18} />, tone: 'from-sky-500 to-cyan-500' },
        { title: 'Timetable Board', detail: 'Build periods, rooms, lab slots, substitutions, lock status, and publish flow.', items: ['Periods', 'Rooms', 'Labs', 'Publish'], icon: <CalendarDays size={18} />, tone: 'from-emerald-500 to-teal-500' },
        { title: 'Homework Review', detail: 'Assign homework, attach resources, track completion, and notify parents.', items: ['Task', 'Resource', 'Complete', 'Notify'], icon: <ClipboardList size={18} />, tone: 'from-amber-500 to-orange-500' },
      ];
    }
    if (has('attendance', 'late', 'leave', 'behaviour', 'conduct', 'house')) {
      return [
        { title: 'Daily Register', detail: 'Capture present, absent, late, leave, session, and class strength.', items: ['Present', 'Absent', 'Late', 'Leave'], icon: <ClipboardList size={18} />, tone: 'from-sky-500 to-cyan-500' },
        { title: 'Care Alert', detail: 'Send parent alert, capture reason, teacher note, and follow-up owner.', items: ['Alert', 'Reason', 'Teacher', 'Follow-up'], icon: <MessageSquare size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
        { title: 'Behaviour Case', detail: 'Record merit, warning, house point, incident, intervention, and closure.', items: ['Merit', 'Warning', 'House', 'Close'], icon: <ShieldCheck size={18} />, tone: 'from-amber-500 to-orange-500' },
        { title: 'Attendance Trend', detail: 'Review percentage, risk students, repeated late marks, and care report.', items: ['Percent', 'Risk', 'Late', 'Report'], icon: <BarChart3 size={18} />, tone: 'from-emerald-500 to-teal-500' },
      ];
    }
    if (has('exam', 'grade', 'marks', 'report', 'promotion')) {
      return [
        { title: 'Exam Calendar', detail: 'Prepare exam date, subject, paper, room, invigilator, and timetable status.', items: ['Date', 'Subject', 'Room', 'Status'], icon: <CalendarDays size={18} />, tone: 'from-indigo-500 to-blue-600' },
        { title: 'Marks Moderation', detail: 'Enter marks, grade scale, correction, moderation, and approval owner.', items: ['Marks', 'Scale', 'Correction', 'Approve'], icon: <ClipboardList size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
        { title: 'Report Release', detail: 'Publish report card, parent copy, remarks, rank, and locked result.', items: ['Report', 'Parent', 'Remarks', 'Lock'], icon: <Award size={18} />, tone: 'from-emerald-500 to-teal-500' },
        { title: 'Promotion Output', detail: 'Close promoted, conditional, remedial, repeat, and archive decision.', items: ['Promote', 'Remedial', 'Repeat', 'Archive'], icon: <BarChart3 size={18} />, tone: 'from-amber-500 to-orange-500' },
      ];
    }
  }

  if (moduleSlug === 'certificates') {
    if (has('template', 'layout', 'seal', 'version')) {
      return [
        { title: 'Design Setup', detail: 'Template size, seal position, border, watermark, and official language.', items: ['Size', 'Seal', 'Watermark', 'Language'], icon: <FileText size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
        { title: 'Field Mapping', detail: 'Map student name, programme, completion date, serial number, and QR field.', items: ['Name', 'Programme', 'Date', 'Serial'], icon: <ClipboardList size={18} />, tone: 'from-sky-500 to-cyan-500' },
        { title: 'Approver Preview', detail: 'Send preview to registrar, principal, or department for approval.', items: ['Preview', 'Registrar', 'Principal', 'Approval'], icon: <ShieldCheck size={18} />, tone: 'from-amber-500 to-orange-500' },
        { title: 'Version Archive', detail: 'Lock template version, change reason, rollback note, and print rule.', items: ['Version', 'Reason', 'Rollback', 'Print rule'], icon: <Database size={18} />, tone: 'from-emerald-500 to-teal-500' },
      ];
    }
    if (has('qr', 'verify', 'verification')) {
      return [
        { title: 'QR Lookup', detail: 'Search by QR code, serial number, recipient, or public verification URL.', items: ['QR', 'Serial', 'Recipient', 'URL'], icon: <BarChart3 size={18} />, tone: 'from-sky-500 to-cyan-500' },
        { title: 'Metadata Match', detail: 'Match name, programme, issue date, issuer, and certificate type.', items: ['Name', 'Programme', 'Date', 'Issuer'], icon: <ShieldCheck size={18} />, tone: 'from-emerald-500 to-teal-500' },
        { title: 'Mismatch Handling', detail: 'Flag expired, revoked, duplicate, or edited certificate records.', items: ['Expired', 'Revoked', 'Duplicate', 'Edited'], icon: <KeyRound size={18} />, tone: 'from-amber-500 to-orange-500' },
        { title: 'Verification Log', detail: 'Save verifier, time, result, location, and audit export.', items: ['Verifier', 'Time', 'Result', 'Export'], icon: <Database size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
      ];
    }
    return [
      { title: 'Recipient Eligibility', detail: 'Check student record, completion, fees, results, and document clearance.', items: ['Student', 'Completion', 'Fees', 'Results'], icon: <Users size={18} />, tone: 'from-emerald-500 to-teal-500' },
      { title: 'Certificate Data', detail: 'Prepare name spelling, programme, certificate type, serial, and batch.', items: ['Name', 'Programme', 'Type', 'Serial'], icon: <Award size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
      { title: 'Approval Signature', detail: 'Route signature to registrar, department head, principal, or issuer.', items: ['Registrar', 'Head', 'Principal', 'Issuer'], icon: <ShieldCheck size={18} />, tone: 'from-amber-500 to-orange-500' },
      { title: 'Print and Delivery', detail: 'Release PDF, print batch, student pickup, courier, or archive.', items: ['PDF', 'Print', 'Pickup', 'Archive'], icon: <FileText size={18} />, tone: 'from-sky-500 to-cyan-500' },
    ];
  }

  if (moduleSlug === 'support') {
    if (has('sla', 'triage', 'priority', 'escalation')) {
      return [
        { title: 'Impact Scan', detail: 'Identify users affected, blocked module, channel, and business impact.', items: ['Users', 'Module', 'Channel', 'Impact'], icon: <Headphones size={18} />, tone: 'from-cyan-500 to-blue-600' },
        { title: 'SLA Clock', detail: 'Start response target, escalation time, breach risk, and owner alert.', items: ['Response', 'Escalation', 'Risk', 'Alert'], icon: <CalendarDays size={18} />, tone: 'from-amber-500 to-orange-500' },
        { title: 'Escalation Route', detail: 'Route to IT, finance, admin, certificate desk, or account support.', items: ['IT', 'Finance', 'Admin', 'Desk'], icon: <Users size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
        { title: 'SLA Report', detail: 'Record response time, resolution time, breach reason, and service score.', items: ['Response', 'Resolution', 'Breach', 'Score'], icon: <BarChart3 size={18} />, tone: 'from-emerald-500 to-teal-500' },
      ];
    }
    return [
      { title: 'Ticket Intake', detail: 'Capture requester, issue category, screenshot, channel, and affected page.', items: ['Requester', 'Category', 'Proof', 'Page'], icon: <Headphones size={18} />, tone: 'from-cyan-500 to-blue-600' },
      { title: 'Agent Worklog', detail: 'Record replies, internal notes, fixes tried, handover, and escalation.', items: ['Reply', 'Note', 'Fix', 'Handover'], icon: <MessageSquare size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
      { title: 'Resolution Proof', detail: 'Attach fix summary, user confirmation, reopened status, and root cause.', items: ['Fix', 'Confirm', 'Reopen', 'Cause'], icon: <ShieldCheck size={18} />, tone: 'from-emerald-500 to-teal-500' },
      { title: 'Knowledge Update', detail: 'Create reusable answer, related guide, FAQ update, and support report.', items: ['Answer', 'Guide', 'FAQ', 'Report'], icon: <FileText size={18} />, tone: 'from-amber-500 to-orange-500' },
    ];
  }

  if (moduleSlug === 'help-centre') {
    return [
      { title: 'Search Question', detail: 'Map the exact words users search and the problem they need solved.', items: ['Keywords', 'Question', 'Intent', 'Role'], icon: <MessageSquare size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
      { title: 'Answer Draft', detail: 'Write clear steps, screenshot notes, expected result, and fallback action.', items: ['Steps', 'Images', 'Result', 'Fallback'], icon: <FileText size={18} />, tone: 'from-sky-500 to-cyan-500' },
      { title: 'Related Help', detail: 'Link FAQs, support ticket path, account settings, and module pages.', items: ['FAQs', 'Support', 'Settings', 'Module'], icon: <ClipboardList size={18} />, tone: 'from-emerald-500 to-teal-500' },
      { title: 'Guide Feedback', detail: 'Track helpful votes, failed searches, comments, and update requests.', items: ['Votes', 'Searches', 'Comments', 'Updates'], icon: <BarChart3 size={18} />, tone: 'from-amber-500 to-orange-500' },
    ];
  }

  if (moduleSlug === 'community') {
    if (has('event', 'calendar')) {
      return [
        { title: 'Event Setup', detail: 'Build agenda, host, venue, online link, and event category.', items: ['Agenda', 'Host', 'Venue', 'Link'], icon: <CalendarDays size={18} />, tone: 'from-fuchsia-600 to-pink-500' },
        { title: 'Audience Invite', detail: 'Target clubs, batches, alumni, mentors, staff, and RSVP rules.', items: ['Clubs', 'Batches', 'Alumni', 'RSVP'], icon: <Users size={18} />, tone: 'from-sky-500 to-cyan-500' },
        { title: 'Live Engagement', detail: 'Track attendance, comments, questions, reminders, and feedback.', items: ['Attendance', 'Comments', 'Questions', 'Feedback'], icon: <MessageSquare size={18} />, tone: 'from-emerald-500 to-teal-500' },
        { title: 'Event Report', detail: 'Close outcome, attendance count, feedback score, and follow-up tasks.', items: ['Outcome', 'Count', 'Score', 'Tasks'], icon: <BarChart3 size={18} />, tone: 'from-amber-500 to-orange-500' },
      ];
    }
    return [
      { title: 'Audience Rules', detail: 'Define members, groups, visibility, membership, and moderators.', items: ['Members', 'Groups', 'Visibility', 'Moderators'], icon: <Users size={18} />, tone: 'from-fuchsia-600 to-pink-500' },
      { title: 'Content Studio', detail: 'Create announcements, posts, polls, attachments, and schedule.', items: ['Post', 'Poll', 'Attachment', 'Schedule'], icon: <MessageSquare size={18} />, tone: 'from-sky-500 to-cyan-500' },
      { title: 'Moderation Desk', detail: 'Review reported content, approvals, blocked words, and exceptions.', items: ['Reports', 'Approvals', 'Blocked', 'Exceptions'], icon: <ShieldCheck size={18} />, tone: 'from-amber-500 to-orange-500' },
      { title: 'Engagement Metrics', detail: 'Measure reach, replies, attendance, feedback, and outcomes.', items: ['Reach', 'Replies', 'Attendance', 'Outcome'], icon: <BarChart3 size={18} />, tone: 'from-emerald-500 to-teal-500' },
    ];
  }

  if (moduleSlug === 'transport') {
    return [
      { title: 'Route Map', detail: 'Mark start, stops, pickup sequence, GPS note, and campus drop.', items: ['Start', 'Stops', 'GPS', 'Drop'], icon: <MapPinned size={18} />, tone: 'from-sky-500 to-cyan-500' },
      { title: 'Vehicle Duty', detail: 'Assign bus, driver, helper, capacity, shift, and backup vehicle.', items: ['Bus', 'Driver', 'Helper', 'Capacity'], icon: <Bus size={18} />, tone: 'from-emerald-500 to-teal-500' },
      { title: 'Passenger List', detail: 'Attach students, staff riders, guardian contacts, and exceptions.', items: ['Students', 'Staff', 'Guardians', 'Exceptions'], icon: <Users size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
      { title: 'Trip Closure', detail: 'Record delay, incidents, arrival, missed stop, and daily report.', items: ['Delay', 'Incident', 'Arrival', 'Report'], icon: <BarChart3 size={18} />, tone: 'from-amber-500 to-orange-500' },
    ];
  }

  if (moduleSlug === 'hostel') {
    return [
      { title: 'Room and Bed', detail: 'Assign block, floor, room, bed, occupancy, and roommate.', items: ['Block', 'Floor', 'Room', 'Bed'], icon: <BedDouble size={18} />, tone: 'from-amber-500 to-orange-500' },
      { title: 'Resident Care', detail: 'Capture guardian, medical note, meal plan, documents, and stay period.', items: ['Guardian', 'Medical', 'Meals', 'Documents'], icon: <Users size={18} />, tone: 'from-sky-500 to-cyan-500' },
      { title: 'Warden Action', detail: 'Track leave pass, maintenance, complaints, visitors, and follow-up.', items: ['Leave', 'Maintenance', 'Complaint', 'Visitor'], icon: <ClipboardList size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
      { title: 'Safety Audit', detail: 'Close incident, room check, gate log, visitor note, and audit report.', items: ['Incident', 'Room check', 'Gate log', 'Audit'], icon: <ShieldCheck size={18} />, tone: 'from-emerald-500 to-teal-500' },
    ];
  }

  if (moduleSlug === 'library') {
    return [
      { title: 'Catalogue Data', detail: 'Record title, author, ISBN, accession, category, and shelf.', items: ['Title', 'Author', 'ISBN', 'Shelf'], icon: <BookOpen size={18} />, tone: 'from-emerald-500 to-teal-500' },
      { title: 'Circulation Desk', detail: 'Issue, return, renew, reserve, and record borrower proof.', items: ['Issue', 'Return', 'Renew', 'Reserve'], icon: <ClipboardList size={18} />, tone: 'from-sky-500 to-cyan-500' },
      { title: 'Member Queue', detail: 'Manage holds, waiting list, copy allocation, and member notices.', items: ['Holds', 'Queue', 'Copy', 'Notice'], icon: <Users size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
      { title: 'Fine Recovery', detail: 'Track overdue days, reminder, fine, lost book, and recovery report.', items: ['Overdue', 'Reminder', 'Fine', 'Lost'], icon: <BarChart3 size={18} />, tone: 'from-amber-500 to-orange-500' },
    ];
  }

  if (moduleSlug === 'submissions') {
    return [
      { title: 'Task Window', detail: 'Set open date, close date, file type, late policy, and instructions.', items: ['Open', 'Close', 'File type', 'Policy'], icon: <Upload size={18} />, tone: 'from-cyan-500 to-blue-600' },
      { title: 'Evidence Check', detail: 'Validate files, versions, originality, attachments, and proof.', items: ['Files', 'Versions', 'Originality', 'Proof'], icon: <FileText size={18} />, tone: 'from-emerald-500 to-teal-500' },
      { title: 'Evaluator Rubric', detail: 'Assign evaluator, rubric, marks, comments, and revision decision.', items: ['Evaluator', 'Rubric', 'Marks', 'Revision'], icon: <ShieldCheck size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
      { title: 'Feedback Release', detail: 'Publish result, notify learner, archive files, and export evidence.', items: ['Publish', 'Notify', 'Archive', 'Export'], icon: <BarChart3 size={18} />, tone: 'from-amber-500 to-orange-500' },
    ];
  }

  if (moduleSlug === 'internship') {
    return [
      { title: 'Partner Role', detail: 'Company, mentor, vacancy, role scope, duration, and agreement.', items: ['Company', 'Mentor', 'Vacancy', 'Agreement'], icon: <BriefcaseBusiness size={18} />, tone: 'from-indigo-500 to-blue-600' },
      { title: 'Student Fit', detail: 'Eligibility, documents, programme match, readiness, and approval.', items: ['Eligibility', 'Documents', 'Match', 'Approval'], icon: <ShieldCheck size={18} />, tone: 'from-emerald-500 to-teal-500' },
      { title: 'Weekly Monitor', detail: 'Logs, attendance, supervisor note, risk, and progress score.', items: ['Logs', 'Attendance', 'Note', 'Risk'], icon: <ClipboardList size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
      { title: 'Completion Evidence', detail: 'Final review, certificate link, report, and archive pack.', items: ['Review', 'Certificate', 'Report', 'Archive'], icon: <Award size={18} />, tone: 'from-amber-500 to-orange-500' },
    ];
  }

  if (moduleSlug === 'training') {
    return [
      { title: 'Batch Planner', detail: 'Batch capacity, learner list, calendar, room, and delivery mode.', items: ['Capacity', 'Learners', 'Calendar', 'Mode'], icon: <GraduationCap size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
      { title: 'Trainer Desk', detail: 'Trainer allocation, workload, resources, assistant, and availability.', items: ['Trainer', 'Workload', 'Resources', 'Availability'], icon: <Users size={18} />, tone: 'from-sky-500 to-cyan-500' },
      { title: 'Session Evidence', detail: 'Attendance, materials, class notes, recording, and engagement.', items: ['Attendance', 'Materials', 'Notes', 'Recording'], icon: <ClipboardList size={18} />, tone: 'from-emerald-500 to-teal-500' },
      { title: 'Skill Outcome', detail: 'Assessment, feedback, remedial plan, result publishing, and progress.', items: ['Assessment', 'Feedback', 'Remedial', 'Progress'], icon: <BarChart3 size={18} />, tone: 'from-amber-500 to-orange-500' },
    ];
  }

  if (moduleSlug === 'programmes') {
    return [
      { title: 'Catalogue Profile', detail: 'Programme title, department, duration, intake, status, and branch.', items: ['Title', 'Department', 'Duration', 'Intake'], icon: <BookOpen size={18} />, tone: 'from-indigo-500 to-blue-600' },
      { title: 'Curriculum Map', detail: 'Credits, semesters, modules, electives, outcomes, and version.', items: ['Credits', 'Semesters', 'Modules', 'Outcomes'], icon: <FileText size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
      { title: 'Eligibility Gate', detail: 'Entry rules, prerequisites, progression, capacity, and exceptions.', items: ['Entry', 'Prerequisite', 'Progression', 'Capacity'], icon: <ShieldCheck size={18} />, tone: 'from-emerald-500 to-teal-500' },
      { title: 'Governance Release', detail: 'Academic approval, publishing, compliance evidence, and report.', items: ['Approval', 'Publish', 'Evidence', 'Report'], icon: <BarChart3 size={18} />, tone: 'from-amber-500 to-orange-500' },
    ];
  }

  return fallback;
}

function titleFromSlug(value: string) {
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function shortRecordId(id: string) {
  return id.slice(-6).toUpperCase();
}

function statusClass(status: string) {
  switch (status) {
    case 'APPROVED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    case 'CLOSED':
      return 'bg-slate-100 text-slate-600 border-slate-200';
    case 'IN_REVIEW':
      return 'bg-amber-50 text-amber-700 border-amber-100';
    default:
      return 'bg-brand-50 text-brand-600 border-brand-100';
  }
}

function kindFor(value: string) {
  const lower = value.toLowerCase();
  if (/(approve|approval|review|verify|moderation|decision|queue|evidence|proof|eligibility)/.test(lower)) return 'review';
  if (/(permission|rule|control|security|visibility|capacity|policy|lock|access)/.test(lower)) return 'control';
  if (/(report|analytics|insight|audit|archive|output|register|log|history|export|print)/.test(lower)) return 'report';
  if (/(document|file|template|certificate|copy|attachment|upload)/.test(lower)) return 'evidence';
  if (/(calendar|event|schedule|route|trip|room|bed|catalogue|member|group|poll|question|session|plan)/.test(lower)) return 'operations';
  return 'intake';
}

function moduleSpecificProfile(moduleSlug: string, moduleName: string, featureName: string, sectionName: string, detailName: string): DetailProfile | null {
  const subject = detailName.toLowerCase();
  const context = `${featureName} / ${sectionName}`;
  const eyebrow = `${moduleName} / ${context}`;
  const routeText = `${featureName} ${sectionName} ${detailName}`.toLowerCase();
  const matches = (...words: string[]) => words.some((word) => routeText.includes(word));

  if (moduleSlug === 'school') {
    const isParentPortal =
      featureName.toLowerCase().includes('parent') ||
      /(parent dashboard|guardian contacts|meeting|consent|student updates|message history|notice|communication)/.test(routeText);

    if (isParentPortal) {
      return {
        eyebrow,
        title: `${detailName} parent portal`,
        summary: `A school parent communication page for ${subject}, with guardian access, student links, consent, meeting notes, alerts, replies, and follow-up output.`,
        icon: <MessageSquare size={22} />,
        tone: 'from-fuchsia-500 to-violet-600',
        formTitle: `Create ${subject} parent record`,
        titleLabel: 'Parent portal item',
        titlePlaceholder: `${detailName} message, meeting, consent, update, or guardian action`,
        subjectLabel: 'Parent / guardian / student',
        subjectPlaceholder: 'Guardian name, student name, class, phone, email, or family ID',
        ownerLabel: 'Communication owner',
        ownerPlaceholder: 'Class teacher, counsellor, admin desk, principal office, or parent coordinator',
        detailsLabel: 'Communication details',
        detailsPlaceholder: `Add message, guardian response, meeting minutes, consent proof, student update, escalation, and next action for ${subject}.`,
        blocks: [
          { title: 'Family Access', detail: 'Link guardian accounts, student records, relationship, communication preference, and permissions.', items: ['Guardian', 'Student', 'Preference', 'Access'], icon: <Users size={18} />, tone: 'from-fuchsia-500 to-violet-600' },
          { title: 'Message Timeline', detail: 'Send notices, reminders, alerts, homework updates, fee notes, and reply tracking.', items: ['Notice', 'Reminder', 'Alert', 'Reply'], icon: <MessageSquare size={18} />, tone: 'from-sky-500 to-cyan-500' },
          { title: 'Meeting and Consent', detail: 'Book meeting slots, record minutes, collect consent, attach evidence, and close follow-up.', items: ['Meeting', 'Minutes', 'Consent', 'Evidence'], icon: <CalendarDays size={18} />, tone: 'from-amber-500 to-orange-500' },
          { title: 'Student Care Output', detail: 'Summarize attendance, behaviour, results, fee reminders, and parent follow-up.', items: ['Attendance', 'Behaviour', 'Results', 'Fees'], icon: <BarChart3 size={18} />, tone: 'from-emerald-500 to-teal-500' },
        ],
        controls: ['Guardian access', 'Message template', 'Consent approval', 'Meeting slots', 'Notification rule'],
        outputs: [`${detailName} parent log`, 'Guardian contact register', 'Consent evidence pack', 'Parent communication report'],
      };
    }
    if (matches('fee', 'payment', 'receipt', 'invoice', 'balance', 'concession')) {
      return {
        eyebrow,
        title: `${detailName} fee ledger`,
        summary: `A school finance page for ${subject}, with invoice creation, payment collection, receipt control, concession review, balance tracking, and parent payment communication.`,
        icon: <Database size={22} />,
        tone: 'from-emerald-500 to-teal-500',
        formTitle: `Create ${subject} fee record`,
        titleLabel: 'Fee ledger item',
        titlePlaceholder: `${detailName} invoice, payment, receipt, concession, balance, or refund case`,
        subjectLabel: 'Student / fee account',
        subjectPlaceholder: 'Student, guardian payer, invoice number, receipt number, fee category, or account ID',
        ownerLabel: 'Finance owner',
        ownerPlaceholder: 'Cashier, accounts officer, bursar, school office, or finance admin',
        detailsLabel: 'Fee details',
        detailsPlaceholder: `Add invoice breakdown, payment proof, receipt number, balance reason, concession approval, parent confirmation, and account action for ${subject}.`,
        blocks: [
          { title: 'Invoice Builder', detail: 'Create term, category, due date, amount, discount, student, and account mapping.', items: ['Term', 'Category', 'Amount', 'Account'], icon: <Database size={18} />, tone: 'from-emerald-500 to-teal-500' },
          { title: 'Payment Counter', detail: 'Capture channel, transaction ID, receipt number, cashier, payer, and proof.', items: ['Channel', 'Transaction', 'Receipt', 'Payer'], icon: <CheckCircle2 size={18} />, tone: 'from-sky-500 to-cyan-500' },
          { title: 'Concession Route', detail: 'Review scholarship, sibling discount, waiver, refund, approval proof, and policy match.', items: ['Scholarship', 'Discount', 'Waiver', 'Policy'], icon: <ShieldCheck size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
          { title: 'Balance Statement', detail: 'Track due, paid, part-paid, overdue, service block, reminder, and statement output.', items: ['Due', 'Paid', 'Overdue', 'Statement'], icon: <BarChart3 size={18} />, tone: 'from-amber-500 to-orange-500' },
        ],
        controls: ['Fee category', 'Payment approval', 'Concession rule', 'Receipt lock', 'Statement access'],
        outputs: [`${detailName} fee register`, 'Receipt ledger', 'Outstanding balance report', 'Parent payment notice'],
      };
    }
    if (matches('admission', 'enquiry', 'application', 'guardian', 'document', 'file')) {
      return {
        eyebrow,
        title: `${detailName} admission workspace`,
        summary: `A school admissions and SIS page for ${subject}, with enquiry intake, guardian proof, class eligibility, document checks, seat decision, and final student file output.`,
        icon: <Users size={22} />,
        tone: 'from-cyan-500 to-blue-600',
        formTitle: `Create ${subject} admission record`,
        titleLabel: 'Admission item',
        titlePlaceholder: `${detailName} enquiry, application, guardian, or document case`,
        subjectLabel: 'Student / guardian',
        subjectPlaceholder: 'Applicant name, admission number, guardian, phone, or email',
        ownerLabel: 'Admission owner',
        ownerPlaceholder: 'Admission officer, principal office, class teacher, or school admin',
        detailsLabel: 'Admission details',
        detailsPlaceholder: `Add class requested, guardian proof, missing documents, interview note, fee link, seat decision, and admission action for ${subject}.`,
        blocks: [
          { title: 'Applicant Intake', detail: 'Capture enquiry source, student profile, requested class, guardian, and first response.', items: ['Enquiry source', 'Student', 'Class', 'Guardian'], icon: <Users size={18} />, tone: 'from-cyan-500 to-blue-600' },
          { title: 'Document Verification', detail: 'Check proof, transfer certificate, previous marks, health file, and missing documents.', items: ['Proof', 'Transfer', 'Marks', 'Missing'], icon: <FileText size={18} />, tone: 'from-emerald-500 to-teal-500' },
          { title: 'Seat and Approval', detail: 'Review class capacity, interview, sibling priority, and admission approval.', items: ['Capacity', 'Interview', 'Priority', 'Approval'], icon: <ShieldCheck size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
          { title: 'Student File Output', detail: 'Generate admission number, class placement, fee link, and final register.', items: ['Admission no.', 'Placement', 'Fees', 'Register'], icon: <Database size={18} />, tone: 'from-amber-500 to-orange-500' },
        ],
        controls: ['Admission number rule', 'Document checklist', 'Class seat capacity', 'Guardian consent'],
        outputs: [`${detailName} admission file`, 'Student master register', 'Document gap list', 'Admission decision report'],
      };
    }
    if (matches('class', 'section', 'teacher', 'timetable', 'homework', 'curriculum')) {
      return {
        eyebrow,
        title: `${detailName} class operations`,
        summary: `A school academic operations page for ${subject}, with class structure, section allocation, teacher workload, timetable slots, curriculum coverage, and homework controls.`,
        icon: <GraduationCap size={22} />,
        tone: 'from-violet-600 to-cyan-500',
        formTitle: `Plan ${subject}`,
        titleLabel: 'Class work item',
        titlePlaceholder: `${detailName} class, section, timetable, teacher, or homework item`,
        subjectLabel: 'Class / subject',
        subjectPlaceholder: 'Grade, section, subject, room, student group, or house',
        ownerLabel: 'Academic owner',
        ownerPlaceholder: 'Class teacher, subject teacher, timetable coordinator, or academic head',
        detailsLabel: 'Academic details',
        detailsPlaceholder: `Add class capacity, section, teacher assignment, timetable slot, curriculum topic, homework plan, and parent communication for ${subject}.`,
        blocks: [
          { title: 'Class Structure', detail: 'Set class, section, room, roll range, house, and student strength.', items: ['Class', 'Section', 'Room', 'Strength'], icon: <GraduationCap size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
          { title: 'Teacher Load', detail: 'Assign teachers, substitutes, periods, subject ownership, and workload balance.', items: ['Teacher', 'Subject', 'Periods', 'Load'], icon: <Users size={18} />, tone: 'from-sky-500 to-cyan-500' },
          { title: 'Timetable Control', detail: 'Plan periods, labs, conflicts, published timetable, and change history.', items: ['Periods', 'Labs', 'Conflicts', 'Publish'], icon: <CalendarDays size={18} />, tone: 'from-emerald-500 to-teal-500' },
          { title: 'Homework Follow-up', detail: 'Create homework tasks, due dates, student scope, reminders, and completion review.', items: ['Task', 'Due date', 'Scope', 'Review'], icon: <ClipboardList size={18} />, tone: 'from-amber-500 to-orange-500' },
        ],
        controls: ['Class capacity', 'Teacher workload', 'Timetable lock', 'Homework visibility'],
        outputs: [`${detailName} class plan`, 'Teacher workload sheet', 'Timetable register', 'Homework completion report'],
      };
    }
    if (matches('attendance', 'late', 'leave', 'parent', 'behaviour', 'conduct', 'house')) {
      return {
        eyebrow,
        title: `${detailName} attendance and behaviour desk`,
        summary: `A school student care page for ${subject}, with daily attendance, late arrivals, leave requests, parent alerts, conduct notes, house activity, and follow-up reporting.`,
        icon: <ClipboardList size={22} />,
        tone: 'from-sky-500 to-emerald-500',
        formTitle: `Record ${subject}`,
        titleLabel: 'Attendance / conduct item',
        titlePlaceholder: `${detailName} attendance, leave, parent alert, or behaviour case`,
        subjectLabel: 'Student / class',
        subjectPlaceholder: 'Student, class, section, house, or guardian',
        ownerLabel: 'Pastoral owner',
        ownerPlaceholder: 'Class teacher, attendance clerk, discipline office, or house master',
        detailsLabel: 'Care details',
        detailsPlaceholder: `Add attendance session, absence reason, guardian response, behaviour note, house point, risk flag, and follow-up for ${subject}.`,
        blocks: [
          { title: 'Attendance Marking', detail: 'Track present, absent, late, excused, leave, and session proof.', items: ['Present', 'Absent', 'Late', 'Leave'], icon: <ClipboardList size={18} />, tone: 'from-sky-500 to-cyan-500' },
          { title: 'Guardian Communication', detail: 'Send parent alerts, capture consent, acknowledgement, and escalation.', items: ['Alert', 'Consent', 'Reply', 'Escalation'], icon: <MessageSquare size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
          { title: 'Conduct Review', detail: 'Record discipline notes, merits, house activity, intervention, and support.', items: ['Conduct', 'Merit', 'House', 'Support'], icon: <ShieldCheck size={18} />, tone: 'from-amber-500 to-orange-500' },
          { title: 'Care Report', detail: 'Summarize attendance %, risk learners, alerts, actions, and closed cases.', items: ['Percent', 'Risk', 'Actions', 'Closed'], icon: <BarChart3 size={18} />, tone: 'from-emerald-500 to-teal-500' },
        ],
        controls: ['Attendance threshold', 'Leave approval', 'Parent alert rule', 'Conduct review'],
        outputs: [`${detailName} attendance register`, 'Parent alert log', 'Behaviour intervention file', 'Attendance risk report'],
      };
    }
    if (matches('exam', 'grade', 'marks', 'report', 'promotion')) {
      return {
        eyebrow,
        title: `${detailName} examination control`,
        summary: `A school exam and report card page for ${subject}, with exam planning, marks entry, gradebook review, result approval, parent remarks, and promotion output.`,
        icon: <Award size={22} />,
        tone: 'from-indigo-500 to-violet-600',
        formTitle: `Prepare ${subject}`,
        titleLabel: 'Exam / result item',
        titlePlaceholder: `${detailName} exam schedule, gradebook, marks, report card, or promotion case`,
        subjectLabel: 'Student / class / exam',
        subjectPlaceholder: 'Student, class, section, exam name, subject, or roll number',
        ownerLabel: 'Exam owner',
        ownerPlaceholder: 'Exam coordinator, subject teacher, class teacher, or principal office',
        detailsLabel: 'Result details',
        detailsPlaceholder: `Add exam paper, marks, grade scale, moderation, correction, parent remark, report card publish, and promotion decision for ${subject}.`,
        blocks: [
          { title: 'Exam Planning', detail: 'Create exam timetable, paper, subject, room, invigilator, and calendar.', items: ['Timetable', 'Paper', 'Room', 'Invigilator'], icon: <CalendarDays size={18} />, tone: 'from-indigo-500 to-blue-600' },
          { title: 'Gradebook Review', detail: 'Enter marks, grade scale, moderation, corrections, and approval owner.', items: ['Marks', 'Scale', 'Moderation', 'Approval'], icon: <ClipboardList size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
          { title: 'Report Card Release', detail: 'Publish report cards, remarks, parent copies, and result lock.', items: ['Report card', 'Remarks', 'Parent copy', 'Lock'], icon: <Award size={18} />, tone: 'from-emerald-500 to-teal-500' },
          { title: 'Promotion Output', detail: 'Close promoted, conditional, repeat, remedial, and archive decisions.', items: ['Promoted', 'Conditional', 'Repeat', 'Archive'], icon: <BarChart3 size={18} />, tone: 'from-amber-500 to-orange-500' },
        ],
        controls: ['Mark entry lock', 'Grade scale', 'Result approval', 'Publish permission'],
        outputs: [`${detailName} gradebook`, 'Report card batch', 'Promotion list', 'Exam analytics report'],
      };
    }
    return {
      eyebrow,
      title: `${detailName} school service page`,
      summary: `A school operations page for ${subject}, with student profile links, fees, transport, hostel, library, service access, guardian communication, and management output.`,
      icon: <Bus size={22} />,
      tone: 'from-emerald-500 to-cyan-500',
      formTitle: `Manage ${subject}`,
      titleLabel: 'School service item',
      titlePlaceholder: `${detailName} student, fee, transport, hostel, library, or support item`,
      subjectLabel: 'Student / service',
      subjectPlaceholder: 'Student, guardian, invoice, route, room, book, or support request',
      ownerLabel: 'Service owner',
      ownerPlaceholder: 'Accounts desk, transport owner, warden, librarian, support desk, or admin',
      detailsLabel: 'Service details',
      detailsPlaceholder: `Add student, invoice, route, hostel room, library resource, service access, guardian confirmation, and report need for ${subject}.`,
      blocks: [
        { title: 'Student Link', detail: 'Connect the service to student profile, class, guardian, and account.', items: ['Student', 'Class', 'Guardian', 'Account'], icon: <Users size={18} />, tone: 'from-cyan-500 to-blue-600' },
        { title: 'Service Control', detail: 'Manage fee account, transport route, hostel room, library access, or support ticket.', items: ['Fees', 'Route', 'Room', 'Library'], icon: <Bus size={18} />, tone: 'from-emerald-500 to-teal-500' },
        { title: 'Approval and Access', detail: 'Check payment, guardian consent, service permission, and exception notes.', items: ['Payment', 'Consent', 'Access', 'Exception'], icon: <ShieldCheck size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
        { title: 'Service Report', detail: 'Prepare service summary, unpaid list, route sheet, room list, and audit output.', items: ['Summary', 'Unpaid', 'Route', 'Audit'], icon: <BarChart3 size={18} />, tone: 'from-amber-500 to-orange-500' },
      ],
      controls: ['Fee clearance', 'Route capacity', 'Room access', 'Library issue rule'],
      outputs: [`${detailName} service register`, 'Fee and service summary', 'Campus access report', 'Guardian communication log'],
    };
  }

  if (moduleSlug === 'institutes') {
    if (matches('lead', 'enquiry', 'counselling', 'demo', 'follow', 'admission', 'conversion')) {
      return {
        eyebrow,
        title: `${detailName} enrollment CRM`,
        summary: `An institute lead and enrollment page for ${subject}, with enquiry source, counselling notes, demo class booking, follow-up pipeline, conversion decision, and admission handoff.`,
        icon: <MessageSquare size={22} />,
        tone: 'from-violet-600 to-fuchsia-500',
        formTitle: `Create ${subject} lead record`,
        titleLabel: 'Lead / enrollment item',
        titlePlaceholder: `${detailName} enquiry, counselling, demo, follow-up, or admission conversion`,
        subjectLabel: 'Lead / learner',
        subjectPlaceholder: 'Prospect, learner, phone, email, company, or branch',
        ownerLabel: 'Counsellor',
        ownerPlaceholder: 'Counsellor, admission owner, branch admin, or sales owner',
        detailsLabel: 'Enrollment details',
        detailsPlaceholder: `Add lead source, course interest, counselling note, demo booking, budget, objection, next follow-up, and conversion status for ${subject}.`,
        blocks: [
          { title: 'Lead Capture', detail: 'Store source, contact, course interest, branch, and first response.', items: ['Source', 'Contact', 'Course', 'Branch'], icon: <MessageSquare size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
          { title: 'Counselling Notes', detail: 'Capture need, eligibility, budget, objection, and counsellor follow-up.', items: ['Need', 'Eligibility', 'Budget', 'Objection'], icon: <Users size={18} />, tone: 'from-sky-500 to-cyan-500' },
          { title: 'Demo and Follow-up', detail: 'Book demo class, assign trainer, note attendance, and set next call.', items: ['Demo', 'Trainer', 'Attendance', 'Next call'], icon: <CalendarDays size={18} />, tone: 'from-emerald-500 to-teal-500' },
          { title: 'Conversion Output', detail: 'Close admission, payment plan, batch placement, or lost reason.', items: ['Admission', 'Payment', 'Batch', 'Lost'], icon: <BarChart3 size={18} />, tone: 'from-amber-500 to-orange-500' },
        ],
        controls: ['Lead source rule', 'Follow-up SLA', 'Counsellor owner', 'Admission checklist'],
        outputs: [`${detailName} lead register`, 'Demo attendance sheet', 'Conversion pipeline', 'Admission handoff file'],
      };
    }
    if (matches('course', 'batch', 'session', 'learner', 'progress')) {
      return {
        eyebrow,
        title: `${detailName} batch delivery page`,
        summary: `An institute course delivery page for ${subject}, with course catalogue, batch schedule, trainer assignment, session plan, learner attendance, and progress tracking.`,
        icon: <BookOpen size={22} />,
        tone: 'from-sky-500 to-cyan-500',
        formTitle: `Plan ${subject}`,
        titleLabel: 'Course / batch item',
        titlePlaceholder: `${detailName} course, batch, session, learner attendance, or progress item`,
        subjectLabel: 'Course / batch',
        subjectPlaceholder: 'Course name, batch code, learner group, branch, or online cohort',
        ownerLabel: 'Delivery owner',
        ownerPlaceholder: 'Trainer, course coordinator, branch admin, or academic owner',
        detailsLabel: 'Delivery details',
        detailsPlaceholder: `Add schedule, trainer, room or link, capacity, resources, attendance rule, learner progress, and delivery risk for ${subject}.`,
        blocks: [
          { title: 'Course Profile', detail: 'Define syllabus, duration, level, mode, fee plan, and branch visibility.', items: ['Syllabus', 'Duration', 'Mode', 'Branch'], icon: <BookOpen size={18} />, tone: 'from-indigo-500 to-blue-600' },
          { title: 'Batch Calendar', detail: 'Create schedule, room, trainer, session sequence, and capacity limit.', items: ['Schedule', 'Room', 'Trainer', 'Capacity'], icon: <CalendarDays size={18} />, tone: 'from-sky-500 to-cyan-500' },
          { title: 'Learner Progress', detail: 'Track attendance, modules completed, missed sessions, and intervention.', items: ['Attendance', 'Modules', 'Missed', 'Intervention'], icon: <ClipboardList size={18} />, tone: 'from-emerald-500 to-teal-500' },
          { title: 'Delivery Output', detail: 'Publish completion status, resource gaps, trainer notes, and batch report.', items: ['Completion', 'Resources', 'Notes', 'Report'], icon: <BarChart3 size={18} />, tone: 'from-amber-500 to-orange-500' },
        ],
        controls: ['Batch capacity', 'Schedule lock', 'Attendance rule', 'Course visibility'],
        outputs: [`${detailName} batch sheet`, 'Learner progress report', 'Session delivery log', 'Course completion list'],
      };
    }
    if (matches('trainer', 'workload', 'resource', 'replacement', 'performance')) {
      return {
        eyebrow,
        title: `${detailName} trainer operations`,
        summary: `An institute trainer desk for ${subject}, with calendar, workload balance, resource approval, replacement planning, performance score, and review output.`,
        icon: <Users size={22} />,
        tone: 'from-emerald-500 to-teal-500',
        formTitle: `Manage ${subject}`,
        titleLabel: 'Trainer operation item',
        titlePlaceholder: `${detailName} trainer calendar, workload, resource, replacement, or performance item`,
        subjectLabel: 'Trainer / batch',
        subjectPlaceholder: 'Trainer, batch, course, session, branch, or learner group',
        ownerLabel: 'Training manager',
        ownerPlaceholder: 'Trainer, coordinator, replacement owner, branch admin, or academic lead',
        detailsLabel: 'Trainer details',
        detailsPlaceholder: `Add availability, workload, blocked slots, resource need, replacement plan, learner feedback, and performance notes for ${subject}.`,
        blocks: [
          { title: 'Calendar Load', detail: 'Manage session slots, branch duties, conflicts, and leave blocks.', items: ['Slots', 'Branch', 'Conflict', 'Leave'], icon: <CalendarDays size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
          { title: 'Workload Balance', detail: 'Review active batches, learner count, training hours, and overload warnings.', items: ['Batches', 'Learners', 'Hours', 'Warnings'], icon: <Users size={18} />, tone: 'from-sky-500 to-cyan-500' },
          { title: 'Resource Gate', detail: 'Approve lab, software, equipment, materials, and LMS access.', items: ['Lab', 'Software', 'Equipment', 'LMS'], icon: <ShieldCheck size={18} />, tone: 'from-emerald-500 to-teal-500' },
          { title: 'Performance Review', detail: 'Track feedback, completion quality, punctuality, and trainer score.', items: ['Feedback', 'Quality', 'Punctuality', 'Score'], icon: <BarChart3 size={18} />, tone: 'from-amber-500 to-orange-500' },
        ],
        controls: ['Trainer availability', 'Workload limit', 'Resource approval', 'Replacement rule'],
        outputs: [`${detailName} trainer sheet`, 'Workload balance report', 'Resource request log', 'Trainer performance review'],
      };
    }
    if (matches('assessment', 'assignment', 'practical', 'test', 'rubric', 'feedback', 'remedial')) {
      return {
        eyebrow,
        title: `${detailName} assessment workspace`,
        summary: `An institute assessment page for ${subject}, with assignment setup, practical tests, rubric marking, evaluator review, feedback release, remedial plans, and certificate readiness.`,
        icon: <ClipboardList size={22} />,
        tone: 'from-cyan-500 to-violet-600',
        formTitle: `Create ${subject} assessment`,
        titleLabel: 'Assessment item',
        titlePlaceholder: `${detailName} assignment, practical test, rubric, feedback, or remedial item`,
        subjectLabel: 'Learner / batch',
        subjectPlaceholder: 'Learner, batch, course, assessment group, or submission reference',
        ownerLabel: 'Evaluator',
        ownerPlaceholder: 'Trainer, evaluator, course owner, or branch academic lead',
        detailsLabel: 'Assessment details',
        detailsPlaceholder: `Add task instructions, practical evidence, rubric, score, feedback, retest or remedial plan, and certificate readiness for ${subject}.`,
        blocks: [
          { title: 'Task Builder', detail: 'Create assignment, practical task, rubric, due window, and learner scope.', items: ['Task', 'Practical', 'Rubric', 'Scope'], icon: <ClipboardList size={18} />, tone: 'from-cyan-500 to-blue-600' },
          { title: 'Evaluator Review', detail: 'Assign evaluator, check evidence, score rubric, and decide revision.', items: ['Evaluator', 'Evidence', 'Score', 'Revision'], icon: <ShieldCheck size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
          { title: 'Remedial Lane', detail: 'Plan extra session, make-up task, retest, and trainer follow-up.', items: ['Extra session', 'Make-up', 'Retest', 'Follow-up'], icon: <GraduationCap size={18} />, tone: 'from-emerald-500 to-teal-500' },
          { title: 'Completion Signal', detail: 'Publish result, update progress, unlock certificate, and export summary.', items: ['Result', 'Progress', 'Certificate', 'Export'], icon: <BarChart3 size={18} />, tone: 'from-amber-500 to-orange-500' },
        ],
        controls: ['Submission window', 'Evaluator access', 'Pass mark rule', 'Feedback lock'],
        outputs: [`${detailName} assessment register`, 'Rubric score sheet', 'Remedial action list', 'Certificate readiness report'],
      };
    }
    return {
      eyebrow,
      title: `${detailName} institute operations`,
      summary: `An institute operations page for ${subject}, with lead CRM, batch delivery, trainer ownership, assessment proof, revenue clearance, certificates, branch follow-up, and support output.`,
      icon: <BarChart3 size={22} />,
      tone: 'from-indigo-500 to-cyan-500',
      formTitle: `Manage ${subject}`,
      titleLabel: 'Institute operation item',
      titlePlaceholder: `${detailName} lead, batch, trainer, payment, certificate, branch, or support item`,
      subjectLabel: 'Lead / learner / batch',
      subjectPlaceholder: 'Lead, learner, batch, course, branch, invoice, certificate, or support request',
      ownerLabel: 'Institute owner',
      ownerPlaceholder: 'Counsellor, trainer, branch admin, finance desk, certificate owner, or support owner',
      detailsLabel: 'Institute details',
      detailsPlaceholder: `Add CRM source, batch delivery, trainer action, assessment status, payment clearance, certificate release, branch note, and follow-up for ${subject}.`,
      blocks: [
        { title: 'Enrollment Link', detail: 'Connect enquiry, counselling, demo, admission, and learner profile.', items: ['Enquiry', 'Counselling', 'Demo', 'Admission'], icon: <MessageSquare size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
        { title: 'Delivery Link', detail: 'Attach course, batch, trainer, sessions, attendance, and resources.', items: ['Course', 'Batch', 'Trainer', 'Sessions'], icon: <BookOpen size={18} />, tone: 'from-sky-500 to-cyan-500' },
        { title: 'Revenue Clearance', detail: 'Track invoice, discount, installment, payment reminder, and certificate lock.', items: ['Invoice', 'Discount', 'Payment', 'Certificate'], icon: <Award size={18} />, tone: 'from-emerald-500 to-teal-500' },
        { title: 'Branch Report', detail: 'Close support, campaign, renewal, branch performance, and management output.', items: ['Support', 'Campaign', 'Renewal', 'Report'], icon: <BarChart3 size={18} />, tone: 'from-amber-500 to-orange-500' },
      ],
      controls: ['Lead source rule', 'Batch capacity', 'Trainer workload', 'Payment clearance'],
      outputs: [`${detailName} institute register`, 'Batch and lead summary', 'Revenue certificate pack', 'Branch performance report'],
    };
  }

  if (moduleSlug === 'certificates') {
    return {
      eyebrow,
      title: `${detailName} certificate desk`,
      summary: `A certificate operations page for ${subject}, with template control, learner eligibility, approval signatures, QR verification, print batches, reissue notes, and archive tracking.`,
      icon: <Award size={22} />,
      tone: 'from-violet-600 to-amber-500',
      formTitle: `Prepare ${subject}`,
      titleLabel: 'Certificate request',
      titlePlaceholder: `${detailName} for learner, batch, programme, or ceremony`,
      subjectLabel: 'Student / recipient',
      subjectPlaceholder: 'Recipient name, admission number, batch, or programme',
      ownerLabel: 'Issuing officer',
      ownerPlaceholder: 'Registrar, exams office, certificate desk, or approver',
      detailsLabel: 'Certificate details',
      detailsPlaceholder: `Add template version, eligibility proof, signature owner, QR status, print queue, delivery mode, and reissue reason for ${subject}.`,
      blocks: [
        { title: 'Template Lock', detail: 'Select the approved template, seal, language, paper size, and print rule.', items: ['Template', 'Seal', 'Paper size', 'Version'], icon: <FileText size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
        { title: 'Eligibility Check', detail: 'Verify completion status, fee clearance, result status, and required evidence.', items: ['Completion', 'Fees', 'Results', 'Evidence'], icon: <ShieldCheck size={18} />, tone: 'from-emerald-500 to-teal-500' },
        { title: 'Signature Route', detail: 'Route to registrar, department head, principal, or authorized signer.', items: ['Registrar', 'Department', 'Signer', 'Date'], icon: <Users size={18} />, tone: 'from-sky-500 to-cyan-500' },
        { title: 'QR Release', detail: 'Generate QR metadata, release certificate, and archive the issue history.', items: ['QR code', 'Release', 'Print', 'Archive'], icon: <BarChart3 size={18} />, tone: 'from-amber-500 to-orange-500' },
      ],
      controls: ['Template version lock', 'Eligibility rule', 'Signature approval', 'QR verification'],
      outputs: [`${detailName} issue register`, 'Printable certificate batch', 'QR verification log', 'Reissue audit file'],
    };
  }

  if (moduleSlug === 'support') {
    return {
      eyebrow,
      title: `${detailName} support desk`,
      summary: `A service desk page for ${subject}, with ticket intake, SLA priority, agent ownership, response notes, resolution proof, and service quality follow-up.`,
      icon: <Headphones size={22} />,
      tone: 'from-cyan-500 to-blue-600',
      formTitle: `Create ${subject} ticket`,
      titleLabel: 'Ticket subject',
      titlePlaceholder: `${detailName} issue, request, service need, or escalation`,
      subjectLabel: 'Requester',
      subjectPlaceholder: 'Student, staff, guardian, department, or office',
      ownerLabel: 'Support owner',
      ownerPlaceholder: 'Help desk agent, IT owner, admin desk, or escalation lead',
      detailsLabel: 'Ticket details',
      detailsPlaceholder: `Add problem summary, affected user, screenshots or proof, priority reason, SLA target, response note, and resolution plan for ${subject}.`,
      blocks: [
        { title: 'Request Intake', detail: 'Capture requester, category, channel, screenshot, and affected service.', items: ['Requester', 'Category', 'Channel', 'Proof'], icon: <Headphones size={18} />, tone: 'from-cyan-500 to-blue-600' },
        { title: 'SLA Triage', detail: 'Set urgency, priority, impact, due time, and escalation owner.', items: ['Impact', 'Urgency', 'SLA', 'Escalation'], icon: <ShieldCheck size={18} />, tone: 'from-amber-500 to-orange-500' },
        { title: 'Agent Response', detail: 'Track replies, internal notes, fixes tried, and user confirmation.', items: ['Reply', 'Internal note', 'Fix', 'Confirmation'], icon: <MessageSquare size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
        { title: 'Resolution Quality', detail: 'Close with root cause, satisfaction, reopened status, and support report.', items: ['Root cause', 'Resolved', 'Rating', 'Report'], icon: <BarChart3 size={18} />, tone: 'from-emerald-500 to-teal-500' },
      ],
      controls: ['SLA timer', 'Agent assignment', 'Escalation rule', 'Closure confirmation'],
      outputs: [`${detailName} ticket register`, 'SLA performance report', 'Resolution knowledge note', 'Service quality log'],
    };
  }

  if (moduleSlug === 'help-centre') {
    return {
      eyebrow,
      title: `${detailName} help guide`,
      summary: `A knowledge base page for ${subject}, with guide intent, step-by-step article drafting, related answers, search keywords, and reader feedback tracking.`,
      icon: <MessageSquare size={22} />,
      tone: 'from-violet-600 to-sky-500',
      formTitle: `Draft ${subject} guide`,
      titleLabel: 'Guide title',
      titlePlaceholder: `${detailName} article, FAQ, walkthrough, or help answer`,
      subjectLabel: 'User question',
      subjectPlaceholder: 'What the student, staff, or admin is trying to solve',
      ownerLabel: 'Guide owner',
      ownerPlaceholder: 'Support writer, admin owner, or module expert',
      detailsLabel: 'Guide content',
      detailsPlaceholder: `Add the exact question, search keywords, steps, screenshots needed, related pages, and resolution notes for ${subject}.`,
      blocks: [
        { title: 'Search Intent', detail: 'Define what users type, what they mean, and where the answer belongs.', items: ['Keywords', 'Intent', 'Category', 'Module'], icon: <ClipboardList size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
        { title: 'Step Guide', detail: 'Write clear steps, required screenshots, expected result, and fallback path.', items: ['Steps', 'Screenshots', 'Result', 'Fallback'], icon: <FileText size={18} />, tone: 'from-sky-500 to-cyan-500' },
        { title: 'Related Answers', detail: 'Connect matching FAQs, support routes, account help, and article links.', items: ['FAQs', 'Support', 'Account', 'Links'], icon: <MessageSquare size={18} />, tone: 'from-emerald-500 to-teal-500' },
        { title: 'Reader Feedback', detail: 'Track helpful votes, unresolved comments, update requests, and owner review.', items: ['Helpful', 'Unresolved', 'Update', 'Review'], icon: <BarChart3 size={18} />, tone: 'from-amber-500 to-orange-500' },
      ],
      controls: ['Keyword mapping', 'Article owner', 'Publish approval', 'Feedback review'],
      outputs: [`${detailName} help article`, 'Search result card', 'Related FAQ pack', 'Guide update log'],
    };
  }

  if (moduleSlug === 'community') {
    return {
      eyebrow,
      title: `${detailName} community workspace`,
      summary: `A community page for ${subject}, with member audience, group activity, announcements, polls, event planning, moderation rules, and engagement records.`,
      icon: <Users size={22} />,
      tone: 'from-fuchsia-600 to-cyan-500',
      formTitle: `Create ${subject} community item`,
      titleLabel: 'Community item',
      titlePlaceholder: `${detailName} group, event, announcement, post, poll, or moderation case`,
      subjectLabel: 'Audience / group',
      subjectPlaceholder: 'Students, alumni, staff, club, batch, or public audience',
      ownerLabel: 'Community owner',
      ownerPlaceholder: 'Moderator, mentor, club lead, or engagement owner',
      detailsLabel: 'Community details',
      detailsPlaceholder: `Add audience, purpose, schedule, content, moderation rule, visibility, feedback channel, and engagement target for ${subject}.`,
      blocks: [
        { title: 'Audience Map', detail: 'Choose members, clubs, batches, mentors, alumni, and visibility scope.', items: ['Members', 'Clubs', 'Batch', 'Visibility'], icon: <Users size={18} />, tone: 'from-fuchsia-600 to-pink-500' },
        { title: 'Post Builder', detail: 'Prepare announcements, polls, event details, attachments, and schedule.', items: ['Announcement', 'Poll', 'Event', 'Attachment'], icon: <MessageSquare size={18} />, tone: 'from-sky-500 to-cyan-500' },
        { title: 'Moderation Rule', detail: 'Set approval, reporting, blocked content, and moderator review.', items: ['Approval', 'Report', 'Block', 'Review'], icon: <ShieldCheck size={18} />, tone: 'from-amber-500 to-orange-500' },
        { title: 'Engagement Board', detail: 'Track attendance, comments, reactions, feedback, and follow-up tasks.', items: ['Attendance', 'Comments', 'Feedback', 'Tasks'], icon: <BarChart3 size={18} />, tone: 'from-emerald-500 to-teal-500' },
      ],
      controls: ['Audience targeting', 'Post approval', 'Moderation queue', 'Event capacity'],
      outputs: [`${detailName} engagement register`, 'Community activity report', 'Moderation audit', 'Feedback summary'],
    };
  }

  if (moduleSlug === 'transport') {
    return {
      eyebrow,
      title: `${detailName} transport console`,
      summary: `A transport operations page for ${subject}, with route maps, stops, vehicle assignment, driver duty, student allocation, live tracking, and trip closure.`,
      icon: <Bus size={22} />,
      tone: 'from-sky-500 to-emerald-500',
      formTitle: `Plan ${subject}`,
      titleLabel: 'Route / trip title',
      titlePlaceholder: `${detailName} route, pickup plan, trip, stop, or vehicle duty`,
      subjectLabel: 'Route / pickup zone',
      subjectPlaceholder: 'Route name, stop cluster, campus zone, or student group',
      ownerLabel: 'Transport owner',
      ownerPlaceholder: 'Transport manager, driver, route supervisor, or dispatcher',
      detailsLabel: 'Route details',
      detailsPlaceholder: `Add map notes, stops, vehicle, driver, pickup time, capacity, student allocation, live status, and exception notes for ${subject}.`,
      blocks: [
        { title: 'Map and Stops', detail: 'Build route map, pickup sequence, stop timing, and campus drop point.', items: ['Route map', 'Stops', 'Pickup time', 'Drop point'], icon: <MapPinned size={18} />, tone: 'from-sky-500 to-cyan-500' },
        { title: 'Vehicle Roster', detail: 'Assign vehicle, driver, assistant, capacity, and duty shift.', items: ['Vehicle', 'Driver', 'Assistant', 'Capacity'], icon: <Bus size={18} />, tone: 'from-emerald-500 to-teal-500' },
        { title: 'Passenger Allocation', detail: 'Attach students, staff riders, guardian contacts, and exceptions.', items: ['Students', 'Staff', 'Guardian', 'Exception'], icon: <Users size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
        { title: 'Live Trip Closure', detail: 'Track start, delay, incidents, arrival, and daily route report.', items: ['Start', 'Delay', 'Incident', 'Arrival'], icon: <BarChart3 size={18} />, tone: 'from-amber-500 to-orange-500' },
      ],
      controls: ['Capacity limit', 'Driver duty lock', 'Stop approval', 'Incident escalation'],
      outputs: [`${detailName} route sheet`, 'Vehicle duty register', 'Passenger list', 'Trip closure report'],
    };
  }

  if (moduleSlug === 'hostel') {
    return {
      eyebrow,
      title: `${detailName} hostel desk`,
      summary: `A residential operations page for ${subject}, with room and bed allocation, resident care, wardens, maintenance, leave requests, safety checks, and occupancy reporting.`,
      icon: <BedDouble size={22} />,
      tone: 'from-amber-500 to-rose-500',
      formTitle: `Manage ${subject}`,
      titleLabel: 'Hostel record',
      titlePlaceholder: `${detailName} room, resident, bed, maintenance, leave, or care case`,
      subjectLabel: 'Resident / room',
      subjectPlaceholder: 'Student, room number, block, floor, bed, or resident group',
      ownerLabel: 'Hostel owner',
      ownerPlaceholder: 'Warden, floor in-charge, maintenance owner, or hostel admin',
      detailsLabel: 'Residential details',
      detailsPlaceholder: `Add room, bed, resident profile, guardian contact, maintenance note, leave timing, safety issue, meal status, and warden follow-up for ${subject}.`,
      blocks: [
        { title: 'Room Allocation', detail: 'Assign block, room, bed, occupancy, roommate, and move-in status.', items: ['Block', 'Room', 'Bed', 'Occupancy'], icon: <BedDouble size={18} />, tone: 'from-amber-500 to-orange-500' },
        { title: 'Resident Profile', detail: 'Capture student, guardian, medical note, documents, and stay period.', items: ['Student', 'Guardian', 'Medical', 'Documents'], icon: <Users size={18} />, tone: 'from-sky-500 to-cyan-500' },
        { title: 'Care Requests', detail: 'Track meals, maintenance, complaints, leave, and warden actions.', items: ['Meals', 'Maintenance', 'Leave', 'Action'], icon: <ClipboardList size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
        { title: 'Safety Review', detail: 'Manage check-in logs, incidents, visitors, and room audit closure.', items: ['Check-in', 'Incident', 'Visitor', 'Audit'], icon: <ShieldCheck size={18} />, tone: 'from-emerald-500 to-teal-500' },
      ],
      controls: ['Bed capacity', 'Warden approval', 'Leave rule', 'Visitor policy'],
      outputs: [`${detailName} occupancy register`, 'Resident care report', 'Maintenance log', 'Safety audit'],
    };
  }

  if (moduleSlug === 'library') {
    return {
      eyebrow,
      title: `${detailName} library desk`,
      summary: `A library operations page for ${subject}, with catalogue data, accession tracking, issue and return, reservations, digital files, overdue rules, and circulation reports.`,
      icon: <BookOpen size={22} />,
      tone: 'from-emerald-500 to-sky-500',
      formTitle: `Manage ${subject}`,
      titleLabel: 'Library item',
      titlePlaceholder: `${detailName} book, accession, issue, return, reservation, or digital resource`,
      subjectLabel: 'Book / member',
      subjectPlaceholder: 'Book title, accession number, student, staff, ISBN, or category',
      ownerLabel: 'Library owner',
      ownerPlaceholder: 'Librarian, circulation desk, catalogue owner, or archive owner',
      detailsLabel: 'Library details',
      detailsPlaceholder: `Add accession, category, shelf, borrower, due date, reservation status, fine rule, digital link, and circulation notes for ${subject}.`,
      blocks: [
        { title: 'Catalogue Record', detail: 'Capture title, accession, ISBN, author, category, shelf, and copy status.', items: ['Title', 'Accession', 'ISBN', 'Shelf'], icon: <BookOpen size={18} />, tone: 'from-emerald-500 to-teal-500' },
        { title: 'Issue and Return', detail: 'Track borrower, issue date, due date, renewal, and return proof.', items: ['Borrower', 'Issue', 'Due', 'Return'], icon: <ClipboardList size={18} />, tone: 'from-sky-500 to-cyan-500' },
        { title: 'Reservation Queue', detail: 'Manage holds, priority, waiting members, and copy allocation.', items: ['Hold', 'Priority', 'Queue', 'Copy'], icon: <Users size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
        { title: 'Overdue Control', detail: 'Track overdue days, reminders, fines, lost books, and reports.', items: ['Overdue', 'Reminder', 'Fine', 'Lost'], icon: <BarChart3 size={18} />, tone: 'from-amber-500 to-orange-500' },
      ],
      controls: ['Issue limit', 'Renewal rule', 'Fine policy', 'Catalogue approval'],
      outputs: [`${detailName} circulation register`, 'Catalogue export', 'Overdue report', 'Member history'],
    };
  }

  if (moduleSlug === 'submissions') {
    return {
      eyebrow,
      title: `${detailName} submission workflow`,
      summary: `A submission management page for ${subject}, with upload windows, evidence files, evaluator assignment, rubric review, revision handling, feedback release, and archive output.`,
      icon: <Upload size={22} />,
      tone: 'from-cyan-500 to-violet-600',
      formTitle: `Create ${subject} submission item`,
      titleLabel: 'Submission task',
      titlePlaceholder: `${detailName} assignment, project, internship report, or evidence file`,
      subjectLabel: 'Student / batch',
      subjectPlaceholder: 'Student, batch, programme, evaluator group, or project team',
      ownerLabel: 'Evaluator / owner',
      ownerPlaceholder: 'Teacher, mentor, evaluator, coordinator, or academic owner',
      detailsLabel: 'Submission details',
      detailsPlaceholder: `Add upload window, required files, rubric, evaluator, originality status, revision rule, feedback release, and archive notes for ${subject}.`,
      blocks: [
        { title: 'Upload Window', detail: 'Set opening time, closing time, allowed file types, and late rules.', items: ['Open time', 'Close time', 'File type', 'Late rule'], icon: <Upload size={18} />, tone: 'from-cyan-500 to-blue-600' },
        { title: 'Evidence Files', detail: 'Collect project files, reports, attachments, versions, and proof notes.', items: ['Project', 'Report', 'Version', 'Proof'], icon: <FileText size={18} />, tone: 'from-emerald-500 to-teal-500' },
        { title: 'Evaluator Review', detail: 'Assign evaluator, rubric, marks, comments, and revision decision.', items: ['Evaluator', 'Rubric', 'Marks', 'Revision'], icon: <ShieldCheck size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
        { title: 'Feedback Release', detail: 'Publish outcome, archive evidence, notify learner, and export report.', items: ['Feedback', 'Archive', 'Notify', 'Export'], icon: <BarChart3 size={18} />, tone: 'from-amber-500 to-orange-500' },
      ],
      controls: ['File type rule', 'Late policy', 'Rubric lock', 'Feedback release'],
      outputs: [`${detailName} submission register`, 'Evaluator workload', 'Revision tracker', 'Evidence archive'],
    };
  }

  if (moduleSlug === 'internship') {
    return {
      eyebrow,
      title: `${detailName} placement desk`,
      summary: `An internship operations page for ${subject}, with company roles, student eligibility, mentor allocation, weekly progress logs, supervisor review, completion proof, and placement reports.`,
      icon: <BriefcaseBusiness size={22} />,
      tone: 'from-indigo-500 to-cyan-500',
      formTitle: `Create ${subject} placement record`,
      titleLabel: 'Placement item',
      titlePlaceholder: `${detailName} company, role, offer, weekly log, or completion case`,
      subjectLabel: 'Student / company',
      subjectPlaceholder: 'Student, company, mentor, role, department, or batch',
      ownerLabel: 'Placement owner',
      ownerPlaceholder: 'Placement officer, mentor, supervisor, or department coordinator',
      detailsLabel: 'Placement details',
      detailsPlaceholder: `Add company, role, eligibility, mentor, offer letter, weekly log, risk note, supervisor feedback, and completion proof for ${subject}.`,
      blocks: [
        { title: 'Company Role', detail: 'Create company profile, mentor, role scope, duration, and vacancy.', items: ['Company', 'Mentor', 'Role', 'Duration'], icon: <BriefcaseBusiness size={18} />, tone: 'from-indigo-500 to-blue-600' },
        { title: 'Student Eligibility', detail: 'Check programme, documents, readiness, approval, and placement fit.', items: ['Programme', 'Documents', 'Readiness', 'Approval'], icon: <ShieldCheck size={18} />, tone: 'from-emerald-500 to-teal-500' },
        { title: 'Progress Logs', detail: 'Track weekly log, attendance proof, mentor notes, and risk flags.', items: ['Weekly log', 'Attendance', 'Mentor note', 'Risk'], icon: <ClipboardList size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
        { title: 'Completion Pack', detail: 'Approve final review, archive evidence, and prepare completion report.', items: ['Review', 'Evidence', 'Certificate', 'Report'], icon: <Award size={18} />, tone: 'from-amber-500 to-orange-500' },
      ],
      controls: ['Eligibility gate', 'Mentor assignment', 'Weekly review cycle', 'Completion approval'],
      outputs: [`${detailName} placement register`, 'Partner performance report', 'Weekly progress file', 'Completion evidence pack'],
    };
  }

  if (moduleSlug === 'training') {
    return {
      eyebrow,
      title: `${detailName} training desk`,
      summary: `A training delivery page for ${subject}, with batch planning, trainer assignment, sessions, attendance, resources, skill assessments, feedback, and progress reporting.`,
      icon: <GraduationCap size={22} />,
      tone: 'from-violet-600 to-cyan-500',
      formTitle: `Create ${subject} training item`,
      titleLabel: 'Training item',
      titlePlaceholder: `${detailName} batch, session, resource, assessment, or progress record`,
      subjectLabel: 'Batch / learner',
      subjectPlaceholder: 'Batch, learner, trainer, course, session, or skill area',
      ownerLabel: 'Training owner',
      ownerPlaceholder: 'Trainer, coordinator, department owner, or evaluator',
      detailsLabel: 'Training details',
      detailsPlaceholder: `Add batch, trainer, session time, resources, attendance rule, skill task, feedback, progress note, and follow-up action for ${subject}.`,
      blocks: [
        { title: 'Batch Schedule', detail: 'Plan batch capacity, session calendar, trainer need, and delivery mode.', items: ['Batch', 'Capacity', 'Calendar', 'Mode'], icon: <CalendarDays size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
        { title: 'Trainer Allocation', detail: 'Assign trainers, rooms, resources, availability, and workload.', items: ['Trainer', 'Room', 'Resource', 'Workload'], icon: <Users size={18} />, tone: 'from-sky-500 to-cyan-500' },
        { title: 'Delivery Evidence', detail: 'Capture attendance, materials, session notes, and learner engagement.', items: ['Attendance', 'Materials', 'Notes', 'Engagement'], icon: <ClipboardList size={18} />, tone: 'from-emerald-500 to-teal-500' },
        { title: 'Skill Progress', detail: 'Assess tasks, feedback, remedial plan, and progress report.', items: ['Task', 'Feedback', 'Remedial', 'Report'], icon: <BarChart3 size={18} />, tone: 'from-amber-500 to-orange-500' },
      ],
      controls: ['Batch capacity', 'Trainer workload', 'Attendance policy', 'Result publishing'],
      outputs: [`${detailName} training register`, 'Session delivery report', 'Skill progress report', 'Trainer workload file'],
    };
  }

  if (moduleSlug === 'programmes') {
    return {
      eyebrow,
      title: `${detailName} programme governance`,
      summary: `A programme administration page for ${subject}, with catalogue setup, curriculum versions, credits, eligibility, intake capacity, approvals, publishing, and compliance records.`,
      icon: <GraduationCap size={22} />,
      tone: 'from-indigo-500 to-violet-600',
      formTitle: `Create ${subject} programme record`,
      titleLabel: 'Programme item',
      titlePlaceholder: `${detailName} catalogue, curriculum, eligibility, approval, or outcome map`,
      subjectLabel: 'Programme / department',
      subjectPlaceholder: 'Programme, department, course, intake, curriculum version, or batch',
      ownerLabel: 'Academic owner',
      ownerPlaceholder: 'Dean, HOD, academic board, programme owner, or coordinator',
      detailsLabel: 'Programme details',
      detailsPlaceholder: `Add programme structure, credits, eligibility, intake, curriculum version, approval route, outcome map, and compliance evidence for ${subject}.`,
      blocks: [
        { title: 'Catalogue Setup', detail: 'Define programme profile, duration, department, intake, and status.', items: ['Profile', 'Duration', 'Department', 'Intake'], icon: <BookOpen size={18} />, tone: 'from-indigo-500 to-blue-600' },
        { title: 'Curriculum Version', detail: 'Manage credits, modules, electives, outcomes, and version status.', items: ['Credits', 'Modules', 'Electives', 'Outcomes'], icon: <FileText size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
        { title: 'Eligibility Rules', detail: 'Set entry requirements, progression rules, prerequisites, and capacity.', items: ['Entry', 'Progression', 'Prerequisite', 'Capacity'], icon: <ShieldCheck size={18} />, tone: 'from-emerald-500 to-teal-500' },
        { title: 'Governance Publish', detail: 'Route approval, publish version, archive evidence, and export reports.', items: ['Approval', 'Publish', 'Archive', 'Report'], icon: <BarChart3 size={18} />, tone: 'from-amber-500 to-orange-500' },
      ],
      controls: ['Version control', 'Approval gate', 'Eligibility rule', 'Catalogue visibility'],
      outputs: [`${detailName} programme profile`, 'Curriculum governance pack', 'Eligibility matrix', 'Compliance export'],
    };
  }

  if (moduleSlug === 'settings') {
    return {
      eyebrow,
      title: `${detailName} configuration page`,
      summary: `A system settings page for ${subject}, with institution profile control, role access, branding, preferences, backup, and audit history.`,
      icon: <KeyRound size={22} />,
      tone: 'from-slate-700 to-violet-600',
      formTitle: `Update ${subject} setting`,
      titleLabel: 'Setting item',
      titlePlaceholder: `${detailName} profile, access, preference, branch, or audit item`,
      subjectLabel: 'Applies to',
      subjectPlaceholder: 'Institution, branch, role, user group, module, or academic year',
      ownerLabel: 'Admin owner',
      ownerPlaceholder: 'Super admin, institution admin, branch admin, or system owner',
      detailsLabel: 'Configuration details',
      detailsPlaceholder: `Add setting value, affected module, permission scope, validation rule, backup note, and audit reason for ${subject}.`,
      blocks: [
        { title: 'Institution Profile', detail: 'Control name, type, branches, academic year, and visible identity.', items: ['Name', 'Type', 'Branch', 'Year'], icon: <Database size={18} />, tone: 'from-slate-600 to-slate-800' },
        { title: 'Access Rules', detail: 'Define role permissions, login rules, owners, and protected actions.', items: ['Role', 'Permission', 'Login', 'Protected'], icon: <KeyRound size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
        { title: 'Brand Preferences', detail: 'Set theme, layout preference, labels, notifications, and defaults.', items: ['Theme', 'Layout', 'Labels', 'Defaults'], icon: <ClipboardList size={18} />, tone: 'from-sky-500 to-cyan-500' },
        { title: 'Backup Audit', detail: 'Track saved changes, old values, new values, and recovery notes.', items: ['Backup', 'Old value', 'New value', 'Recovery'], icon: <ShieldCheck size={18} />, tone: 'from-emerald-500 to-teal-500' },
      ],
      controls: ['Admin permission', 'Change approval', 'Backup required', 'Audit history'],
      outputs: [`${detailName} setting register`, 'Permission report', 'Change history', 'Backup note'],
    };
  }

  return null;
}

function detailProfile(moduleSlug: string, moduleName: string, featureName: string, sectionName: string, detailName: string): DetailProfile {
  const specific = moduleSpecificProfile(moduleSlug, moduleName, featureName, sectionName, detailName);
  if (specific) return specific;

  const subject = detailName.toLowerCase();
  const context = `${featureName} / ${sectionName}`;
  const kind = kindFor(`${moduleName} ${featureName} ${sectionName} ${detailName}`);
  const sharedControls = ['Role access', 'Required fields', 'Status approval', 'Audit history'];

  if (kind === 'review') {
    return {
      eyebrow: `${moduleName} / ${context}`,
      title: `${detailName} review page`,
      summary: `A separate review workspace for ${subject}, with evidence checking, decision routing, reviewer ownership, and an audit-ready register.`,
      icon: <ShieldCheck size={22} />,
      tone: 'from-amber-500 to-orange-500',
      formTitle: `Create ${subject} review`,
      titleLabel: 'Review title',
      titlePlaceholder: `${detailName} case, request, or approval`,
      subjectLabel: 'Submitted by',
      subjectPlaceholder: 'Student, staff, group, route, resident, document, or department',
      ownerLabel: 'Reviewer',
      ownerPlaceholder: 'Assigned reviewer or approval owner',
      detailsLabel: 'Review notes',
      detailsPlaceholder: `Add evidence checked, rule matched, decision criteria, escalation notes, and final recommendation for ${subject}.`,
      blocks: [
        { title: 'Intake Queue', detail: 'Separate pending work by requester, category, urgency, and owner.', items: ['Requester', 'Category', 'Urgency', 'Owner'], icon: <ClipboardList size={18} />, tone: 'from-amber-500 to-orange-500' },
        { title: 'Evidence Check', detail: 'Review files, notes, previous status, proof, and policy match.', items: ['Files', 'Notes', 'History', 'Policy'], icon: <FileText size={18} />, tone: 'from-sky-500 to-cyan-500' },
        { title: 'Decision Route', detail: 'Approve, reject, hold, escalate, or request corrections.', items: ['Approve', 'Reject', 'Hold', 'Escalate'], icon: <ShieldCheck size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
        { title: 'Audit Closure', detail: 'Store reviewer, timestamp, final reason, output, and export note.', items: ['Reviewer', 'Timestamp', 'Reason', 'Export'], icon: <Database size={18} />, tone: 'from-emerald-500 to-teal-500' },
      ],
      controls: ['Reviewer role', 'Evidence required', 'Approval lock', 'Escalation path'],
      outputs: [`${detailName} decision register`, `${detailName} audit report`, 'Reviewer workload', 'Exception export'],
    };
  }

  if (kind === 'control') {
    return {
      eyebrow: `${moduleName} / ${context}`,
      title: `${detailName} control page`,
      summary: `A separate control panel for ${subject}, with rule setup, permission scope, exceptions, validation, and change history.`,
      icon: <KeyRound size={22} />,
      tone: 'from-violet-600 to-fuchsia-500',
      formTitle: `Add ${subject} rule`,
      titleLabel: 'Rule title',
      titlePlaceholder: `${detailName} access, policy, or permission rule`,
      subjectLabel: 'Applies to',
      subjectPlaceholder: 'Role, batch, branch, group, route, room, user type, or department',
      ownerLabel: 'Control owner',
      ownerPlaceholder: 'Administrator or responsible owner',
      detailsLabel: 'Control details',
      detailsPlaceholder: `Add allowed actions, blocked actions, required approvals, exceptions, review cycle, and rollback notes for ${subject}.`,
      blocks: [
        { title: 'Rule Matrix', detail: 'Define what is allowed, blocked, visible, required, and reviewed.', items: ['Allowed', 'Blocked', 'Visible', 'Required'], icon: <KeyRound size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
        { title: 'Access Scope', detail: 'Apply the rule to roles, groups, branches, departments, or users.', items: ['Role', 'Group', 'Branch', 'User type'], icon: <Users size={18} />, tone: 'from-sky-500 to-cyan-500' },
        { title: 'Exception Gate', detail: 'Route overrides through reason capture, approval, and expiry.', items: ['Override', 'Reason', 'Approval', 'Expiry'], icon: <ShieldCheck size={18} />, tone: 'from-amber-500 to-orange-500' },
        { title: 'Change Log', detail: 'Track changed values, owner, timestamp, and rollback readiness.', items: ['Changed by', 'Old value', 'New value', 'Rollback'], icon: <Database size={18} />, tone: 'from-emerald-500 to-teal-500' },
      ],
      controls: ['Role access', 'Approval gate', 'Exception expiry', 'Rollback lock'],
      outputs: [`${detailName} rule matrix`, `${detailName} access report`, 'Exception log', 'Change audit'],
    };
  }

  if (kind === 'evidence') {
    return {
      eyebrow: `${moduleName} / ${context}`,
      title: `${detailName} evidence page`,
      summary: `A separate document-ready page for ${subject}, with proof intake, validation, archive rules, release control, and record history.`,
      icon: <FileText size={22} />,
      tone: 'from-emerald-500 to-teal-500',
      formTitle: `Add ${subject} evidence`,
      titleLabel: 'Evidence title',
      titlePlaceholder: `${detailName} file, proof, template, attachment, or document`,
      subjectLabel: 'Linked record',
      subjectPlaceholder: 'Student, staff, case, certificate, ticket, route, room, book, or programme',
      ownerLabel: 'Evidence owner',
      ownerPlaceholder: 'Uploader, reviewer, issuing desk, or archive owner',
      detailsLabel: 'Evidence details',
      detailsPlaceholder: `Add document type, source record, verification status, expiry, signature, notes, and archive needs for ${subject}.`,
      blocks: [
        { title: 'Proof Intake', detail: 'Collect the file reference, source record, owner, and required notes.', items: ['File', 'Reference', 'Owner', 'Notes'], icon: <FileText size={18} />, tone: 'from-emerald-500 to-teal-500' },
        { title: 'Validation', detail: 'Check completeness, authenticity, expiry, and approval state.', items: ['Complete', 'Authentic', 'Expiry', 'Approved'], icon: <ShieldCheck size={18} />, tone: 'from-sky-500 to-cyan-500' },
        { title: 'Archive Rule', detail: 'Set retention, permission, version history, and secure access.', items: ['Retention', 'Access', 'Version', 'Archive'], icon: <Database size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
        { title: 'Release Output', detail: 'Prepare print, share, download, or verification output.', items: ['Print', 'Share', 'Download', 'Verify'], icon: <BarChart3 size={18} />, tone: 'from-amber-500 to-orange-500' },
      ],
      controls: ['File requirement', 'Approval lock', 'Retention rule', 'Download permission'],
      outputs: [`${detailName} proof register`, `${detailName} validation report`, 'Archive pack', 'Release log'],
    };
  }

  if (kind === 'report') {
    return {
      eyebrow: `${moduleName} / ${context}`,
      title: `${detailName} report page`,
      summary: `A separate reporting console for ${subject}, with filters, source records, summaries, export controls, and management-ready outputs.`,
      icon: <BarChart3 size={22} />,
      tone: 'from-sky-500 to-cyan-500',
      formTitle: `Create ${subject} report entry`,
      titleLabel: 'Report title',
      titlePlaceholder: `${detailName} summary, exception, audit, or export`,
      subjectLabel: 'Report scope',
      subjectPlaceholder: 'Branch, group, date range, department, status, route, hostel, or audience',
      ownerLabel: 'Report owner',
      ownerPlaceholder: 'Admin, coordinator, analyst, or department owner',
      detailsLabel: 'Report details',
      detailsPlaceholder: `Add filters, source records, summary notes, export format, sharing rule, and management comments for ${subject}.`,
      blocks: [
        { title: 'Filter Scope', detail: 'Choose date range, branch, owner, status, group, and priority.', items: ['Date', 'Branch', 'Owner', 'Status'], icon: <ClipboardList size={18} />, tone: 'from-sky-500 to-cyan-500' },
        { title: 'Source Data', detail: 'Connect records, approvals, evidence, workflows, and controls.', items: ['Records', 'Approvals', 'Evidence', 'Controls'], icon: <Database size={18} />, tone: 'from-emerald-500 to-teal-500' },
        { title: 'Summary Board', detail: 'Capture counts, exceptions, trends, risk, and decision notes.', items: ['Counts', 'Exceptions', 'Trends', 'Risk'], icon: <BarChart3 size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
        { title: 'Export Pack', detail: 'Prepare PDF, spreadsheet, print, and share-ready output.', items: ['PDF', 'Excel', 'Print', 'Share'], icon: <FileText size={18} />, tone: 'from-amber-500 to-orange-500' },
      ],
      controls: ['Export permission', 'Filter lock', 'Print access', 'Share rule'],
      outputs: [`${detailName} dashboard`, `${detailName} PDF`, `${detailName} spreadsheet`, 'Audit export'],
    };
  }

  if (kind === 'operations') {
    return {
      eyebrow: `${moduleName} / ${context}`,
      title: `${detailName} operations page`,
      summary: `A separate operations workspace for ${subject}, with planning, resource allocation, live tracking, exception handling, and closure output.`,
      icon: <CalendarDays size={22} />,
      tone: 'from-sky-500 to-cyan-500',
      formTitle: `Add ${subject} operation`,
      titleLabel: 'Operation title',
      titlePlaceholder: `${detailName} plan, schedule, route, group, room, event, or activity`,
      subjectLabel: 'Audience or resource',
      subjectPlaceholder: 'Students, staff, route, room, group, batch, vehicle, book, or support channel',
      ownerLabel: 'Operations owner',
      ownerPlaceholder: 'Coordinator, warden, librarian, transport owner, moderator, or support lead',
      detailsLabel: 'Operational details',
      detailsPlaceholder: `Add schedule, capacity, resources, location, live status, exceptions, and closing notes for ${subject}.`,
      blocks: [
        { title: 'Plan Setup', detail: 'Define schedule, capacity, scope, owner, and expected outcome.', items: ['Schedule', 'Capacity', 'Scope', 'Owner'], icon: <CalendarDays size={18} />, tone: 'from-sky-500 to-cyan-500' },
        { title: 'Resource Lane', detail: 'Assign people, assets, rooms, vehicles, groups, or channels.', items: ['People', 'Assets', 'Location', 'Audience'], icon: <Users size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
        { title: 'Live Tracker', detail: 'Monitor status, exceptions, updates, and owner notes.', items: ['Status', 'Exceptions', 'Updates', 'Notes'], icon: <Database size={18} />, tone: 'from-emerald-500 to-teal-500' },
        { title: 'Outcome Close', detail: 'Close the work with proof, summary, archive, and export.', items: ['Proof', 'Summary', 'Closure', 'Export'], icon: <BarChart3 size={18} />, tone: 'from-amber-500 to-orange-500' },
      ],
      controls: ['Capacity rule', 'Schedule lock', 'Owner permission', 'Exception route'],
      outputs: [`${detailName} operation plan`, `${detailName} live register`, 'Closure report', 'Operational export'],
    };
  }

  return {
    eyebrow: `${moduleName} / ${context}`,
    title: `${detailName} work page`,
    summary: `A separate ERP workspace for ${subject}, with intake, assignment, validation, record saving, status movement, controls, and outputs.`,
    icon: <Send size={22} />,
    tone: 'from-violet-600 to-fuchsia-500',
    formTitle: `Create ${subject} record`,
    titleLabel: 'Record title',
    titlePlaceholder: `${detailName} request or work item`,
    subjectLabel: 'Subject',
    subjectPlaceholder: 'Student, staff, group, ticket, route, room, document, or account',
    ownerLabel: 'Owner',
    ownerPlaceholder: 'Responsible staff member or desk owner',
    detailsLabel: 'Work details',
    detailsPlaceholder: `Add exact ${subject} details, owner notes, due date, priority, evidence, and required next action.`,
    blocks: [
      { title: 'Request Setup', detail: 'Capture request type, subject, owner, due date, and priority.', items: ['Type', 'Subject', 'Owner', 'Due date'], icon: <ClipboardList size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
      { title: 'Assignment', detail: 'Route the work to the responsible desk with backup ownership.', items: ['Desk', 'Backup', 'Escalation', 'Reminder'], icon: <Users size={18} />, tone: 'from-sky-500 to-cyan-500' },
      { title: 'Validation', detail: 'Check required information, missing proof, duplicates, and exceptions.', items: ['Required', 'Proof', 'Duplicate', 'Exception'], icon: <ShieldCheck size={18} />, tone: 'from-amber-500 to-orange-500' },
      { title: 'Completion', detail: 'Finalize the record with result notes, output, and archive status.', items: ['Result', 'Notes', 'Output', 'Archive'], icon: <BarChart3 size={18} />, tone: 'from-emerald-500 to-teal-500' },
    ],
    controls: sharedControls,
    outputs: [`${detailName} register`, `${detailName} status list`, `${detailName} export`, 'Audit note'],
  };
}

export default async function ModuleDetailPage({ params }: { params: { module: string; feature: string; section: string; detail: string } }) {
  const workspace = getMainWorkspace(params.module);
  const feature = findWorkspaceFeature(params.module, params.feature);
  const moduleName = workspace?.title ?? titleFromSlug(params.module);
  const featureName = feature?.title ?? titleFromSlug(params.feature);
  const sectionName = titleFromSlug(params.section);
  const detailName = titleFromSlug(params.detail);
  const backHref = `/modules/${params.module}/${params.feature}/${params.section}`;
  const recordFeature = `${params.feature}/${params.section}/${params.detail}`;
  const profile = detailProfile(params.module, moduleName, featureName, sectionName, detailName);
  const formFields = optionFields(params.module, featureName, sectionName, detailName, profile);
  const workBlocks = optionBlocks(params.module, featureName, sectionName, detailName, profile.blocks);
  const session = getSession();
  const records: ModuleRecordRow[] = session
    ? await db.moduleRecord.findMany({
        where: { institutionId: session.institutionId, module: params.module, feature: recordFeature },
        orderBy: { createdAt: 'desc' },
        take: 40,
      })
    : [];
  const statusCounts = STATUS_FLOW.map((status) => ({
    ...status,
    count: records.filter((record) => record.status === status.value).length,
  }));

  return (
    <div className="erp-nested-page space-y-5">
      <section className={`overflow-hidden rounded-2xl bg-gradient-to-br ${profile.tone} p-4 text-white shadow-sm sm:p-5`}>
        <Link href={backHref} className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/80 hover:text-white sm:text-sm">
          <ArrowLeft size={15} /> Back to {sectionName}
        </Link>
        <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_280px] xl:gap-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/70">{profile.eyebrow}</p>
            <h1 className="mt-2 break-words text-xl font-extrabold leading-tight text-white sm:text-3xl">{profile.title}</h1>
            <p className="mt-3 max-w-3xl text-xs leading-5 text-white/78 sm:text-sm sm:leading-6">{profile.summary}</p>
          </div>
          <div className="rounded-xl bg-white/14 p-3 ring-1 ring-white/18 sm:rounded-2xl sm:p-4">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/18 ring-1 ring-white/20 sm:h-12 sm:w-12 sm:rounded-2xl">{profile.icon}</span>
            <p className="mt-3 text-sm font-bold text-white sm:mt-4">Individual Option Page</p>
            <p className="mt-1 text-xs leading-5 text-white/72">This page has its own workflow, form, records, controls, and outputs.</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        <Metric icon={<Database size={18} />} label="Saved records" value={String(records.length)} accent />
        <Metric icon={<ClipboardList size={18} />} label="Workflow blocks" value={String(workBlocks.length)} />
        <Metric icon={<ShieldCheck size={18} />} label="Controls" value={String(profile.controls.length)} />
        <Metric icon={<BarChart3 size={18} />} label="Outputs" value={String(profile.outputs.length)} />
      </div>

      <ModuleDetailConsole
        moduleSlug={params.module}
        moduleName={moduleName}
        featureName={featureName}
        sectionName={sectionName}
        detailName={detailName}
        recordsCount={records.length}
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex items-center gap-2">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">{profile.icon}</span>
          <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">{moduleName} workflow</p>
            <h2 className="font-bold text-slate-950">{detailName} working system</h2>
          </div>
        </div>
        <div className="mt-4 grid gap-2 sm:gap-3 md:grid-cols-2 xl:grid-cols-4">
          {workBlocks.map((block, index) => (
            <article key={block.title} className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:rounded-2xl sm:p-4">
              <span className={`grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br ${block.tone} text-white shadow-sm sm:h-10 sm:w-10 sm:rounded-2xl`}>{block.icon}</span>
              <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 sm:mt-4 sm:text-xs">Step {index + 1}</p>
              <h3 className="mt-1 break-words text-sm font-extrabold text-slate-950">{block.title}</h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">{block.detail}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {block.items.map((item) => (
                  <span key={item} className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600">
                    {item}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-3 sm:gap-4 xl:grid-cols-[.95fr_1.05fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-2">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
              <Send size={18} />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">{moduleName} form</p>
              <h2 className="font-bold text-slate-950">{profile.formTitle}</h2>
            </div>
          </div>
          <form action={createModuleRecord} className="erp-form-page mt-4 space-y-3">
            <input type="hidden" name="module" value={params.module} />
            <input type="hidden" name="feature" value={recordFeature} />
            <div className="grid gap-3 md:grid-cols-2">
              {formFields.map((item) => (
                <OptionFormField key={item.name} field={item} />
              ))}
            </div>
            <button className="inline-flex min-h-10 w-full min-w-0 items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-center text-sm font-semibold leading-tight text-white transition hover:bg-brand-700 sm:w-auto sm:whitespace-nowrap">
              <Send size={16} className="shrink-0" /> <span>Save Record</span>
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-bold text-slate-950">{detailName} records</h2>
              <p className="mt-1 text-sm text-slate-500">Records saved only for this exact option page.</p>
            </div>
            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-600">{records.length} saved</span>
          </div>
          {records.length ? (
            <div className="mt-4 space-y-3">
              {records.map((record) => (
                <article key={record.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
                  <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-[11px] uppercase tracking-wide text-slate-400">REC-{shortRecordId(record.id)}</p>
                      <h3 className="mt-1 break-words font-semibold text-slate-900">{record.title}</h3>
                    </div>
                    <span className={`shrink-0 rounded-full border px-2 py-1 text-[11px] font-medium ${statusClass(record.status)}`}>{record.status.replace('_', ' ')}</span>
                  </div>
                  <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                    <Info label={profile.subjectLabel} value={record.requester || 'Not added'} />
                    <Info label={profile.ownerLabel} value={record.owner || 'Not assigned'} />
                    <Info label="Priority" value={record.priority} />
                    <Info label="Due date" value={record.dueDate || 'No date'} />
                  </div>
                  {record.details && <p className="mt-3 break-words rounded-lg bg-white px-3 py-2 text-xs leading-5 text-slate-500">{record.details}</p>}
                  <div className="mt-3 border-t border-slate-200 pt-3">
                    <RecordActions id={record.id} module={params.module} feature={recordFeature} status={record.status} compact />
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center sm:p-8">
              <Database className="mx-auto text-slate-300" size={28} />
              <h3 className="mt-3 font-semibold text-slate-900">No saved records yet</h3>
              <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">Use this form to create the first {detailName.toLowerCase()} record for this page.</p>
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-3 sm:gap-4 xl:grid-cols-3">
        <SidePanel title="Controls" items={profile.controls} icon={<ShieldCheck size={18} />} />
        <SidePanel title="Outputs" items={profile.outputs} icon={<BarChart3 size={18} />} />
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
              <CheckCircle2 size={18} />
            </span>
            <h2 className="break-words font-bold text-slate-950">Status Summary</h2>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:gap-3">
            {statusCounts.map((status) => (
              <div key={status.value} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="truncate text-[10px] font-semibold uppercase tracking-widest text-slate-400 sm:text-xs">{status.label}</p>
                <p className="mt-1 text-xl font-extrabold text-slate-950 sm:mt-2 sm:text-2xl">{status.count}</p>
              </div>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}

function ModuleDetailConsole({
  moduleSlug,
  moduleName,
  featureName,
  sectionName,
  detailName,
  recordsCount,
}: {
  moduleSlug: string;
  moduleName: string;
  featureName: string;
  sectionName: string;
  detailName: string;
  recordsCount: number;
}) {
  switch (moduleSlug) {
    case 'certificates':
      return (
        <ConsoleShell
          eyebrow="Certificate production"
          title={`${detailName} issuing board`}
          summary="Template, eligibility, signatures, QR verification, print release, and reissue control in one certificate desk."
          aside={<ConsoleStat label="Issue queue" value={recordsCount} note="Saved certificate records" />}
        >
          <div className="grid gap-4 xl:grid-cols-[.95fr_1.05fr]">
            <div className="rounded-[22px] border border-white/10 bg-white/8 p-4">
              <div className="mx-auto max-w-[260px] rounded-xl bg-slate-50 p-4 text-slate-950 shadow-[0_20px_60px_rgba(2,6,23,.25)]">
                <div className="rounded-lg border-2 border-amber-300 p-4 text-center">
                  <Award className="mx-auto text-amber-500" size={34} />
                  <p className="mt-3 text-[11px] font-black uppercase tracking-widest text-slate-500">Certificate</p>
                  <h3 className="mt-1 break-words text-lg font-black text-slate-950">{detailName}</h3>
                  <div className="mx-auto mt-4 h-2 w-28 rounded-full bg-slate-200" />
                  <div className="mx-auto mt-2 h-2 w-20 rounded-full bg-slate-100" />
                  <div className="mt-5 flex items-end justify-between">
                    <span className="h-9 w-9 rounded bg-slate-900" />
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-amber-400 text-slate-950">
                      <CheckCircle2 size={20} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <ConsoleTimeline
              items={[
                ['Template lock', 'Approved layout, seal, paper size, and certificate version.'],
                ['Eligibility clear', 'Completion, result status, fee clearance, and evidence proof.'],
                ['Signature route', 'Registrar, head, or principal approval before release.'],
                ['QR archive', 'Verification metadata, print batch, reissue reason, and audit.'],
              ]}
            />
          </div>
        </ConsoleShell>
      );
    case 'support':
      return (
        <ConsoleShell
          eyebrow="Service desk"
          title={`${detailName} ticket console`}
          summary="Ticket intake, SLA priority, agent assignment, conversation notes, escalation, and resolution quality."
          aside={<ConsoleStat label="Open tickets" value={recordsCount} note="Saved support records" />}
        >
          <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
            <div className="space-y-3">
              {['New request', 'Agent reply', 'User confirmation'].map((item, index) => (
                <div key={item} className={`max-w-[82%] rounded-2xl border border-white/10 p-4 ${index === 1 ? 'ml-auto bg-cyan-400/14' : 'bg-white/8'}`}>
                  <p className="text-xs font-black uppercase tracking-widest text-cyan-200">{item}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-200">{index === 0 ? `${featureName} issue captured with channel, screenshot, requester, and affected service.` : index === 1 ? 'SLA timer, internal note, owner action, and escalation path are tracked.' : 'Resolution, user confirmation, satisfaction, and reopened status are recorded.'}</p>
                </div>
              ))}
            </div>
            <div className="rounded-[22px] border border-cyan-300/20 bg-cyan-300/10 p-4">
              <p className="text-xs font-black uppercase tracking-widest text-cyan-200">SLA board</p>
              {['Critical', 'High', 'Normal'].map((item, index) => (
                <div key={item} className="mt-4">
                  <div className="flex justify-between text-xs font-bold text-slate-200">
                    <span>{item}</span>
                    <span>{index === 0 ? '1h' : index === 1 ? '4h' : '24h'}</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-white/10">
                    <div className={`h-full rounded-full ${index === 0 ? 'w-5/6 bg-red-400' : index === 1 ? 'w-3/5 bg-amber-300' : 'w-2/5 bg-emerald-300'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ConsoleShell>
      );
    case 'help-centre':
      return (
        <ConsoleShell
          eyebrow="Knowledge base"
          title={`${detailName} guide builder`}
          summary="Search intent, guide writing, related answers, screenshots, feedback, and published help content."
          aside={<ConsoleStat label="Published articles" value="0" note="Real articles only" />}
        >
          <div className="grid gap-4 xl:grid-cols-[1.1fr_.9fr]">
            <div className="rounded-[22px] border border-white/10 bg-white/8 p-4">
              <div className="rounded-2xl bg-white p-3 text-slate-950">
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-500">
                  <MessageSquare size={16} />
                  Search: reset password, Google login, payment failed...
                </div>
                <div className="mt-4 space-y-2">
                  {['Question', 'Clear answer', 'Screenshots', 'Related support path'].map((item) => (
                    <div key={item} className="flex items-center gap-2 rounded-xl bg-violet-50 px-3 py-2 text-sm font-bold text-violet-700">
                      <CheckCircle2 size={15} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <ConsoleTimeline
              items={[
                ['Intent', 'Map what the user searched and what they are trying to fix.'],
                ['Guide', 'Write steps with screenshots, expected result, and fallback.'],
                ['Connect', 'Attach related FAQs, module pages, and support ticket path.'],
                ['Improve', 'Track helpful votes and update requests.'],
              ]}
            />
          </div>
        </ConsoleShell>
      );
    case 'community':
      return (
        <ConsoleShell
          eyebrow="Engagement hub"
          title={`${detailName} community room`}
          summary="Groups, announcements, events, polls, audience targeting, moderation, and engagement feedback."
          aside={<ConsoleStat label="Activities" value={recordsCount} note="Saved community records" />}
        >
          <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/8 p-3">
              <div className="erp-main-visual-frame">
                <img src="/images/community-main-workspace-rounded.png?v=1" alt="Community workspace visual" className="erp-main-visual-image community-main-workspace-image h-auto w-full object-contain object-center" />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ['Announcement', 'Audience, schedule, attachments, and visibility.'],
                ['Event', 'Capacity, calendar, venue, attendance, and feedback.'],
                ['Poll', 'Question, choices, target group, and result summary.'],
                ['Moderation', 'Report queue, rules, decision, and audit.'],
              ].map(([title, detail]) => (
                <VisualTile key={title} title={title} detail={detail} icon={<MessageSquare size={17} />} />
              ))}
            </div>
          </div>
        </ConsoleShell>
      );
    case 'transport':
      return (
        <ConsoleShell
          eyebrow="Route operations"
          title={`${detailName} route control`}
          summary="Route map, pickup stops, vehicle roster, driver duty, passenger allocation, live trip status, and incident handling."
          aside={<ConsoleStat label="Trip records" value={recordsCount} note="Saved route records" />}
        >
          <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
            <div className="relative min-h-64 overflow-hidden rounded-[28px] border border-white/10 bg-sky-950/60 p-5">
              <div className="absolute left-8 right-8 top-1/2 h-4 -translate-y-1/2 rounded-full bg-emerald-300/90" />
              <div className="absolute left-16 top-10 h-28 w-4 rotate-45 rounded-full bg-emerald-300/90" />
              <div className="absolute bottom-10 right-20 h-32 w-4 -rotate-45 rounded-full bg-emerald-300/90" />
              {['Campus', 'Stop A', 'Stop B', 'Home Zone'].map((item, index) => (
                <span key={item} className="absolute grid h-12 w-12 place-items-center rounded-full border-4 border-white bg-red-500 text-[10px] font-black text-white shadow-lg" style={{ left: `${12 + index * 24}%`, top: `${22 + (index % 2) * 38}%` }}>
                  {index + 1}
                </span>
              ))}
              <Bus className="absolute left-[48%] top-[44%] text-white" size={34} />
            </div>
            <ConsoleTimeline
              items={[
                ['Stops', 'Campus pickup points, timing, and drop zones.'],
                ['Vehicle', 'Bus, driver, helper, capacity, and duty shift.'],
                ['Passengers', 'Students, staff, guardians, and exceptions.'],
                ['Trip close', 'Delay, incident, arrival, and route report.'],
              ]}
            />
          </div>
        </ConsoleShell>
      );
    case 'hostel':
      return (
        <ConsoleShell
          eyebrow="Residential care"
          title={`${detailName} residence board`}
          summary="Room allocation, bed capacity, resident profile, warden actions, leave requests, maintenance, visitors, and safety audit."
          aside={<ConsoleStat label="Residents" value={recordsCount} note="Saved hostel records" />}
        >
          <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
            <div className="grid gap-3 sm:grid-cols-3">
              {['Block A', 'Block B', 'Block C', 'Floor 1', 'Floor 2', 'Care Desk'].map((item, index) => (
                <div key={item} className="rounded-[22px] border border-white/10 bg-white/8 p-4">
                  <BedDouble className={index % 2 ? 'text-amber-200' : 'text-rose-200'} size={24} />
                  <p className="mt-4 text-sm font-black text-white">{item}</p>
                  <p className="mt-1 text-xs text-slate-300">{index < 3 ? 'Rooms, beds, occupancy' : 'Requests, safety, warden notes'}</p>
                </div>
              ))}
            </div>
            <ConsoleTimeline
              items={[
                ['Allocate', 'Block, room, bed, roommate, and move-in status.'],
                ['Care', 'Meals, maintenance, medical note, and guardian contact.'],
                ['Leave', 'Gate pass, timing, approval, and return confirmation.'],
                ['Audit', 'Visitors, incident, room check, and warden closure.'],
              ]}
            />
          </div>
        </ConsoleShell>
      );
    case 'library':
      return (
        <ConsoleShell
          eyebrow="Library circulation"
          title={`${detailName} catalogue desk`}
          summary="Catalogue records, accession numbers, issue and return, reservations, overdue fines, digital resources, and member history."
          aside={<ConsoleStat label="Catalogue records" value={recordsCount} note="Saved library records" />}
        >
          <div className="grid gap-4 xl:grid-cols-[330px_1fr]">
            <div className="rounded-[28px] border border-white/10 bg-white/8 p-5">
              {[0, 1, 2, 3].map((row) => (
                <div key={row} className="mb-4 flex gap-2 border-b border-amber-200/20 pb-3">
                  {[0, 1, 2, 3, 4].map((book) => (
                    <span key={book} className={`h-16 flex-1 rounded-t ${book % 3 === 0 ? 'bg-emerald-400' : book % 3 === 1 ? 'bg-sky-400' : 'bg-amber-300'}`} />
                  ))}
                </div>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ['Catalogue', 'Title, author, ISBN, category, shelf, and copy status.'],
                ['Issue / return', 'Borrower, issue date, due date, renewal, and return proof.'],
                ['Reservation', 'Hold queue, priority, available copies, and member notices.'],
                ['Overdue', 'Reminder, fine, lost book, and circulation report.'],
              ].map(([title, detail]) => (
                <VisualTile key={title} title={title} detail={detail} icon={<BookOpen size={17} />} />
              ))}
            </div>
          </div>
        </ConsoleShell>
      );
    case 'submissions':
      return (
        <ConsoleShell
          eyebrow="Evaluation workflow"
          title={`${detailName} submission desk`}
          summary="Upload windows, evidence files, evaluator assignment, rubrics, originality status, revisions, feedback, and archive."
          aside={<ConsoleStat label="Submissions" value={recordsCount} note="Saved academic records" />}
        >
          <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
            <div className="rounded-[28px] border border-dashed border-cyan-300/40 bg-cyan-300/10 p-6 text-center">
              <Upload className="mx-auto text-cyan-200" size={42} />
              <h3 className="mt-4 text-xl font-black text-white">Upload and review pipeline</h3>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-300">Task window, file evidence, rubric marks, revision status, and feedback release for {detailName.toLowerCase()}.</p>
              <div className="mt-5 grid gap-2 sm:grid-cols-4">
                {['Upload', 'Validate', 'Evaluate', 'Release'].map((item) => (
                  <span key={item} className="rounded-xl bg-white/10 px-3 py-2 text-xs font-black text-cyan-100">{item}</span>
                ))}
              </div>
            </div>
            <ConsoleTimeline
              items={[
                ['Window', 'Open, close, file type, and late policy.'],
                ['Evidence', 'Files, versions, project report, and proof.'],
                ['Review', 'Evaluator, rubric, originality, and revision.'],
                ['Publish', 'Feedback, archive, notification, and export.'],
              ]}
            />
          </div>
        </ConsoleShell>
      );
    case 'internship':
      return (
        <ConsoleShell
          eyebrow="Placement office"
          title={`${detailName} internship desk`}
          summary="Company roles, student eligibility, mentor allocation, weekly logs, supervisor review, completion evidence, and partner reports."
          aside={<ConsoleStat label="Placements" value={recordsCount} note="Saved internship records" />}
        >
          <PipelineVisual stages={['Partner', 'Eligibility', 'Offer', 'Mentor', 'Logs', 'Completion']} />
        </ConsoleShell>
      );
    case 'training':
      return (
        <ConsoleShell
          eyebrow="Training delivery"
          title={`${detailName} training board`}
          summary="Batch schedules, trainers, sessions, attendance, resources, skill assessments, feedback, and progress reporting."
          aside={<ConsoleStat label="Training records" value={recordsCount} note="Saved delivery records" />}
        >
          <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {['Batch', 'Session', 'Trainer', 'Skills', 'Resources', 'Attendance', 'Feedback', 'Progress'].map((item, index) => (
                <div key={item} className="rounded-[20px] border border-white/10 bg-white/8 p-4">
                  <span className={`grid h-9 w-9 place-items-center rounded-xl ${index % 2 ? 'bg-cyan-400/20 text-cyan-100' : 'bg-violet-400/20 text-violet-100'}`}>
                    <GraduationCap size={18} />
                  </span>
                  <p className="mt-4 text-sm font-black text-white">{item}</p>
                </div>
              ))}
            </div>
            <ConsoleTimeline
              items={[
                ['Plan', 'Capacity, calendar, trainer need, and delivery mode.'],
                ['Deliver', 'Session notes, resources, and attendance.'],
                ['Assess', 'Skill task, rubric, feedback, and remedial plan.'],
                ['Report', 'Progress summary and trainer workload.'],
              ]}
            />
          </div>
        </ConsoleShell>
      );
    case 'programmes':
      return (
        <ConsoleShell
          eyebrow="Academic governance"
          title={`${detailName} programme map`}
          summary="Catalogue setup, curriculum versions, credits, eligibility rules, intake capacity, approvals, publishing, and compliance."
          aside={<ConsoleStat label="Programme records" value={recordsCount} note="Saved governance records" />}
        >
          <PipelineVisual stages={['Catalogue', 'Credits', 'Curriculum', 'Eligibility', 'Approval', 'Publish']} />
        </ConsoleShell>
      );
    case 'settings':
      return (
        <ConsoleShell
          eyebrow="System configuration"
          title={`${detailName} settings control`}
          summary="Institution profile, roles, permissions, branding, preferences, backup rules, and change audit."
          aside={<ConsoleStat label="Changes" value={recordsCount} note="Saved configuration records" />}
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {['Profile', 'Roles', 'Branding', 'Backup', 'Branches', 'Academic year', 'Notifications', 'Audit'].map((item) => (
              <VisualTile key={item} title={item} detail={`${item} rules and saved institution settings.`} icon={<KeyRound size={17} />} />
            ))}
          </div>
        </ConsoleShell>
      );
    default:
      return (
        <ConsoleShell
          eyebrow={`${moduleName} command`}
          title={`${detailName} operating desk`}
          summary={`${featureName} and ${sectionName} now have a separate operating page with records, workflow, controls, and outputs.`}
          aside={<ConsoleStat label="Records" value={recordsCount} note="Saved work records" />}
        >
          <PipelineVisual stages={['Intake', 'Assign', 'Review', 'Approve', 'Publish', 'Archive']} />
        </ConsoleShell>
      );
  }
}

function ConsoleShell({ eyebrow, title, summary, aside, children }: { eyebrow: string; title: string; summary: string; aside: ReactNode; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-[20px] border border-white/10 bg-[#0F172A] p-4 text-white shadow-sm sm:rounded-[28px] sm:p-5">
      <div className="mb-4 grid gap-3 sm:gap-4 xl:grid-cols-[1fr_240px]">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-widest text-cyan-300">{eyebrow}</p>
          <h2 className="mt-2 break-words text-xl font-black leading-tight text-white sm:text-2xl">{title}</h2>
          <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-300 sm:text-sm sm:leading-6">{summary}</p>
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

function ConsoleStat({ label, value, note }: { label: string; value: string | number; note: string }) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-white/8 p-3 sm:rounded-[22px] sm:p-4">
      <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-black text-white sm:mt-2 sm:text-3xl">{value}</p>
      <p className="mt-1 text-xs text-slate-300">{note}</p>
    </div>
  );
}

function ConsoleTimeline({ items }: { items: [string, string][] }) {
  return (
    <div className="space-y-3">
      {items.map(([title, detail], index) => (
        <div key={title} className="grid grid-cols-[36px_1fr] gap-2 rounded-[16px] border border-white/10 bg-white/8 p-3 sm:grid-cols-[42px_1fr] sm:gap-3 sm:rounded-[20px]">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/12 text-xs font-black text-cyan-100 sm:h-10 sm:w-10 sm:rounded-2xl sm:text-sm">{index + 1}</span>
          <span className="min-w-0">
            <span className="block break-words text-sm font-black text-white">{title}</span>
            <span className="mt-1 block text-xs leading-5 text-slate-300">{detail}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

function VisualTile({ title, detail, icon }: { title: string; detail: string; icon: ReactNode }) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-white/8 p-3 sm:rounded-[22px] sm:p-4">
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/10 text-cyan-200 sm:h-9 sm:w-9">{icon}</span>
      <h3 className="mt-3 break-words text-sm font-black text-white sm:mt-4">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-slate-300">{detail}</p>
    </div>
  );
}

function PipelineVisual({ stages }: { stages: string[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 xl:grid-cols-6">
      {stages.map((stage, index) => (
        <div key={stage} className="relative rounded-[18px] border border-white/10 bg-white/8 p-3 sm:rounded-[22px] sm:p-4">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/12 text-xs font-black text-cyan-100 sm:h-10 sm:w-10 sm:rounded-2xl sm:text-sm">{index + 1}</span>
          <h3 className="mt-3 break-words text-sm font-black text-white sm:mt-5">{stage}</h3>
          <div className="mt-3 h-2 rounded-full bg-white/10 sm:mt-4">
            <div className="h-full rounded-full bg-cyan-300" style={{ width: `${Math.min(95, 38 + index * 9)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Metric({ icon, label, value, accent }: { icon: ReactNode; label: string; value: string; accent?: boolean }) {
  return (
    <div className={`min-w-0 rounded-xl p-3 shadow-sm sm:p-4 ${accent ? 'premium-kpi-accent bg-aurora text-white' : 'premium-kpi glass'}`}>
      <div className="flex items-center justify-between">
        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg sm:h-9 sm:w-9 ${accent ? 'bg-white/20' : 'bg-brand-50 text-brand-600'}`}>{icon}</span>
      </div>
      <p className={`mt-2 truncate text-[10px] font-semibold uppercase tracking-widest sm:mt-3 sm:text-xs ${accent ? 'text-white/80' : 'text-slate-500'}`}>{label}</p>
      <p className="mt-1 break-words text-xl font-extrabold sm:text-2xl">{value}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="erp-form-field grid w-full min-w-0 gap-1">
      <span className="erp-form-label block text-xs font-semibold text-slate-700 sm:text-sm">{label}</span>
      <div className="min-w-0">{children}</div>
    </label>
  );
}

function OptionFormField({ field }: { field: OptionField }) {
  const baseClass = 'erp-form-control block w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-500';
  return (
    <div className={field.full ? 'md:col-span-2' : undefined}>
      <Field label={field.label}>
        {field.kind === 'textarea' ? (
          <textarea name={field.name} required={field.required} rows={4} placeholder={field.placeholder} className={`${baseClass} min-h-32 resize-none py-3`} />
        ) : field.kind === 'select' ? (
          <select name={field.name} required={field.required} className={`h-10 sm:h-11 ${baseClass}`}>
            {(field.options ?? []).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          <input name={field.name} required={field.required} type={field.kind === 'date' ? 'date' : 'text'} placeholder={field.placeholder} className={`h-10 sm:h-11 ${baseClass}`} />
        )}
      </Field>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg bg-white px-3 py-2">
      <p className="break-words text-[11px] text-slate-400">{label}</p>
      <p className="break-words text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

function SidePanel({ title, items, icon }: { title: string; items: string[]; icon: ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">{icon}</span>
        <h2 className="break-words font-bold text-slate-950">{title}</h2>
      </div>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div key={item} className="flex min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            <CheckCircle2 size={15} className="shrink-0 text-brand-600" />
            <span className="min-w-0 break-words">{item}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function RecordActions({ id, module, feature, status, compact }: { id: string; module: string; feature: string; status: string; compact?: boolean }) {
  const nextStatuses = STATUS_FLOW.filter((item) => item.value !== status);

  return (
    <div className={`flex ${compact ? 'flex-wrap justify-between' : 'justify-end'} gap-2`}>
      {nextStatuses.slice(0, compact ? 3 : 2).map((item) => (
        <form key={item.value} action={updateModuleRecordStatus}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="module" value={module} />
          <input type="hidden" name="feature" value={feature} />
          <input type="hidden" name="status" value={item.value} />
          <button className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-600 transition hover:border-brand-400 hover:text-brand-600">
            {item.label}
          </button>
        </form>
      ))}
      <form action={deleteModuleRecord}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="module" value={module} />
        <input type="hidden" name="feature" value={feature} />
        <button className="inline-flex h-8 items-center justify-center rounded-lg border border-red-100 bg-red-50 px-2.5 text-xs font-medium text-red-600 transition hover:bg-red-100">
          <Trash2 size={13} />
          <span className="sr-only">Delete record</span>
        </button>
      </form>
    </div>
  );
}
