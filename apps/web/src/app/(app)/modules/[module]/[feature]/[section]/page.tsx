import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  ArrowLeft,
  ArrowRight,
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
import { findWorkspaceFeature, getMainWorkspace, slugifyWorkspace } from '@/lib/main-workspaces';
import { getSession } from '@/lib/session';
import { createModuleRecord, deleteModuleRecord, updateModuleRecordStatus } from '../../../../actions';

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

type SectionCard = {
  title: string;
  detail: string;
  items: string[];
  icon: ReactNode;
  tone: string;
};

type SectionPageProfile = {
  eyebrow: string;
  title: string;
  summary: string;
  icon: ReactNode;
  tone: string;
  formTitle: string;
  titleLabel: string;
  titlePlaceholder: string;
  requesterLabel: string;
  requesterPlaceholder: string;
  ownerLabel: string;
  ownerPlaceholder: string;
  detailsLabel: string;
  detailsPlaceholder: string;
  cards: SectionCard[];
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

function kindFor(sectionName: string) {
  const lower = sectionName.toLowerCase();
  if (/(approve|approval|review|moderation|decision|queue|verify)/.test(lower)) return 'review';
  if (/(permission|rule|control|security|visibility|capacity|eligibility|policy)/.test(lower)) return 'control';
  if (/(report|analytics|insight|audit|archive|output|register|log|history)/.test(lower)) return 'report';
  if (/(document|evidence|file|proof|template|copy|certificate)/.test(lower)) return 'evidence';
  if (/(calendar|event|schedule|route|trip|room|bed|catalogue|member|group|poll|question)/.test(lower)) return 'operations';
  return 'intake';
}

function profileFor(moduleName: string, featureName: string, sectionName: string): SectionPageProfile {
  const kind = kindFor(sectionName);
  const base = `${featureName} / ${sectionName}`;

  const profiles: Record<string, SectionPageProfile> = {
    intake: {
      eyebrow: `${moduleName} / Individual page`,
      title: `${sectionName} workspace`,
      summary: `${sectionName} is now a separate ERP page with its own intake form, assignment flow, records, controls, and outputs under ${featureName}.`,
      icon: <Send size={22} />,
      tone: 'from-violet-600 to-fuchsia-500',
      formTitle: `Create ${sectionName.toLowerCase()} record`,
      titleLabel: 'Record title',
      titlePlaceholder: `${sectionName} request or work item`,
      requesterLabel: 'Requester or subject',
      requesterPlaceholder: 'Student, staff, group, route, room, book, certificate, or account',
      ownerLabel: 'Owner',
      ownerPlaceholder: 'Responsible staff member or desk owner',
      detailsLabel: 'Work details',
      detailsPlaceholder: `Add exact ${sectionName.toLowerCase()} details, owner notes, due date, priority, and needed proof.`,
      cards: [
        { title: 'Intake Details', detail: 'Capture the exact request, subject, owner, priority, and due date.', items: ['Request type', 'Subject', 'Priority', 'Due date'], icon: <ClipboardList size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
        { title: 'Assignment Lane', detail: 'Route the work to the correct owner with clear responsibility.', items: ['Desk owner', 'Backup owner', 'Escalation', 'Due reminder'], icon: <Users size={18} />, tone: 'from-sky-500 to-cyan-500' },
        { title: 'Validation Check', detail: 'Check required fields, missing proof, duplicate records, and exceptions.', items: ['Required fields', 'Proof check', 'Duplicate check', 'Exception'], icon: <ShieldCheck size={18} />, tone: 'from-amber-500 to-orange-500' },
        { title: 'Completion Output', detail: 'Prepare the saved record, final note, and export-ready output.', items: ['Saved record', 'Final note', 'Export', 'Archive'], icon: <BarChart3 size={18} />, tone: 'from-emerald-500 to-teal-500' },
      ],
      controls: ['Required fields', 'Owner routing', 'Priority rule', 'Duplicate check'],
      outputs: [`${sectionName} register`, `${sectionName} status list`, `${sectionName} export`, 'Audit note'],
    },
    operations: {
      eyebrow: `${moduleName} / Operations page`,
      title: `${sectionName} operations`,
      summary: `${sectionName} has a dedicated operations page for planning, schedule control, live records, status review, and operational output.`,
      icon: <CalendarDays size={22} />,
      tone: 'from-sky-500 to-cyan-500',
      formTitle: `Add ${sectionName.toLowerCase()} item`,
      titleLabel: 'Operation title',
      titlePlaceholder: `${sectionName} plan, slot, route, group, or activity`,
      requesterLabel: 'Audience or resource',
      requesterPlaceholder: 'Batch, group, route, room, vehicle, resource, or audience',
      ownerLabel: 'Operations owner',
      ownerPlaceholder: 'Coordinator, moderator, warden, librarian, or transport owner',
      detailsLabel: 'Operational details',
      detailsPlaceholder: `Add plan, schedule, resource, capacity, visibility, and follow-up details for ${sectionName.toLowerCase()}.`,
      cards: [
        { title: 'Planning Board', detail: 'Set the plan, capacity, date, owner, scope, and expected outcome.', items: ['Plan', 'Capacity', 'Owner', 'Scope'], icon: <CalendarDays size={18} />, tone: 'from-sky-500 to-cyan-500' },
        { title: 'Resource Desk', detail: 'Attach people, assets, documents, locations, or audience groups.', items: ['People', 'Assets', 'Location', 'Audience'], icon: <Users size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
        { title: 'Live Tracking', detail: 'Track progress, exceptions, status, and important updates.', items: ['Status', 'Exceptions', 'Updates', 'Owner notes'], icon: <Database size={18} />, tone: 'from-emerald-500 to-teal-500' },
        { title: 'Outcome Review', detail: 'Close the operation with proof, output, and management summary.', items: ['Proof', 'Summary', 'Closure', 'Export'], icon: <BarChart3 size={18} />, tone: 'from-amber-500 to-orange-500' },
      ],
      controls: ['Capacity rule', 'Schedule lock', 'Owner permission', 'Exception route'],
      outputs: [`${sectionName} plan`, `${sectionName} live register`, `${sectionName} status report`, 'Operational export'],
    },
    review: {
      eyebrow: `${moduleName} / Review page`,
      title: `${sectionName} review desk`,
      summary: `${sectionName} opens as its own approval and review workspace with evidence checks, decision notes, escalation, and audit history.`,
      icon: <ShieldCheck size={22} />,
      tone: 'from-amber-500 to-orange-500',
      formTitle: `Add ${sectionName.toLowerCase()} review`,
      titleLabel: 'Review item',
      titlePlaceholder: `${sectionName} case or approval item`,
      requesterLabel: 'Submitted by',
      requesterPlaceholder: 'Student, staff, group, department, or system desk',
      ownerLabel: 'Reviewer',
      ownerPlaceholder: 'Approver, moderator, evaluator, or admin owner',
      detailsLabel: 'Review notes',
      detailsPlaceholder: `Add evidence, decision criteria, risk, exception, approval route, and final recommendation for ${sectionName.toLowerCase()}.`,
      cards: [
        { title: 'Review Queue', detail: 'Separate pending items by urgency, type, requester, and owner.', items: ['Pending', 'Urgent', 'Owner', 'Type'], icon: <ClipboardList size={18} />, tone: 'from-amber-500 to-orange-500' },
        { title: 'Evidence Review', detail: 'Check proof, notes, files, history, and rule match before decision.', items: ['Proof', 'History', 'Rule match', 'Risk'], icon: <FileText size={18} />, tone: 'from-sky-500 to-cyan-500' },
        { title: 'Decision Control', detail: 'Approve, reject, hold, escalate, or request changes.', items: ['Approve', 'Reject', 'Hold', 'Escalate'], icon: <ShieldCheck size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
        { title: 'Audit Trail', detail: 'Keep reviewer, timestamp, final reason, and export pack.', items: ['Reviewer', 'Timestamp', 'Reason', 'Export'], icon: <Database size={18} />, tone: 'from-emerald-500 to-teal-500' },
      ],
      controls: ['Reviewer role', 'Approval route', 'Escalation path', 'Decision lock'],
      outputs: [`${sectionName} decision register`, `${sectionName} audit trail`, 'Pending approval report', 'Exception export'],
    },
    control: {
      eyebrow: `${moduleName} / Control page`,
      title: `${sectionName} control panel`,
      summary: `${sectionName} has its own rules, permissions, testing area, exception handling, and audit output inside ${featureName}.`,
      icon: <KeyRound size={22} />,
      tone: 'from-violet-600 to-fuchsia-500',
      formTitle: `Add ${sectionName.toLowerCase()} rule`,
      titleLabel: 'Rule or permission',
      titlePlaceholder: `${sectionName} access, policy, or control rule`,
      requesterLabel: 'Applies to',
      requesterPlaceholder: 'Role, group, programme, department, resident, route, or audience',
      ownerLabel: 'Control owner',
      ownerPlaceholder: 'Admin, coordinator, moderator, or department owner',
      detailsLabel: 'Control details',
      detailsPlaceholder: `Add allowed actions, blocked actions, exception route, approval need, and review cycle for ${sectionName.toLowerCase()}.`,
      cards: [
        { title: 'Rule Matrix', detail: 'Define what is allowed, blocked, required, and visible.', items: ['Allowed', 'Blocked', 'Required', 'Visible'], icon: <KeyRound size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
        { title: 'Access Scope', detail: 'Apply the rule by role, group, branch, programme, or user type.', items: ['Role', 'Group', 'Branch', 'User type'], icon: <Users size={18} />, tone: 'from-sky-500 to-cyan-500' },
        { title: 'Exception Handling', detail: 'Route overrides, escalations, review dates, and admin notes.', items: ['Override', 'Escalation', 'Review date', 'Admin note'], icon: <ShieldCheck size={18} />, tone: 'from-amber-500 to-orange-500' },
        { title: 'Control Audit', detail: 'Track changes, old values, new values, and rollback proof.', items: ['Changed by', 'Old value', 'New value', 'Rollback'], icon: <Database size={18} />, tone: 'from-emerald-500 to-teal-500' },
      ],
      controls: ['Role access', 'Approval gate', 'Exception route', 'Rollback lock'],
      outputs: [`${sectionName} rule matrix`, `${sectionName} audit log`, 'Exception report', 'Access export'],
    },
    evidence: {
      eyebrow: `${moduleName} / Evidence page`,
      title: `${sectionName} evidence room`,
      summary: `${sectionName} now opens a document-ready evidence page for proof collection, validation, ownership, archive, and release output.`,
      icon: <FileText size={22} />,
      tone: 'from-emerald-500 to-teal-500',
      formTitle: `Add ${sectionName.toLowerCase()} evidence`,
      titleLabel: 'Evidence title',
      titlePlaceholder: `${sectionName} file, proof, template, or document`,
      requesterLabel: 'Linked record',
      requesterPlaceholder: `${base} source record or requester`,
      ownerLabel: 'Evidence owner',
      ownerPlaceholder: 'Staff owner, issuing desk, reviewer, or admin',
      detailsLabel: 'Evidence details',
      detailsPlaceholder: `Add file type, source record, validation status, expiry, signature, notes, and archive needs for ${sectionName.toLowerCase()}.`,
      cards: [
        { title: 'Proof Intake', detail: 'Collect source files, document references, owner, and required notes.', items: ['Source file', 'Reference', 'Owner', 'Notes'], icon: <FileText size={18} />, tone: 'from-emerald-500 to-teal-500' },
        { title: 'Validation', detail: 'Check completeness, expiry, approval status, and authenticity.', items: ['Completeness', 'Expiry', 'Approval', 'Authenticity'], icon: <ShieldCheck size={18} />, tone: 'from-sky-500 to-cyan-500' },
        { title: 'Archive Control', detail: 'Store the proof with access rules, retention, and version history.', items: ['Access', 'Retention', 'Version', 'Archive'], icon: <Database size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
        { title: 'Release Output', detail: 'Prepare export, print, share, or verification-ready document output.', items: ['Export', 'Print', 'Share', 'Verify'], icon: <BarChart3 size={18} />, tone: 'from-amber-500 to-orange-500' },
      ],
      controls: ['File requirement', 'Approval lock', 'Retention rule', 'Download permission'],
      outputs: [`${sectionName} file register`, `${sectionName} proof pack`, 'Validation report', 'Archive export'],
    },
    report: {
      eyebrow: `${moduleName} / Report page`,
      title: `${sectionName} report console`,
      summary: `${sectionName} opens as a separate reporting page with filters, records, charts-ready summaries, output controls, and audit exports.`,
      icon: <BarChart3 size={22} />,
      tone: 'from-sky-500 to-cyan-500',
      formTitle: `Create ${sectionName.toLowerCase()} report entry`,
      titleLabel: 'Report entry',
      titlePlaceholder: `${sectionName} summary, exception, or export item`,
      requesterLabel: 'Report scope',
      requesterPlaceholder: 'Branch, department, group, date range, or audience',
      ownerLabel: 'Report owner',
      ownerPlaceholder: 'Manager, admin, coordinator, or analyst',
      detailsLabel: 'Report details',
      detailsPlaceholder: `Add filters, source records, status, owner, format, export need, and management notes for ${sectionName.toLowerCase()}.`,
      cards: [
        { title: 'Filter Builder', detail: 'Filter by date, owner, status, priority, branch, and section.', items: ['Date', 'Owner', 'Status', 'Branch'], icon: <ClipboardList size={18} />, tone: 'from-sky-500 to-cyan-500' },
        { title: 'Source Records', detail: 'Connect live records, evidence files, controls, and workflow state.', items: ['Records', 'Evidence', 'Controls', 'Workflow'], icon: <Database size={18} />, tone: 'from-emerald-500 to-teal-500' },
        { title: 'Management Summary', detail: 'Show counts, exceptions, trends, and decision notes.', items: ['Counts', 'Exceptions', 'Trends', 'Notes'], icon: <BarChart3 size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
        { title: 'Export Pack', detail: 'Prepare PDF, spreadsheet, print, and share-ready outputs.', items: ['PDF', 'Excel', 'Print', 'Share'], icon: <FileText size={18} />, tone: 'from-amber-500 to-orange-500' },
      ],
      controls: ['Export permission', 'Filter lock', 'Print access', 'Share rule'],
      outputs: [`${sectionName} dashboard`, `${sectionName} PDF`, `${sectionName} spreadsheet`, 'Audit export'],
    },
  };

  return profiles[kind] ?? profiles.intake;
}

function optionFields(moduleSlug: string, featureName: string, sectionName: string, profile: SectionPageProfile): OptionField[] {
  const context = `${featureName} ${sectionName}`.toLowerCase();
  const has = (...words: string[]) => words.some((word) => context.includes(word));
  const priority = selectField('Priority', ['LOW', 'NORMAL', 'HIGH', 'URGENT']);
  priority.name = 'priority';
  const dueDate = baseField('dueDate', 'Due date', '', false, 'date');

  if (moduleSlug === 'school') {
    const featureLower = featureName.toLowerCase();
    const sectionLower = sectionName.toLowerCase();
    const isParentPortal =
      featureLower.includes('parent') ||
      /(parent dashboard|guardian contacts|meeting|consent|student updates|message history|notice|communication)/.test(sectionLower);

    if (isParentPortal) {
      return [
        baseField('title', 'Parent communication item', `${sectionName} message, meeting, consent, or student update`),
        baseField('requester', 'Parent / guardian / student', 'Guardian name, student name, class, phone, or email'),
        baseField('owner', 'Communication owner', 'Class teacher, counsellor, front office, principal office, or parent desk'),
        field('Student and class', 'Student name, admission number, grade, section, or roll number'),
        field('Contact channel', 'Phone, email, app message, SMS, meeting, or printed note'),
        selectField('Parent workflow status', ['Draft', 'Sent', 'Acknowledged', 'Meeting booked', 'Follow-up needed', 'Closed']),
        field('Consent / meeting note', 'Consent type, meeting slot, response note, or escalation reason'),
        priority,
        dueDate,
        baseField('details', 'Parent portal notes', 'Message content, guardian response, meeting minutes, consent proof, next action, and staff follow-up.', true, 'textarea'),
      ];
    }
    if (has('admission', 'enquiry', 'application', 'guardian', 'document')) {
      return [
        baseField('title', 'Admission / SIS record', `${sectionName} for new admission or student information`),
        baseField('requester', 'Student / guardian', 'Student name, applicant number, or guardian contact'),
        baseField('owner', 'Admission owner', 'Admission officer, class teacher, principal office, or registrar'),
        field('Class applying for', 'Grade, class, section preference, academic year'),
        field('Guardian details', 'Guardian name, phone, relationship, and email'),
        field('Document set', 'Birth certificate, photo, transfer certificate, previous marks'),
        selectField('Admission status', ['Enquiry', 'Applied', 'Document pending', 'Interview', 'Approved', 'Rejected']),
        priority,
        dueDate,
        baseField('details', 'Admission notes', 'Eligibility, seat availability, interview note, fee link, transport or hostel need, and final decision.', true, 'textarea'),
      ];
    }
    if (has('class', 'section', 'teacher', 'timetable', 'homework')) {
      return [
        baseField('title', 'Class operations item', `${sectionName} class, section, timetable, or homework setup`),
        baseField('requester', 'Class / section', 'Grade 7 A, Grade 10 Science, primary section, or house group'),
        baseField('owner', 'Academic owner', 'Class teacher, subject teacher, timetable coordinator, or school admin'),
        field('Teacher assignment', 'Class teacher, subject teacher, substitute, or room owner'),
        field('Timetable slot', 'Day, period, room, subject, or lab slot'),
        field('Curriculum coverage', 'Chapter, unit, lesson plan, or homework topic'),
        selectField('Class status', ['Planning', 'Assigned', 'Published', 'Needs revision', 'Completed']),
        priority,
        dueDate,
        baseField('details', 'Academic notes', 'Capacity, roll number, teacher load, timetable conflict, homework plan, and parent communication.', true, 'textarea'),
      ];
    }
    if (has('attendance', 'late', 'leave', 'parent', 'behaviour', 'conduct', 'house')) {
      return [
        baseField('title', 'Attendance / conduct case', `${sectionName} attendance, leave, alert, or behaviour note`),
        baseField('requester', 'Student / class', 'Student, class, section, house, or guardian'),
        baseField('owner', 'Pastoral owner', 'Class teacher, discipline office, attendance clerk, or house master'),
        field('Attendance date', 'Date, session, period, or attendance range'),
        field('Guardian contact', 'Parent phone, email, relationship, or alert channel'),
        selectField('Attendance status', ['Present', 'Absent', 'Late', 'Leave requested', 'Excused', 'Follow-up needed']),
        field('Behaviour note', 'Merit, discipline note, house point, or intervention'),
        priority,
        dueDate,
        baseField('details', 'Attendance and behaviour notes', 'Reason, parent alert, supporting document, follow-up action, and class teacher decision.', true, 'textarea'),
      ];
    }
    if (has('exam', 'grade', 'marks', 'report', 'promotion')) {
      return [
        baseField('title', 'Exam / report card item', `${sectionName} exam schedule, marks, report card, or promotion decision`),
        baseField('requester', 'Student / class / exam', 'Student, class, section, exam name, or subject'),
        baseField('owner', 'Exam owner', 'Exam coordinator, subject teacher, class teacher, or principal office'),
        field('Exam / subject', 'Term exam, unit test, subject, paper, or assessment'),
        field('Marks / grade scale', 'Marks, grade, GPA scale, pass mark, or result band'),
        selectField('Result status', ['Draft', 'Marks entered', 'Under review', 'Approved', 'Published', 'Correction needed']),
        field('Promotion decision', 'Promoted, repeat, conditional, remedial, or held'),
        priority,
        dueDate,
        baseField('details', 'Exam and report card notes', 'Marks evidence, moderation note, parent copy, promotion rule, and publish permission.', true, 'textarea'),
      ];
    }
    if (has('fee', 'payment', 'receipt', 'invoice', 'balance', 'concession')) {
      return [
        baseField('title', 'Fee ledger item', `${sectionName} invoice, receipt, concession, balance, or payment record`),
        baseField('requester', 'Student / fee account', 'Student, guardian, invoice number, account ID, or receipt number'),
        baseField('owner', 'Accounts owner', 'Cashier, accounts officer, bursar, finance admin, or school office'),
        selectField('Fee item type', ['Invoice', 'Receipt', 'Payment', 'Concession', 'Outstanding balance', 'Refund review']),
        field('Amount and reference', 'Amount, receipt number, transaction ID, term, fee category, or concession code'),
        field('Guardian confirmation', 'Parent payer, phone, payment channel, note, or acknowledgement'),
        selectField('Fee status', ['Draft', 'Pending payment', 'Part paid', 'Paid', 'Concession review', 'Overdue', 'Closed']),
        priority,
        dueDate,
        baseField('details', 'Fee office notes', 'Invoice line, payment proof, balance reason, concession approval, receipt lock, parent communication, and account action.', true, 'textarea'),
      ];
    }
    if (has('transport', 'hostel', 'library', 'service')) {
      return [
        baseField('title', 'School service record', `${sectionName} fee, transport, hostel, library, or campus service`),
        baseField('requester', 'Student / service', 'Student, guardian, route, room, library card, or fee account'),
        baseField('owner', 'Service owner', 'Accounts desk, transport manager, warden, librarian, or admin'),
        selectField('Service type', ['Fees', 'Transport', 'Hostel', 'Library', 'Support', 'Other']),
        field('Amount / service code', 'Fee amount, invoice, route number, room, accession, or service code'),
        field('Clearance status', 'Paid, pending, scholarship, service active, blocked, or cleared'),
        priority,
        dueDate,
        baseField('details', 'Campus service notes', 'Invoice, receipt, route, hostel room, library issue, service access, and guardian confirmation.', true, 'textarea'),
      ];
    }
    return [
      baseField('title', 'School student record', `${sectionName} student, class, guardian, exam, attendance, or service record`),
      baseField('requester', 'Student / guardian / class', 'Student name, guardian, class, section, or admission number'),
      baseField('owner', 'School owner', 'Class teacher, office admin, coordinator, or department owner'),
      field('Class / section', 'Grade, class, section, roll number, or house'),
      field('Guardian contact', 'Parent or guardian phone/email'),
      selectField('School status', ['Draft', 'Active', 'Pending review', 'Approved', 'Published', 'Archived']),
      priority,
      dueDate,
      baseField('details', 'School operation notes', 'Student profile, documents, attendance, exam, fee, guardian communication, and required action.', true, 'textarea'),
    ];
  }

  if (moduleSlug === 'institutes') {
    if (has('lead', 'enquiry', 'counselling', 'demo', 'follow', 'admission', 'conversion')) {
      return [
        baseField('title', 'Lead / enrollment record', `${sectionName} lead, counselling, demo, or conversion item`),
        baseField('requester', 'Lead / learner', 'Prospect name, phone, email, company, or learner ID'),
        baseField('owner', 'Counsellor', 'Counsellor, admissions owner, branch admin, or sales owner'),
        field('Lead source', 'Website, walk-in, referral, campaign, social, or phone'),
        field('Course interest', 'Course, batch, duration, mode, and expected start'),
        field('Follow-up plan', 'Call date, demo slot, counsellor note, or next action'),
        selectField('Lead status', ['New lead', 'Contacted', 'Demo booked', 'Follow-up', 'Converted', 'Lost']),
        priority,
        dueDate,
        baseField('details', 'Enrollment CRM notes', 'Need, budget, counselling notes, demo response, admission checklist, and conversion reason.', true, 'textarea'),
      ];
    }
    if (has('course', 'batch', 'session', 'learner', 'progress')) {
      return [
        baseField('title', 'Course / batch item', `${sectionName} course, batch, session, attendance, or progress item`),
        baseField('requester', 'Course / batch / learner', 'Course name, batch code, learner group, or branch'),
        baseField('owner', 'Delivery owner', 'Trainer, course coordinator, branch admin, or academic owner'),
        field('Batch schedule', 'Start date, days, time, room, online link, or branch'),
        field('Learner group', 'Batch count, learner list, level, or cohort'),
        selectField('Delivery status', ['Planned', 'Enrolling', 'Running', 'On hold', 'Completed', 'Closed']),
        field('Progress rule', 'Attendance %, completion %, modules covered, or LMS progress'),
        priority,
        dueDate,
        baseField('details', 'Course delivery notes', 'Session plan, trainer, resources, attendance rule, progress checks, and delivery risk.', true, 'textarea'),
      ];
    }
    if (has('trainer', 'workload', 'resource', 'replacement', 'performance')) {
      return [
        baseField('title', 'Trainer operations item', `${sectionName} trainer, workload, resource, or performance case`),
        baseField('requester', 'Batch / course', 'Batch, course, session, branch, or learner group'),
        baseField('owner', 'Trainer / coordinator', 'Trainer, training manager, branch admin, or replacement owner'),
        field('Availability', 'Available days, blocked slots, leave, or conflict'),
        field('Workload', 'Hours, sessions, active batches, assistant trainer, or room need'),
        field('Resource need', 'Lab, software, projector, material, or LMS access'),
        selectField('Trainer status', ['Assigned', 'Conflict', 'Replacement needed', 'Approved', 'Completed']),
        priority,
        dueDate,
        baseField('details', 'Trainer operations notes', 'Schedule, workload balance, replacement reason, resource approval, and performance follow-up.', true, 'textarea'),
      ];
    }
    if (has('assessment', 'assignment', 'practical', 'test', 'rubric', 'feedback', 'remedial')) {
      return [
        baseField('title', 'Assessment / submission item', `${sectionName} assignment, practical test, rubric, or feedback item`),
        baseField('requester', 'Learner / batch', 'Learner, batch, course, practical group, or submission ID'),
        baseField('owner', 'Evaluator', 'Trainer, evaluator, course owner, or branch academic lead'),
        field('Assessment method', 'Assignment, practical, viva, project, quiz, or final test'),
        field('Rubric / pass mark', 'Rubric name, marks, weightage, competency level, or pass mark'),
        selectField('Assessment status', ['Assigned', 'Submitted', 'Under review', 'Remedial needed', 'Passed', 'Failed']),
        field('Feedback release', 'Private note, learner visible, released after date, or hold reason'),
        priority,
        dueDate,
        baseField('details', 'Assessment notes', 'Instructions, file proof, score, feedback, remedial action, and certificate readiness.', true, 'textarea'),
      ];
    }
    if (has('invoice', 'discount', 'installment', 'payment', 'certificate', 'revenue')) {
      return [
        baseField('title', 'Revenue / certificate item', `${sectionName} invoice, discount, payment, or certificate release`),
        baseField('requester', 'Learner / account', 'Learner, invoice number, payment account, course, or batch'),
        baseField('owner', 'Finance / certificate owner', 'Finance desk, branch admin, certificate officer, or approver'),
        field('Invoice / amount', 'Invoice ID, fee plan, paid amount, balance, or discount'),
        field('Payment schedule', 'Installment dates, reminder plan, gateway note, or receipt'),
        selectField('Clearance status', ['Pending', 'Part paid', 'Paid', 'Discount review', 'Cleared', 'Blocked']),
        field('Certificate status', 'Eligible, pending payment, template ready, issued, or held'),
        priority,
        dueDate,
        baseField('details', 'Revenue and certificate notes', 'Discount reason, installments, payment proof, completion lock, certificate template, and release note.', true, 'textarea'),
      ];
    }
    return [
      baseField('title', 'Institute operations record', `${sectionName} lead, batch, trainer, assessment, revenue, or support item`),
      baseField('requester', 'Lead / learner / batch', 'Lead, learner, batch, trainer, course, branch, or support requester'),
      baseField('owner', 'Institute owner', 'Counsellor, trainer, branch admin, finance owner, or support desk'),
      field('Course / branch', 'Course name, batch code, delivery branch, or online mode'),
      field('Next action', 'Call, demo, session, assessment, payment reminder, or certificate release'),
      selectField('Institute status', ['New', 'In progress', 'Under review', 'Approved', 'Completed', 'Closed']),
      priority,
      dueDate,
      baseField('details', 'Institute operation notes', 'CRM details, batch delivery, trainer notes, assessment proof, revenue status, and support follow-up.', true, 'textarea'),
    ];
  }

  if (moduleSlug === 'internship') {
    if (has('offer', 'letter', 'company', 'partner')) {
      return [
        baseField('title', 'Offer / partner record', `${sectionName} for company, role, or student`),
        baseField('requester', 'Student / candidate', 'Student name, admission number, programme, or batch'),
        baseField('owner', 'Placement officer', 'Placement owner, supervisor, or mentor coordinator'),
        field('Company / partner', 'Company name, HR contact, industry, and location'),
        field('Role / stipend', 'Internship role, stipend, duration, joining date'),
        field('Offer proof', 'Offer letter number, file reference, or email proof'),
        selectField('Offer status', ['Draft', 'Sent', 'Accepted', 'Rejected', 'Joined', 'Withdrawn']),
        priority,
        dueDate,
        baseField('details', 'Placement notes', 'Eligibility, company terms, reporting manager, risk note, and onboarding checklist.', true, 'textarea'),
      ];
    }
    if (has('log', 'attendance', 'progress', 'weekly')) {
      return [
        baseField('title', 'Internship progress log', `${sectionName} weekly update or attendance record`),
        baseField('requester', 'Intern / company', 'Student, company, mentor, or project title'),
        baseField('owner', 'Faculty supervisor', 'Faculty mentor, placement officer, or industry mentor'),
        field('Week / milestone', 'Week 1, sprint 2, final review, presentation'),
        field('Attendance proof', 'Timesheet, check-in, supervisor note, or portal record'),
        selectField('Progress status', ['On track', 'Delayed', 'Needs support', 'Completed', 'At risk']),
        field('Mentor feedback', 'Industry mentor comments and rating'),
        priority,
        dueDate,
        baseField('details', 'Progress evidence', 'Tasks completed, blockers, attendance, screenshots, next milestone, and supervisor action.', true, 'textarea'),
      ];
    }
    return [
      baseField('title', 'Internship placement case', `${sectionName} eligibility, matching, application, or completion case`),
      baseField('requester', 'Student / company', 'Student name, company, mentor, role, or department'),
      baseField('owner', 'Placement owner', 'Placement officer, mentor, supervisor, or coordinator'),
      field('Company / partner', 'Company name, industry, contact person'),
      field('Role / project', 'Intern role, project title, department'),
      field('Mentor contact', 'Industry mentor or supervisor contact'),
      selectField('Placement status', ['Applied', 'Shortlisted', 'Offered', 'Active', 'Completed', 'Rejected']),
      priority,
      dueDate,
      baseField('details', 'Internship notes', 'Eligibility, documents, weekly log, attendance proof, risk note, mentor feedback, and completion evidence.', true, 'textarea'),
    ];
  }

  if (moduleSlug === 'training') {
    if (has('trainer', 'faculty', 'allocation')) {
      return [
        baseField('title', 'Trainer allocation', `${sectionName} trainer desk assignment`),
        baseField('requester', 'Batch / subject', 'Training batch, skill group, course, or department'),
        baseField('owner', 'Trainer / coordinator', 'Lead trainer, assistant trainer, or training coordinator'),
        field('Session load', 'Hours, sessions, mode, and room or online link'),
        field('Trainer availability', 'Available days, conflicts, backup trainer'),
        selectField('Allocation status', ['Proposed', 'Confirmed', 'Conflict', 'Backup needed', 'Completed']),
        field('Resource requirement', 'Lab, projector, LMS link, handout, or software'),
        priority,
        dueDate,
        baseField('details', 'Trainer planning notes', 'Workload, batch fit, resources, schedule risk, and delivery approval.', true, 'textarea'),
      ];
    }
    if (has('assessment', 'skill', 'result', 'feedback')) {
      return [
        baseField('title', 'Skill assessment', `${sectionName} learner assessment or feedback`),
        baseField('requester', 'Learner / batch', 'Student, batch, skill group, or trainee ID'),
        baseField('owner', 'Evaluator', 'Trainer, assessor, reviewer, or training head'),
        field('Skill outcome', 'Communication, coding, safety, practical task, viva'),
        field('Assessment method', 'Quiz, practical, project, observation, presentation'),
        field('Score / grade', 'Marks, pass/fail, rating, competency level'),
        selectField('Assessment status', ['Scheduled', 'Submitted', 'Reviewed', 'Remedial needed', 'Passed', 'Failed']),
        priority,
        dueDate,
        baseField('details', 'Assessment feedback', 'Rubric, evidence, marks, trainer comments, remedial plan, and publish note.', true, 'textarea'),
      ];
    }
    return [
      baseField('title', 'Training delivery record', `${sectionName} batch, session, resource, skill check, or feedback`),
      baseField('requester', 'Batch / learner', 'Batch, learner, course, department, or skill group'),
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
    if (has('curriculum', 'credit', 'module', 'course')) {
      return [
        baseField('title', 'Curriculum item', `${sectionName} course, credit, module, or semester item`),
        baseField('requester', 'Programme / semester', 'Programme, semester, department, intake, or curriculum version'),
        baseField('owner', 'Academic owner', 'Dean, HOD, course coordinator, or board owner'),
        field('Credit / hours', 'Credits, lecture hours, lab hours, self-study hours'),
        field('Learning outcome', 'Outcome code, competency, or graduate attribute'),
        field('Prerequisite rule', 'Required course, minimum grade, or progression rule'),
        selectField('Curriculum status', ['Draft', 'Mapped', 'Under review', 'Approved', 'Published']),
        priority,
        dueDate,
        baseField('details', 'Curriculum notes', 'Syllabus, assessment split, outcomes, compliance evidence, and version notes.', true, 'textarea'),
      ];
    }
    return [
      baseField('title', 'Programme governance record', `${sectionName} catalogue, intake, eligibility, or approval`),
      baseField('requester', 'Programme / department', 'Programme, department, intake, curriculum version, or batch'),
      baseField('owner', 'Programme owner', 'Dean, HOD, academic board, programme owner, or coordinator'),
      field('Duration / intake', 'Semesters, years, seats, branch, and intake cycle'),
      field('Eligibility rule', 'Entry requirements, prerequisites, progression rule'),
      field('Curriculum version', 'v2026, draft, board approved'),
      selectField('Governance status', ['Draft', 'Under review', 'Approved', 'Published', 'Archived']),
      priority,
      dueDate,
      baseField('details', 'Programme governance notes', 'Course structure, outcomes, intake capacity, approval route, compliance evidence, and publishing note.', true, 'textarea'),
    ];
  }

  if (moduleSlug === 'submissions') {
    if (has('rubric', 'review', 'evaluation', 'marks')) {
      return [
        baseField('title', 'Evaluation item', `${sectionName} rubric, review, marks, or feedback release`),
        baseField('requester', 'Student / group', 'Student, group, batch, programme, or project team'),
        baseField('owner', 'Evaluator', 'Teacher, mentor, evaluator, reviewer, or academic owner'),
        field('Rubric / marks', 'Rubric name, max marks, pass mark, weightage'),
        field('Originality check', 'Plagiarism score, duplicate note, or proof reference'),
        selectField('Review status', ['Waiting', 'Under review', 'Revision needed', 'Accepted', 'Rejected', 'Published']),
        field('Feedback release', 'Private, group visible, released after date'),
        priority,
        dueDate,
        baseField('details', 'Evaluation notes', 'Marks, comments, revision rule, attachments, evidence, and release decision.', true, 'textarea'),
      ];
    }
    return [
      baseField('title', 'Submission task', `${sectionName} assignment, project, report, or evidence upload`),
      baseField('requester', 'Student / batch', 'Student, group, batch, programme, or project team'),
      baseField('owner', 'Submission owner', 'Teacher, mentor, evaluator, coordinator, or academic owner'),
      field('Allowed file type', 'PDF, DOCX, ZIP, image, video link'),
      field('Submission window', 'Open date/time and close date/time'),
      field('Rubric / marks', 'Rubric name, max marks, pass mark'),
      selectField('Submission status', ['Not submitted', 'Submitted', 'Under review', 'Revision needed', 'Approved', 'Rejected']),
      priority,
      dueDate,
      baseField('details', 'Submission requirements', 'Instructions, required files, originality status, evaluator comments, revision rule, and feedback release.', true, 'textarea'),
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
    return [
      baseField('title', 'Certificate issue request', `${sectionName} for student, batch, programme, or ceremony`),
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

  if (moduleSlug === 'transport') {
    return [
      baseField('title', 'Route / trip title', `${sectionName} pickup route, stop plan, or vehicle duty`),
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
        baseField('title', 'Residential request', `${sectionName} leave, visitor, incident, or safety case`),
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
      baseField('title', 'Room / resident record', `${sectionName} allocation, bed, resident profile, or maintenance`),
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
        baseField('title', 'Issue / return record', `${sectionName} circulation entry`),
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
    return [
      baseField('title', 'Catalogue item', `${sectionName} book, digital resource, accession, or reservation`),
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
    return [
      baseField('title', 'Support ticket subject', `${sectionName} request or issue`),
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
    return [
      baseField('title', 'Community workspace item', `${sectionName} group, announcement, discussion, or moderation case`),
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

  if (moduleSlug === 'help-centre') {
    if (has('password', 'reset', 'google', 'account', 'login')) {
      return [
        baseField('title', 'Account help guide', 'Reset password / Google login / account access guide'),
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
      baseField('title', 'Knowledge base article', `${sectionName} article, FAQ, or walkthrough`),
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

  return [
    baseField('title', profile.titleLabel, profile.titlePlaceholder),
    baseField('requester', profile.requesterLabel, profile.requesterPlaceholder),
    baseField('owner', profile.ownerLabel, profile.ownerPlaceholder),
    priority,
    dueDate,
    baseField('details', profile.detailsLabel, profile.detailsPlaceholder, true, 'textarea'),
  ];
}

function optionBlocks(moduleSlug: string, featureName: string, sectionName: string, fallback: SectionCard[]): SectionCard[] {
  const context = `${featureName} ${sectionName}`.toLowerCase();
  const has = (...words: string[]) => words.some((word) => context.includes(word));

  if (moduleSlug === 'internship') {
    return [
      { title: 'Partner Role', detail: 'Company, mentor, vacancy, role scope, duration, and agreement.', items: ['Company', 'Mentor', 'Vacancy', 'Agreement'], icon: <BriefcaseBusiness size={18} />, tone: 'from-indigo-500 to-blue-600' },
      { title: 'Student Fit', detail: 'Eligibility, documents, programme match, readiness, and approval.', items: ['Eligibility', 'Documents', 'Match', 'Approval'], icon: <ShieldCheck size={18} />, tone: 'from-emerald-500 to-teal-500' },
      { title: 'Weekly Monitor', detail: 'Logs, attendance, supervisor note, risk, and progress score.', items: ['Logs', 'Attendance', 'Note', 'Risk'], icon: <ClipboardList size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
      { title: 'Completion Evidence', detail: 'Final review, certificate link, report, and archive pack.', items: ['Review', 'Certificate', 'Report', 'Archive'], icon: <Award size={18} />, tone: 'from-amber-500 to-orange-500' },
    ];
  }

  if (moduleSlug === 'school') {
    const featureLower = featureName.toLowerCase();
    const sectionLower = sectionName.toLowerCase();
    const isParentPortal =
      featureLower.includes('parent') ||
      /(parent dashboard|guardian contacts|meeting|consent|student updates|message history|notice|communication)/.test(sectionLower);

    if (isParentPortal) {
      return [
        { title: 'Family Profile', detail: 'Connect student, guardians, relationships, contact channels, and access permissions.', items: ['Student', 'Guardian', 'Relationship', 'Access'], icon: <Users size={18} />, tone: 'from-fuchsia-500 to-violet-600' },
        { title: 'Message Centre', detail: 'Send notices, fee reminders, homework updates, conduct notes, and emergency alerts.', items: ['Notice', 'Reminder', 'Alert', 'Reply'], icon: <MessageSquare size={18} />, tone: 'from-sky-500 to-cyan-500' },
        { title: 'Meeting Planner', detail: 'Schedule parent meetings, counsellor follow-ups, teacher appointments, and minutes.', items: ['Slot', 'Teacher', 'Minutes', 'Follow-up'], icon: <CalendarDays size={18} />, tone: 'from-amber-500 to-orange-500' },
        { title: 'Consent and Audit', detail: 'Record permissions, approvals, acknowledgements, evidence, and final communication log.', items: ['Consent', 'Approval', 'Proof', 'Log'], icon: <ShieldCheck size={18} />, tone: 'from-emerald-500 to-teal-500' },
      ];
    }
    if (has('admission', 'enquiry', 'application', 'guardian', 'document')) {
      return [
        { title: 'Admission Intake', detail: 'Capture enquiry source, application, guardian details, class requested, and admission owner.', items: ['Enquiry', 'Application', 'Guardian', 'Owner'], icon: <Users size={18} />, tone: 'from-cyan-500 to-blue-600' },
        { title: 'Document Desk', detail: 'Check birth certificate, previous school record, photos, transfer proof, and missing items.', items: ['Birth proof', 'Transfer', 'Photos', 'Missing'], icon: <FileText size={18} />, tone: 'from-emerald-500 to-teal-500' },
        { title: 'Seat Decision', detail: 'Review class capacity, interview notes, sibling priority, and final admission decision.', items: ['Capacity', 'Interview', 'Priority', 'Decision'], icon: <ShieldCheck size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
        { title: 'Admission File', detail: 'Generate admission number, fee link, class placement, and final student file.', items: ['Admission no.', 'Fees', 'Class', 'File'], icon: <Database size={18} />, tone: 'from-amber-500 to-orange-500' },
      ];
    }
    if (has('class', 'section', 'teacher', 'timetable', 'homework')) {
      return [
        { title: 'Class Structure', detail: 'Define grade, section, room, roll range, house, and capacity.', items: ['Grade', 'Section', 'Room', 'Capacity'], icon: <GraduationCap size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
        { title: 'Teacher Allocation', detail: 'Assign class teacher, subject teachers, substitute owners, and workload.', items: ['Class teacher', 'Subject', 'Substitute', 'Load'], icon: <Users size={18} />, tone: 'from-sky-500 to-cyan-500' },
        { title: 'Timetable Lane', detail: 'Plan periods, rooms, lab slots, conflicts, and published timetable.', items: ['Periods', 'Rooms', 'Lab', 'Publish'], icon: <CalendarDays size={18} />, tone: 'from-emerald-500 to-teal-500' },
        { title: 'Homework Flow', detail: 'Set homework topic, due date, student scope, parent alert, and completion check.', items: ['Topic', 'Due', 'Scope', 'Alert'], icon: <ClipboardList size={18} />, tone: 'from-amber-500 to-orange-500' },
      ];
    }
    if (has('attendance', 'late', 'leave', 'parent', 'behaviour', 'conduct', 'house')) {
      return [
        { title: 'Daily Marking', detail: 'Mark class attendance, late arrivals, absences, and session status.', items: ['Present', 'Absent', 'Late', 'Session'], icon: <ClipboardList size={18} />, tone: 'from-sky-500 to-cyan-500' },
        { title: 'Leave and Alert', detail: 'Capture leave request, guardian approval, parent alert, and follow-up.', items: ['Leave', 'Guardian', 'Alert', 'Follow-up'], icon: <MessageSquare size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
        { title: 'Behaviour Review', detail: 'Record conduct note, house activity, merit, intervention, and decision.', items: ['Conduct', 'House', 'Merit', 'Intervention'], icon: <ShieldCheck size={18} />, tone: 'from-amber-500 to-orange-500' },
        { title: 'Attendance Report', detail: 'Summarize attendance %, risk students, parent alerts, and class trends.', items: ['Percent', 'Risk', 'Alerts', 'Trends'], icon: <BarChart3 size={18} />, tone: 'from-emerald-500 to-teal-500' },
      ];
    }
    if (has('exam', 'grade', 'marks', 'report', 'promotion')) {
      return [
        { title: 'Exam Setup', detail: 'Create exam schedule, paper, subject, room, invigilator, and calendar.', items: ['Schedule', 'Paper', 'Subject', 'Room'], icon: <CalendarDays size={18} />, tone: 'from-indigo-500 to-blue-600' },
        { title: 'Gradebook Review', detail: 'Enter marks, grade scale, moderation notes, corrections, and approval.', items: ['Marks', 'Scale', 'Moderation', 'Approval'], icon: <ClipboardList size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
        { title: 'Report Card Publish', detail: 'Publish report cards, parent copies, remarks, and locked result status.', items: ['Report card', 'Parent copy', 'Remarks', 'Lock'], icon: <Award size={18} />, tone: 'from-emerald-500 to-teal-500' },
        { title: 'Promotion Decision', detail: 'Track promoted, conditional, remedial, repeat, and archive output.', items: ['Promote', 'Conditional', 'Remedial', 'Archive'], icon: <BarChart3 size={18} />, tone: 'from-amber-500 to-orange-500' },
      ];
    }
    if (has('fee', 'payment', 'receipt', 'invoice', 'balance', 'concession')) {
      return [
        { title: 'Invoice Builder', detail: 'Create term invoices, category splits, discounts, due dates, and student account links.', items: ['Term', 'Category', 'Due date', 'Account'], icon: <Database size={18} />, tone: 'from-emerald-500 to-teal-500' },
        { title: 'Collection Counter', detail: 'Record payments, receipts, gateway references, cashier owner, and parent payer.', items: ['Payment', 'Receipt', 'Gateway', 'Payer'], icon: <CheckCircle2 size={18} />, tone: 'from-sky-500 to-cyan-500' },
        { title: 'Concession Review', detail: 'Route scholarship, sibling discount, waiver, refund, and approval evidence.', items: ['Scholarship', 'Discount', 'Waiver', 'Refund'], icon: <ShieldCheck size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
        { title: 'Balance Dashboard', detail: 'Monitor paid, part-paid, overdue, blocked service, and statement outputs.', items: ['Paid', 'Part-paid', 'Overdue', 'Statement'], icon: <BarChart3 size={18} />, tone: 'from-amber-500 to-orange-500' },
      ];
    }
    return [
      { title: 'Student Profile', detail: 'Manage admission number, class, section, guardian, health, and history.', items: ['Admission no.', 'Class', 'Guardian', 'Health'], icon: <Users size={18} />, tone: 'from-cyan-500 to-blue-600' },
      { title: 'Academic Tracking', detail: 'Connect attendance, homework, exams, marks, and promotion records.', items: ['Attendance', 'Homework', 'Marks', 'Promotion'], icon: <GraduationCap size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
      { title: 'Campus Services', detail: 'Link fees, transport, hostel, library, and help desk service access.', items: ['Fees', 'Transport', 'Hostel', 'Library'], icon: <Bus size={18} />, tone: 'from-emerald-500 to-teal-500' },
      { title: 'School Reports', detail: 'Prepare class strength, attendance, report card, fee, and service summaries.', items: ['Strength', 'Attendance', 'Report card', 'Fees'], icon: <BarChart3 size={18} />, tone: 'from-amber-500 to-orange-500' },
    ];
  }

  if (moduleSlug === 'institutes') {
    if (has('lead', 'enquiry', 'counselling', 'demo', 'follow', 'admission', 'conversion')) {
      return [
        { title: 'Lead Capture', detail: 'Store source, contact, course interest, counsellor, and first response.', items: ['Source', 'Contact', 'Course', 'Response'], icon: <MessageSquare size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
        { title: 'Counselling Desk', detail: 'Track counselling notes, eligibility, fee discussion, and objections.', items: ['Notes', 'Eligibility', 'Fees', 'Objections'], icon: <Users size={18} />, tone: 'from-sky-500 to-cyan-500' },
        { title: 'Demo Booking', detail: 'Plan demo class, trainer, slot, attendance, and demo feedback.', items: ['Demo', 'Trainer', 'Slot', 'Feedback'], icon: <CalendarDays size={18} />, tone: 'from-emerald-500 to-teal-500' },
        { title: 'Conversion File', detail: 'Close admission, payment plan, batch placement, and lost reasons.', items: ['Admission', 'Payment', 'Batch', 'Lost reason'], icon: <BarChart3 size={18} />, tone: 'from-amber-500 to-orange-500' },
      ];
    }
    if (has('course', 'batch', 'session', 'learner', 'progress')) {
      return [
        { title: 'Course Profile', detail: 'Define course syllabus, level, duration, fee plan, and branch availability.', items: ['Syllabus', 'Level', 'Duration', 'Branch'], icon: <BookOpen size={18} />, tone: 'from-indigo-500 to-blue-600' },
        { title: 'Batch Schedule', detail: 'Create batches with trainer, calendar, room, online link, and capacity.', items: ['Batch', 'Trainer', 'Calendar', 'Capacity'], icon: <CalendarDays size={18} />, tone: 'from-sky-500 to-cyan-500' },
        { title: 'Learner Attendance', detail: 'Track learner attendance, progress %, missed sessions, and follow-up.', items: ['Attendance', 'Progress', 'Missed', 'Follow-up'], icon: <ClipboardList size={18} />, tone: 'from-emerald-500 to-teal-500' },
        { title: 'Delivery Report', detail: 'Summarize completion, trainer notes, resource gaps, and batch outcomes.', items: ['Completion', 'Notes', 'Resources', 'Outcome'], icon: <BarChart3 size={18} />, tone: 'from-amber-500 to-orange-500' },
      ];
    }
    if (has('trainer', 'workload', 'resource', 'replacement', 'performance')) {
      return [
        { title: 'Trainer Calendar', detail: 'Manage sessions, blocked slots, branch duties, and backup assignments.', items: ['Sessions', 'Blocked', 'Branch', 'Backup'], icon: <CalendarDays size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
        { title: 'Workload Balance', detail: 'Review hours, active batches, learner count, and overload warnings.', items: ['Hours', 'Batches', 'Learners', 'Warnings'], icon: <Users size={18} />, tone: 'from-sky-500 to-cyan-500' },
        { title: 'Resource Approval', detail: 'Route lab, material, software, and equipment requests to admin.', items: ['Lab', 'Material', 'Software', 'Equipment'], icon: <ShieldCheck size={18} />, tone: 'from-emerald-500 to-teal-500' },
        { title: 'Trainer Performance', detail: 'Track feedback score, completion quality, punctuality, and review notes.', items: ['Feedback', 'Quality', 'Punctuality', 'Review'], icon: <BarChart3 size={18} />, tone: 'from-amber-500 to-orange-500' },
      ];
    }
    if (has('assessment', 'assignment', 'practical', 'test', 'rubric', 'feedback', 'remedial')) {
      return [
        { title: 'Task Setup', detail: 'Create assignment, practical test, rubric, due window, and learner scope.', items: ['Assignment', 'Practical', 'Rubric', 'Due'], icon: <ClipboardList size={18} />, tone: 'from-cyan-500 to-blue-600' },
        { title: 'Evaluator Review', detail: 'Assign evaluator, mark rubric, feedback notes, and revision decision.', items: ['Evaluator', 'Marks', 'Feedback', 'Revision'], icon: <ShieldCheck size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
        { title: 'Remedial Plan', detail: 'Plan make-up work, extra session, retest, and trainer follow-up.', items: ['Make-up', 'Session', 'Retest', 'Follow-up'], icon: <GraduationCap size={18} />, tone: 'from-emerald-500 to-teal-500' },
        { title: 'Assessment Output', detail: 'Publish score, completion status, certificate readiness, and report.', items: ['Score', 'Complete', 'Certificate', 'Report'], icon: <BarChart3 size={18} />, tone: 'from-amber-500 to-orange-500' },
      ];
    }
    return [
      { title: 'Enrollment CRM', detail: 'Manage leads, counselling, demo bookings, follow-ups, and admissions.', items: ['Leads', 'Counselling', 'Demo', 'Admissions'], icon: <MessageSquare size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
      { title: 'Learning Delivery', detail: 'Control courses, batches, trainers, sessions, resources, and progress.', items: ['Courses', 'Batches', 'Trainers', 'Progress'], icon: <BookOpen size={18} />, tone: 'from-sky-500 to-cyan-500' },
      { title: 'Finance and Certificates', detail: 'Track invoices, installments, payment clearance, completion, and certificates.', items: ['Invoices', 'Payments', 'Clearance', 'Certificates'], icon: <Award size={18} />, tone: 'from-emerald-500 to-teal-500' },
      { title: 'Branch Operations', detail: 'Review branch dashboard, resources, support tickets, campaigns, and renewals.', items: ['Branch', 'Resources', 'Support', 'Renewals'], icon: <BarChart3 size={18} />, tone: 'from-amber-500 to-orange-500' },
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

  if (moduleSlug === 'submissions') {
    return [
      { title: 'Task Window', detail: 'Set open date, close date, file type, late policy, and instructions.', items: ['Open', 'Close', 'File type', 'Policy'], icon: <Upload size={18} />, tone: 'from-cyan-500 to-blue-600' },
      { title: 'Evidence Check', detail: 'Validate files, versions, originality, attachments, and proof.', items: ['Files', 'Versions', 'Originality', 'Proof'], icon: <FileText size={18} />, tone: 'from-emerald-500 to-teal-500' },
      { title: 'Evaluator Rubric', detail: 'Assign evaluator, rubric, marks, comments, and revision decision.', items: ['Evaluator', 'Rubric', 'Marks', 'Revision'], icon: <ShieldCheck size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
      { title: 'Feedback Release', detail: 'Publish result, notify learner, archive files, and export evidence.', items: ['Publish', 'Notify', 'Archive', 'Export'], icon: <BarChart3 size={18} />, tone: 'from-amber-500 to-orange-500' },
    ];
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
    return [
      { title: 'Recipient Eligibility', detail: 'Check student record, completion, fees, results, and document clearance.', items: ['Student', 'Completion', 'Fees', 'Results'], icon: <Users size={18} />, tone: 'from-emerald-500 to-teal-500' },
      { title: 'Certificate Data', detail: 'Prepare name spelling, programme, certificate type, serial, and batch.', items: ['Name', 'Programme', 'Type', 'Serial'], icon: <Award size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
      { title: 'Approval Signature', detail: 'Route signature to registrar, department head, principal, or issuer.', items: ['Registrar', 'Head', 'Principal', 'Issuer'], icon: <ShieldCheck size={18} />, tone: 'from-amber-500 to-orange-500' },
      { title: 'Print and Delivery', detail: 'Release PDF, print batch, student pickup, courier, or archive.', items: ['PDF', 'Print', 'Pickup', 'Archive'], icon: <FileText size={18} />, tone: 'from-sky-500 to-cyan-500' },
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

  if (moduleSlug === 'support') {
    return [
      { title: 'Ticket Intake', detail: 'Capture requester, issue category, screenshot, channel, and affected page.', items: ['Requester', 'Category', 'Proof', 'Page'], icon: <Headphones size={18} />, tone: 'from-cyan-500 to-blue-600' },
      { title: 'Agent Worklog', detail: 'Record replies, internal notes, fixes tried, handover, and escalation.', items: ['Reply', 'Note', 'Fix', 'Handover'], icon: <MessageSquare size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
      { title: 'Resolution Proof', detail: 'Attach fix summary, user confirmation, reopened status, and root cause.', items: ['Fix', 'Confirm', 'Reopen', 'Cause'], icon: <ShieldCheck size={18} />, tone: 'from-emerald-500 to-teal-500' },
      { title: 'Knowledge Update', detail: 'Create reusable answer, related guide, FAQ update, and support report.', items: ['Answer', 'Guide', 'FAQ', 'Report'], icon: <FileText size={18} />, tone: 'from-amber-500 to-orange-500' },
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

  if (moduleSlug === 'help-centre') {
    return [
      { title: 'Search Question', detail: 'Map exact searched words, user role, article intent, and problem type.', items: ['Keywords', 'Question', 'Intent', 'Role'], icon: <MessageSquare size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
      { title: 'Answer Draft', detail: 'Write steps, screenshot notes, expected result, and fallback action.', items: ['Steps', 'Images', 'Result', 'Fallback'], icon: <FileText size={18} />, tone: 'from-sky-500 to-cyan-500' },
      { title: 'Related Help', detail: 'Link FAQs, support ticket path, account settings, and module pages.', items: ['FAQs', 'Support', 'Settings', 'Module'], icon: <ClipboardList size={18} />, tone: 'from-emerald-500 to-teal-500' },
      { title: 'Guide Feedback', detail: 'Track helpful votes, failed searches, comments, and update requests.', items: ['Votes', 'Searches', 'Comments', 'Updates'], icon: <BarChart3 size={18} />, tone: 'from-amber-500 to-orange-500' },
    ];
  }

  return fallback;
}

function optionControls(moduleSlug: string, fallback: string[]) {
  const controls: Record<string, string[]> = {
    school: ['Class capacity', 'Guardian consent', 'Attendance threshold', 'Marks approval', 'Fee clearance'],
    institutes: ['Lead source rule', 'Batch capacity', 'Trainer workload', 'Payment clearance', 'Certificate release'],
    internship: ['Eligibility rule', 'Offer approval', 'Mentor assignment', 'Completion proof'],
    training: ['Batch capacity', 'Trainer availability', 'Attendance threshold', 'Result publish lock'],
    programmes: ['Curriculum version', 'Credit rule', 'Eligibility gate', 'Academic approval'],
    submissions: ['File type rule', 'Late submission policy', 'Evaluator access', 'Feedback release'],
    certificates: ['Eligibility lock', 'Signature route', 'QR verification', 'Print permission'],
    transport: ['Route capacity', 'Driver duty lock', 'GPS checkpoint', 'Incident escalation'],
    hostel: ['Room capacity', 'Warden approval', 'Visitor rule', 'Safety escalation'],
    library: ['Borrow limit', 'Renewal rule', 'Fine policy', 'Shelf audit'],
    support: ['SLA priority', 'Agent assignment', 'Escalation route', 'Closure confirmation'],
    community: ['Membership approval', 'Post moderation', 'Audience visibility', 'Event capacity'],
    'help-centre': ['Article review', 'Search keywords', 'Role visibility', 'Feedback queue'],
  };

  return controls[moduleSlug] ?? fallback;
}

function optionOutputs(moduleSlug: string, sectionName: string, fallback: string[]) {
  const outputs: Record<string, string[]> = {
    school: ['Student master register', 'Class section list', 'Attendance summary', 'Report card pack'],
    institutes: ['Lead conversion file', 'Batch delivery sheet', 'Trainer workload report', 'Revenue certificate pack'],
    internship: ['Placement register', 'Offer tracker', 'Weekly log export', 'Completion report'],
    training: ['Batch delivery sheet', 'Attendance register', 'Assessment summary', 'Skill progress report'],
    programmes: ['Programme catalogue', 'Curriculum map', 'Eligibility list', 'Board approval pack'],
    submissions: ['Submission register', 'Evaluation sheet', 'Revision tracker', 'Feedback export'],
    certificates: ['Certificate queue', 'QR verification log', 'Print batch', 'Issue archive'],
    transport: ['Route manifest', 'Passenger list', 'Driver duty sheet', 'Trip incident report'],
    hostel: ['Room allocation list', 'Resident profile sheet', 'Leave register', 'Safety audit report'],
    library: ['Catalogue register', 'Issue-return ledger', 'Overdue list', 'Fine report'],
    support: ['Ticket register', 'SLA report', 'Resolution notes', 'Knowledge article'],
    community: ['Group register', 'Announcement log', 'Event attendance', 'Engagement report'],
    'help-centre': ['Article draft', 'FAQ collection', 'Search result guide', 'Guide feedback report'],
  };

  return outputs[moduleSlug] ?? fallback;
}

export default async function ModuleSectionPage({ params }: { params: { module: string; feature: string; section: string } }) {
  const workspace = getMainWorkspace(params.module);
  const feature = findWorkspaceFeature(params.module, params.feature);
  const moduleName = workspace?.title ?? titleFromSlug(params.module);
  const featureName = feature?.title ?? titleFromSlug(params.feature);
  const sectionName = titleFromSlug(params.section);
  const parentHref = `/modules/${params.module}/${params.feature}`;
  const recordFeature = `${params.feature}/${params.section}`;
  const profile = profileFor(moduleName, featureName, sectionName);
  const sectionFields = optionFields(params.module, featureName, sectionName, profile);
  const sectionCards = optionBlocks(params.module, featureName, sectionName, profile.cards);
  const sectionControls = optionControls(params.module, profile.controls);
  const sectionOutputs = optionOutputs(params.module, sectionName, profile.outputs);
  const siblingHref = (label: string) => `/modules/${params.module}/${params.feature}/${slugifyWorkspace(label)}`;
  const detailHref = (label: string) => `/modules/${params.module}/${params.feature}/${params.section}/${slugifyWorkspace(label)}`;
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
        <Link href={parentHref} className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/80 hover:text-white sm:text-sm">
          <ArrowLeft size={15} /> Back to {featureName}
        </Link>
        <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_300px] xl:gap-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/70">{profile.eyebrow}</p>
            <h1 className="mt-2 break-words text-xl font-extrabold leading-tight text-white sm:text-3xl">{profile.title}</h1>
            <p className="mt-3 max-w-3xl text-xs leading-5 text-white/78 sm:text-sm sm:leading-6">{profile.summary}</p>
          </div>
          {params.module === 'community' ? (
            <div className="overflow-hidden rounded-xl bg-white/14 p-2 ring-1 ring-white/18 sm:rounded-2xl">
              <div className="erp-main-visual-frame">
                <img src="/images/community-main-workspace-rounded.png?v=1" alt="Community workspace visual" className="erp-main-visual-image community-main-workspace-image h-auto w-full object-contain object-center" />
              </div>
              <div className="px-2 pb-2 pt-3">
                <p className="text-sm font-bold text-white">Separate Section Page</p>
                <p className="mt-1 text-xs leading-5 text-white/72">This is a real child route. Records saved here stay scoped to this exact option.</p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-white/14 p-3 ring-1 ring-white/18 sm:rounded-2xl sm:p-4">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/18 ring-1 ring-white/20 sm:h-12 sm:w-12 sm:rounded-2xl">{profile.icon}</span>
              <p className="mt-3 text-sm font-bold text-white sm:mt-4">Separate Section Page</p>
              <p className="mt-1 text-xs leading-5 text-white/72">This is a real child route. Records saved here stay scoped to this exact option.</p>
            </div>
          )}
        </div>
      </section>

      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        <Metric icon={<Database size={18} />} label="Saved records" value={String(records.length)} accent />
        <Metric icon={<ClipboardList size={18} />} label="Work blocks" value={String(sectionCards.length)} />
        <Metric icon={<ShieldCheck size={18} />} label="Controls" value={String(sectionControls.length)} />
        <Metric icon={<BarChart3 size={18} />} label="Outputs" value={String(sectionOutputs.length)} />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex items-center gap-2">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">{profile.icon}</span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Individual ERP section</p>
            <h2 className="font-bold text-slate-950">{sectionName} sections</h2>
          </div>
        </div>
        <div className="mt-4 grid gap-2 sm:gap-3 md:grid-cols-2 xl:grid-cols-4">
          {sectionCards.map((card) => (
            <article key={card.title} className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:rounded-2xl sm:p-4">
              <Link href={detailHref(card.title)} className="group/card block">
                <span className={`grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br ${card.tone} text-white shadow-sm sm:h-10 sm:w-10 sm:rounded-2xl`}>{card.icon}</span>
                <span className="mt-3 flex min-w-0 items-start gap-2 sm:mt-4">
                  <span className="min-w-0">
                    <span className="block break-words text-sm font-extrabold text-slate-950">{card.title}</span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">{card.detail}</span>
                  </span>
                  <ArrowRight size={14} className="ml-auto shrink-0 text-slate-400 transition group-hover/card:text-brand-600" />
                </span>
              </Link>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {card.items.map((item) => (
                  <Link key={item} href={detailHref(item)} className="inline-flex min-w-0 items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600 transition hover:border-brand-300 hover:text-brand-600">
                    {item}
                    <ArrowRight size={10} className="shrink-0" />
                  </Link>
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
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Action form</p>
              <h2 className="font-bold text-slate-950">{profile.formTitle}</h2>
            </div>
          </div>
          <form action={createModuleRecord} className="erp-form-page mt-4 space-y-3">
            <input type="hidden" name="module" value={params.module} />
            <input type="hidden" name="feature" value={recordFeature} />
            <div className="grid gap-3 md:grid-cols-2">
              {sectionFields.map((item) => (
                <OptionFormField key={item.name} field={item} />
              ))}
            </div>
            <button className="inline-flex min-h-10 w-full min-w-0 items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-center text-sm font-semibold leading-tight text-white transition hover:bg-brand-700 sm:w-auto sm:whitespace-nowrap">
              <Send size={16} className="shrink-0" /> <span>Save</span>
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-bold text-slate-950">{sectionName} records</h2>
              <p className="mt-1 text-sm text-slate-500">Records saved only for this individual option page.</p>
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
                    <Info label={profile.requesterLabel} value={record.requester || 'Not added'} />
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
              <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">Use this separate page form to create the first {sectionName.toLowerCase()} record.</p>
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-3 sm:gap-4 xl:grid-cols-3">
        <SideList title="Controls" items={sectionControls} icon={<ShieldCheck size={18} />} hrefBase={`/modules/${params.module}/${params.feature}/${params.section}`} />
        <SideList title="Outputs" items={sectionOutputs} icon={<BarChart3 size={18} />} hrefBase={`/modules/${params.module}/${params.feature}/${params.section}`} />
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
              <ArrowRight size={18} />
            </span>
            <h2 className="break-words font-bold text-slate-950">Sibling sections</h2>
          </div>
          <div className="mt-3 space-y-2">
            {sectionCards.map((card) => (
              <Link key={card.title} href={siblingHref(card.title)} className="group flex min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition hover:border-brand-300 hover:bg-white hover:text-brand-600">
                <span className="h-2 w-2 shrink-0 rounded-full bg-aurora" />
                <span className="min-w-0 break-words">{card.title}</span>
                <ArrowRight size={13} className="ml-auto shrink-0 text-slate-400 opacity-0 transition group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="font-bold text-slate-950">Status summary</h2>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
          {statusCounts.map((status) => (
            <div key={status.value} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="truncate text-[10px] font-semibold uppercase tracking-widest text-slate-400 sm:text-xs">{status.label}</p>
              <p className="mt-1 text-xl font-extrabold text-slate-950 sm:mt-2 sm:text-2xl">{status.count}</p>
            </div>
          ))}
        </div>
      </section>
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

function OptionFormField({ field }: { field: OptionField }) {
  const inputClass = 'erp-form-control block h-10 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-500 sm:h-11';
  const areaClass = 'erp-form-control block w-full min-w-0 resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-500';

  if (field.kind === 'textarea') {
    return (
      <Field label={field.label} className="md:col-span-2">
        <textarea name={field.name} required={field.required} rows={4} placeholder={field.placeholder} className={areaClass} />
      </Field>
    );
  }

  if (field.kind === 'select') {
    return (
      <Field label={field.label} className={field.full ? 'md:col-span-2' : undefined}>
        <select name={field.name} required={field.required} className={inputClass}>
          {(field.options ?? []).map((option) => (
            <option key={option} value={field.name === 'priority' ? option : option}>
              {option.charAt(0) + option.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </Field>
    );
  }

  return (
    <Field label={field.label} className={field.full ? 'md:col-span-2' : undefined}>
      <input name={field.name} required={field.required} type={field.kind === 'date' ? 'date' : 'text'} placeholder={field.placeholder} className={inputClass} />
    </Field>
  );
}

function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`erp-form-field grid w-full min-w-0 gap-1 ${className ?? ''}`}>
      <span className="erp-form-label block text-xs font-semibold text-slate-700 sm:text-sm">{label}</span>
      <div className="min-w-0">{children}</div>
    </label>
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

function SideList({ title, items, icon, hrefBase }: { title: string; items: string[]; icon: ReactNode; hrefBase: string }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">{icon}</span>
        <h2 className="break-words font-bold text-slate-950">{title}</h2>
      </div>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <Link key={item} href={`${hrefBase}/${slugifyWorkspace(item)}`} className="group flex min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition hover:border-brand-300 hover:bg-white hover:text-brand-600">
            <CheckCircle2 size={15} className="shrink-0 text-brand-600" />
            <span className="min-w-0 break-words">{item}</span>
            <ArrowRight size={13} className="ml-auto shrink-0 text-slate-400 opacity-0 transition group-hover:opacity-100" />
          </Link>
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
