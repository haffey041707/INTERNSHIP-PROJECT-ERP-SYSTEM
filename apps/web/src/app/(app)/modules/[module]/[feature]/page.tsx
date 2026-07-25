import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  Building2,
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
  Users,
} from 'lucide-react';
import { ModuleExperience } from '@/components/ModuleExperience';
import { db } from '@/lib/db';
import { findWorkspaceFeature, getMainWorkspace, slugifyWorkspace } from '@/lib/main-workspaces';
import { getSession } from '@/lib/session';
import { createModuleRecord, deleteModuleRecord, updateModuleRecordStatus } from '../../../actions';

export const dynamic = 'force-dynamic';

const STATUS_FLOW = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'IN_REVIEW', label: 'In Review' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'CLOSED', label: 'Closed' },
];

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

function priorityClass(priority: string) {
  switch (priority) {
    case 'URGENT':
      return 'bg-red-50 text-red-700 border-red-100';
    case 'HIGH':
      return 'bg-orange-50 text-orange-700 border-orange-100';
    case 'LOW':
      return 'bg-slate-50 text-slate-500 border-slate-200';
    default:
      return 'bg-sky-50 text-sky-700 border-sky-100';
  }
}

type FeatureWorkSection = {
  title: string;
  detail: string;
  items: string[];
  href: string;
  icon: ReactNode;
  tone: string;
};

type FeatureWorkConfig = {
  eyebrow: string;
  title: string;
  summary: string;
  sections: FeatureWorkSection[];
};

function workSection(
  title: string,
  detail: string,
  items: string[],
  href: string,
  icon: ReactNode,
  tone: string,
): FeatureWorkSection {
  return { title, detail, items, href, icon, tone };
}

function getFeatureWorkConfig(moduleSlug: string, moduleName: string, featureName: string, sectionTitle?: string): FeatureWorkConfig {
  const featureLower = featureName.toLowerCase();
  const sectionLower = (sectionTitle ?? moduleName).toLowerCase();
  const sharedTone = 'from-violet-600 to-fuchsia-500';

  const configs: Record<string, Omit<FeatureWorkConfig, 'title' | 'summary'>> = {
    school: {
      eyebrow: 'School operations',
      sections: [
        workSection('Student Intake File', `Capture admission or student master details for ${featureLower}.`, ['Student details', 'Guardian details', 'Previous school'], '#create-record', <Users size={18} />, 'from-cyan-500 to-blue-600'),
        workSection('Class and Section Setup', 'Assign class, section, roll number, house, teacher owner, and timetable lane.', ['Class', 'Section', 'Roll number'], '#workflow-status', <GraduationCap size={18} />, 'from-violet-600 to-fuchsia-500'),
        workSection('Guardian and Document Checks', 'Verify guardian consent, required documents, health notes, and communication records.', ['Guardian consent', 'Documents', 'Health note'], '#documents', <ShieldCheck size={18} />, 'from-emerald-500 to-teal-500'),
        workSection('Parent Communication Portal', 'Manage parent dashboards, guardian contacts, meeting requests, consent forms, notices, and message history.', ['Parent dashboard', 'Guardian contacts', 'Meetings'], '#live-records', <MessageSquare size={18} />, 'from-fuchsia-500 to-violet-600'),
        workSection('Attendance and Conduct Log', 'Track attendance health, leave requests, behaviour notes, parent alerts, and daily follow-up.', ['Attendance', 'Leave', 'Behaviour'], '#live-records', <ClipboardList size={18} />, 'from-amber-500 to-orange-500'),
        workSection('Exam and Report Card Control', 'Manage exam schedules, gradebook approval, promotion decisions, and published report cards.', ['Exam schedule', 'Gradebook', 'Promotion'], '#controls', <Award size={18} />, 'from-rose-500 to-pink-500'),
        workSection('Fee Ledger and Receipt Desk', 'Control invoices, payment collection, concessions, receipts, balances, and account summaries.', ['Invoices', 'Receipts', 'Balances'], '#reports', <BarChart3 size={18} />, 'from-emerald-500 to-teal-500'),
        workSection('Campus Service Reports', 'Export transport, hostel, library, parent communication, and class strength summaries.', ['Transport', 'Hostel', 'Library'], '#reports', <Bus size={18} />, 'from-indigo-500 to-blue-500'),
      ],
    },
    institutes: {
      eyebrow: 'Institute operations',
      sections: [
        workSection('Lead CRM Intake', `Create the enquiry, counselling, demo booking, and conversion record for ${featureLower}.`, ['Lead source', 'Counselling note', 'Demo booking'], '#create-record', <MessageSquare size={18} />, 'from-violet-600 to-fuchsia-500'),
        workSection('Course Batch Planner', 'Build course batches with schedule, capacity, learner list, delivery mode, and branch.', ['Course', 'Batch', 'Schedule'], '#workflow-status', <CalendarDays size={18} />, 'from-sky-500 to-cyan-500'),
        workSection('Trainer Delivery Desk', 'Assign trainer workload, session plans, resources, replacement rules, and attendance checks.', ['Trainer', 'Session plan', 'Resources'], '#documents', <Users size={18} />, 'from-emerald-500 to-teal-500'),
        workSection('Assessment and Feedback Board', 'Handle assignments, practical tests, rubrics, feedback release, and remedial plans.', ['Assignment', 'Practical test', 'Feedback'], '#live-records', <ClipboardList size={18} />, 'from-amber-500 to-orange-500'),
        workSection('Revenue and Certificate Control', 'Track invoices, discounts, installments, payment clearance, and certificate release.', ['Invoice', 'Installments', 'Certificate'], '#controls', <Award size={18} />, 'from-rose-500 to-pink-500'),
        workSection('Branch Growth Reports', 'Export lead conversion, batch progress, trainer workload, revenue, and branch performance.', ['Conversion', 'Progress', 'Revenue'], '#reports', <BarChart3 size={18} />, 'from-indigo-500 to-blue-500'),
      ],
    },
    internship: {
      eyebrow: 'Placement workflow',
      sections: [
        workSection('Partner and Role Setup', `Create the company, role, mentor, and eligibility details for ${featureLower}.`, ['Company profile', 'Role description', 'Mentor contact'], '#create-record', <Building2 size={18} />, 'from-sky-500 to-cyan-500'),
        workSection('Eligibility Review', 'Check student readiness, programme rules, documents, and approval owner.', ['Student checklist', 'Programme fit', 'Document status'], '#workflow-status', <ShieldCheck size={18} />, sharedTone),
        workSection('Weekly Progress Logs', 'Track supervisor updates, student logs, risk notes, and completion proof.', ['Weekly log', 'Risk note', 'Review comment'], '#live-records', <ClipboardList size={18} />, 'from-emerald-500 to-teal-500'),
        workSection('Placement Evidence', 'Keep offer letters, agreements, reports, and completion files together.', ['Offer letter', 'Agreement', 'Completion file'], '#documents', <FileText size={18} />, 'from-amber-500 to-orange-500'),
        workSection('Supervisor Controls', 'Control mentor assignment, review cycles, completion lock, and visibility.', ['Owner routing', 'Review cycle', 'Completion lock'], '#controls', <Users size={18} />, 'from-rose-500 to-pink-500'),
        workSection('Placement Reports', 'Export partner performance, pending reviews, and completion evidence.', ['Pipeline report', 'Partner report', 'Evidence pack'], '#reports', <BarChart3 size={18} />, 'from-indigo-500 to-blue-500'),
      ],
    },
    training: {
      eyebrow: 'Training delivery',
      sections: [
        workSection('Batch Planner', `Build the learner batch, trainer, capacity, and schedule for ${featureLower}.`, ['Batch name', 'Trainer', 'Capacity'], '#create-record', <Users size={18} />, 'from-violet-600 to-fuchsia-500'),
        workSection('Session Calendar', 'Plan session dates, learning outcomes, materials, and attendance rules.', ['Session plan', 'Resources', 'Attendance rule'], '#workflow-status', <CalendarDays size={18} />, 'from-sky-500 to-cyan-500'),
        workSection('Learner Progress', 'Review saved learner records, skill checks, feedback, and pending work.', ['Skill check', 'Feedback', 'Progress status'], '#live-records', <GraduationCap size={18} />, 'from-emerald-500 to-teal-500'),
        workSection('Training Evidence', 'Store session plans, attendance sheets, materials, and assessment proof.', ['Attendance sheet', 'Material', 'Assessment proof'], '#documents', <FileText size={18} />, 'from-amber-500 to-orange-500'),
        workSection('Trainer Controls', 'Manage trainer ownership, capacity limits, publishing rules, and review locks.', ['Trainer owner', 'Capacity', 'Publish rule'], '#controls', <ShieldCheck size={18} />, 'from-rose-500 to-pink-500'),
        workSection('Progress Reports', 'Export batch delivery, trainer workload, attendance gaps, and skill growth.', ['Batch report', 'Workload', 'Skill report'], '#reports', <BarChart3 size={18} />, 'from-indigo-500 to-blue-500'),
      ],
    },
    programmes: {
      eyebrow: 'Academic governance',
      sections: [
        workSection('Programme Catalogue', `Create the official programme, department, duration, and intake record for ${featureLower}.`, ['Programme name', 'Department', 'Intake'], '#create-record', <BookOpen size={18} />, 'from-indigo-500 to-blue-500'),
        workSection('Curriculum Approval', 'Route curriculum versions, credit rules, outcomes, and committee approvals.', ['Version', 'Credits', 'Outcome map'], '#workflow-status', <ShieldCheck size={18} />, 'from-violet-600 to-fuchsia-500'),
        workSection('Published Records', 'View saved programme records, owners, status, and approval history.', ['Catalogue record', 'Owner', 'Status'], '#live-records', <Database size={18} />, 'from-emerald-500 to-teal-500'),
        workSection('Academic Documents', 'Keep curriculum maps, credit matrices, outcomes, and committee files.', ['Curriculum map', 'Credit matrix', 'Committee file'], '#documents', <FileText size={18} />, 'from-amber-500 to-orange-500'),
        workSection('Eligibility Controls', 'Set entry rules, catalogue visibility, version locks, and approval gates.', ['Entry rule', 'Version lock', 'Approval gate'], '#controls', <KeyRound size={18} />, 'from-rose-500 to-pink-500'),
        workSection('Outcome Reports', 'Export catalogue summaries, change logs, eligibility matrix, and outcomes.', ['Catalogue', 'Change log', 'Outcome report'], '#reports', <BarChart3 size={18} />, 'from-sky-500 to-cyan-500'),
      ],
    },
    submissions: {
      eyebrow: 'Submission operations',
      sections: [
        workSection('Task Brief and Upload Window', `Create the submission task, due window, file rules, and student scope for ${featureLower}.`, ['Task brief', 'Due window', 'File rules'], '#create-record', <Send size={18} />, 'from-rose-500 to-orange-500'),
        workSection('Evaluator Queue', 'Route submissions to evaluators with rubric locks, revisions, and review status.', ['Evaluator', 'Rubric', 'Revision'], '#workflow-status', <ClipboardList size={18} />, 'from-violet-600 to-fuchsia-500'),
        workSection('Submission Register', 'Track saved upload records, owners, priorities, and feedback release status.', ['Upload record', 'Owner', 'Status'], '#live-records', <Database size={18} />, 'from-sky-500 to-cyan-500'),
        workSection('Evidence Files', 'Keep submitted files, originality status, rubric sheets, and comments together.', ['Submitted file', 'Originality', 'Feedback'], '#documents', <FileText size={18} />, 'from-emerald-500 to-teal-500'),
        workSection('Marking Controls', 'Control late policy, rubric lock, evaluator routing, and student visibility.', ['Late policy', 'Rubric lock', 'Visibility'], '#controls', <ShieldCheck size={18} />, 'from-indigo-500 to-blue-500'),
        workSection('Submission Reports', 'Export late submissions, evaluator workload, status, and evidence archive.', ['Late report', 'Workload', 'Archive'], '#reports', <BarChart3 size={18} />, 'from-amber-500 to-orange-500'),
      ],
    },
    certificates: {
      eyebrow: 'Certificate issuing',
      sections: [
        workSection('Recipient Request', `Create the recipient, certificate type, eligibility proof, and delivery method for ${featureLower}.`, ['Recipient', 'Certificate type', 'Delivery'], '#create-record', <Award size={18} />, 'from-violet-600 to-fuchsia-500'),
        workSection('Approval and Signature Route', 'Move requests through eligibility checks, authorized signatory, and issuing approval.', ['Eligibility', 'Signatory', 'Approval'], '#workflow-status', <ShieldCheck size={18} />, 'from-sky-500 to-cyan-500'),
        workSection('Issue Register', 'Track saved certificate requests, status, owners, priorities, and reissue cases.', ['Issue record', 'Owner', 'Reissue'], '#live-records', <Database size={18} />, 'from-emerald-500 to-teal-500'),
        workSection('Templates and QR Proof', 'Keep template files, signature approvals, QR verification, and proof documents.', ['Template', 'Signature', 'QR proof'], '#documents', <FileText size={18} />, 'from-amber-500 to-orange-500'),
        workSection('Security Controls', 'Lock templates, signature authority, QR status, and reissue reasons.', ['Template lock', 'QR status', 'Reissue reason'], '#controls', <KeyRound size={18} />, 'from-rose-500 to-pink-500'),
        workSection('Print and Verification Reports', 'Export issue registers, pending approvals, template usage, and verification logs.', ['Issue register', 'Pending approval', 'Verification log'], '#reports', <BarChart3 size={18} />, 'from-indigo-500 to-blue-500'),
      ],
    },
    transport: {
      eyebrow: 'Transport control',
      sections: [
        workSection('Route Map Builder', `Create route, stop order, rider group, pickup timing, and capacity for ${featureLower}.`, ['Route map', 'Stop order', 'Capacity'], '#create-record', <MapPinned size={18} />, 'from-sky-500 to-cyan-500'),
        workSection('Dispatch Workflow', 'Move routes through vehicle assignment, driver duty, trip sheet, and safety checks.', ['Vehicle', 'Driver', 'Trip sheet'], '#workflow-status', <Bus size={18} />, 'from-violet-600 to-fuchsia-500'),
        workSection('Daily Trip Register', 'Track saved trip records, riders, route owners, status, and exceptions.', ['Trip record', 'Rider group', 'Exception'], '#live-records', <Database size={18} />, 'from-emerald-500 to-teal-500'),
        workSection('Vehicle and Incident Files', 'Keep route sheets, driver logs, vehicle documents, and incident notes.', ['Route sheet', 'Driver log', 'Incident note'], '#documents', <FileText size={18} />, 'from-amber-500 to-orange-500'),
        workSection('Safety and Capacity Rules', 'Control seat capacity, stop timing, driver duty, and incident severity.', ['Seat capacity', 'Stop timing', 'Severity'], '#controls', <ShieldCheck size={18} />, 'from-rose-500 to-pink-500'),
        workSection('Fleet Reports', 'Export route utilization, maintenance, daily trip sheets, and incident summaries.', ['Route usage', 'Maintenance', 'Incident summary'], '#reports', <BarChart3 size={18} />, 'from-indigo-500 to-blue-500'),
      ],
    },
    hostel: {
      eyebrow: 'Residential operations',
      sections: [
        workSection('Room and Bed Ledger', `Create the room, bed, resident, warden, and category record for ${featureLower}.`, ['Room', 'Bed', 'Warden'], '#create-record', <Building2 size={18} />, 'from-emerald-500 to-teal-500'),
        workSection('Resident Care Flow', 'Handle allocation, leave passes, visitor approvals, care notes, and incidents.', ['Leave pass', 'Visitor', 'Care note'], '#workflow-status', <Users size={18} />, 'from-violet-600 to-fuchsia-500'),
        workSection('Resident Register', 'Track saved hostel records, wardens, priorities, due dates, and status.', ['Resident record', 'Warden', 'Status'], '#live-records', <Database size={18} />, 'from-sky-500 to-cyan-500'),
        workSection('Care and Proof Files', 'Keep resident profiles, visitor ID proof, health notes, and incident files.', ['Profile', 'Visitor proof', 'Health note'], '#documents', <FileText size={18} />, 'from-amber-500 to-orange-500'),
        workSection('Warden Controls', 'Control capacity, guardian approval, visitor checks, and warden ownership.', ['Capacity', 'Guardian approval', 'Visitor check'], '#controls', <ShieldCheck size={18} />, 'from-rose-500 to-pink-500'),
        workSection('Occupancy Reports', 'Export occupancy summaries, leave registers, visitor logs, and admin packs.', ['Occupancy', 'Leave register', 'Visitor log'], '#reports', <BarChart3 size={18} />, 'from-indigo-500 to-blue-500'),
      ],
    },
    library: {
      eyebrow: 'Library circulation',
      sections: [
        workSection('Catalogue Record', `Create book, copy, ISBN, category, digital link, and access record for ${featureLower}.`, ['Book copy', 'ISBN', 'Category'], '#create-record', <BookOpen size={18} />, 'from-amber-500 to-orange-500'),
        workSection('Issue and Return Flow', 'Process issue, return, reservation, overdue, and fine workflow clearly.', ['Issue', 'Return', 'Reservation'], '#workflow-status', <ClipboardList size={18} />, 'from-sky-500 to-cyan-500'),
        workSection('Circulation Register', 'Track saved library records, members, due dates, owners, and status.', ['Member', 'Due date', 'Status'], '#live-records', <Database size={18} />, 'from-emerald-500 to-teal-500'),
        workSection('Resource Documents', 'Keep accession proof, issue slips, return proof, and overdue notices.', ['Accession', 'Issue slip', 'Overdue notice'], '#documents', <FileText size={18} />, 'from-violet-600 to-fuchsia-500'),
        workSection('Borrowing Rules', 'Control borrowing limits, due date policy, reservation priority, and fines.', ['Borrowing limit', 'Due policy', 'Fine rule'], '#controls', <ShieldCheck size={18} />, 'from-rose-500 to-pink-500'),
        workSection('Reading Reports', 'Export catalogue summaries, circulation, overdue, and engagement insights.', ['Catalogue', 'Circulation', 'Engagement'], '#reports', <BarChart3 size={18} />, 'from-indigo-500 to-blue-500'),
      ],
    },
    support: {
      eyebrow: 'Service desk',
      sections: [
        workSection('Ticket Intake', `Create requester, category, priority, evidence, and communication record for ${featureLower}.`, ['Requester', 'Category', 'Evidence'], '#create-record', <Headphones size={18} />, 'from-sky-500 to-cyan-500'),
        workSection('SLA and Escalation Flow', 'Route tickets through owner assignment, SLA timer, internal notes, and closure.', ['Owner', 'SLA', 'Escalation'], '#workflow-status', <ShieldCheck size={18} />, 'from-violet-600 to-fuchsia-500'),
        workSection('Request Register', 'Track saved support requests, owners, status, priorities, and due dates.', ['Ticket record', 'Owner', 'Status'], '#live-records', <Database size={18} />, 'from-emerald-500 to-teal-500'),
        workSection('Evidence and Replies', 'Keep screenshots, requester notes, internal replies, and resolution proof.', ['Screenshot', 'Internal note', 'Resolution'], '#documents', <MessageSquare size={18} />, 'from-amber-500 to-orange-500'),
        workSection('Support Rules', 'Control request categories, priority levels, SLA paths, and response templates.', ['Category', 'Priority', 'Template'], '#controls', <KeyRound size={18} />, 'from-rose-500 to-pink-500'),
        workSection('Quality Reports', 'Export request summaries, owner performance, SLA gaps, and issue trends.', ['SLA review', 'Owner report', 'Issue trend'], '#reports', <BarChart3 size={18} />, 'from-indigo-500 to-blue-500'),
      ],
    },
    community: {
      eyebrow: 'Engagement operations',
      sections: [
        workSection('Audience and Post Setup', `Create the group, audience, announcement, event, or poll record for ${featureLower}.`, ['Audience', 'Content', 'Schedule'], '#create-record', <Users size={18} />, 'from-violet-600 to-fuchsia-500'),
        workSection('Moderation Flow', 'Route posts through moderator approval, event capacity, feedback windows, and rules.', ['Moderator', 'Capacity', 'Feedback'], '#workflow-status', <ShieldCheck size={18} />, 'from-sky-500 to-cyan-500'),
        workSection('Engagement Register', 'Track saved community records, groups, owners, priority, and status.', ['Group record', 'Owner', 'Status'], '#live-records', <Database size={18} />, 'from-emerald-500 to-teal-500'),
        workSection('Community Content Files', 'Keep announcement copy, event plans, poll results, and moderation proof.', ['Announcement', 'Event plan', 'Poll results'], '#documents', <MessageSquare size={18} />, 'from-amber-500 to-orange-500'),
        workSection('Audience Rules', 'Control membership, audience targeting, post permissions, and review rules.', ['Membership', 'Audience', 'Permissions'], '#controls', <KeyRound size={18} />, 'from-rose-500 to-pink-500'),
        workSection('Engagement Reports', 'Export activity, event participation, announcement reach, and moderation logs.', ['Activity', 'Participation', 'Moderation'], '#reports', <BarChart3 size={18} />, 'from-indigo-500 to-blue-500'),
      ],
    },
    settings: {
      eyebrow: 'System configuration',
      sections: [
        workSection('Institution Profile Change', `Create the profile, access, brand, or security change record for ${featureLower}.`, ['Profile', 'Brand', 'Security'], '#create-record', <Building2 size={18} />, 'from-violet-600 to-fuchsia-500'),
        workSection('Approval and Preview Flow', 'Route configuration changes through admin approval, preview, and audit review.', ['Admin approval', 'Preview', 'Audit'], '#workflow-status', <ShieldCheck size={18} />, 'from-sky-500 to-cyan-500'),
        workSection('Change Register', 'Track saved configuration records, owners, status, and rollback notes.', ['Change record', 'Owner', 'Rollback'], '#live-records', <Database size={18} />, 'from-emerald-500 to-teal-500'),
        workSection('Configuration Proof', 'Keep change request, approval note, before/after proof, and security review.', ['Change request', 'Approval', 'Proof'], '#documents', <FileText size={18} />, 'from-amber-500 to-orange-500'),
        workSection('Access Rules', 'Control roles, password recovery, provider links, and session behaviour.', ['Role', 'Password', 'Session'], '#controls', <KeyRound size={18} />, 'from-rose-500 to-pink-500'),
        workSection('Configuration Reports', 'Export account access, branding status, security checklist, and audit logs.', ['Access review', 'Brand status', 'Audit'], '#reports', <BarChart3 size={18} />, 'from-indigo-500 to-blue-500'),
      ],
    },
  };

  const config = configs[moduleSlug] ?? {
    eyebrow: `${moduleName} operations`,
    sections: [
      workSection('Record Entry', `Create a complete ${featureLower} record with owner, priority, and details.`, ['Title', 'Owner', 'Priority'], '#create-record', <Send size={18} />, sharedTone),
      workSection('Approval Workflow', `Move ${featureLower} records through draft, review, approved, and closed states.`, ['Draft', 'Review', 'Closed'], '#workflow-status', <ShieldCheck size={18} />, 'from-sky-500 to-cyan-500'),
      workSection('Live Register', `Review saved ${featureLower} records scoped to this institution.`, ['Saved records', 'Status', 'Owner'], '#live-records', <Database size={18} />, 'from-emerald-500 to-teal-500'),
      workSection('Documents', `Keep required files, evidence, and audit notes for ${featureLower}.`, ['Evidence', 'Proof', 'Audit'], '#documents', <FileText size={18} />, 'from-amber-500 to-orange-500'),
      workSection('Controls', `Manage rules, permissions, and ownership for ${featureLower}.`, ['Rules', 'Permissions', 'Owners'], '#controls', <KeyRound size={18} />, 'from-rose-500 to-pink-500'),
      workSection('Reports', `Export summaries, status history, and audit output for ${featureLower}.`, ['Summary', 'History', 'Export'], '#reports', <BarChart3 size={18} />, 'from-indigo-500 to-blue-500'),
    ],
  };

  return {
    ...config,
    title: `${featureName} real sections`,
    summary: `This ${sectionLower} option is split into practical ERP work areas with entry, approval, live records, evidence, controls, and reports.`,
  };
}

type FeatureContextKind = 'section' | 'item' | 'control' | 'output' | 'quick-action' | 'report' | 'workflow' | 'custom';

function compactUnique(items: string[], limit = 4) {
  return items
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item, index, list) => list.findIndex((entry) => entry.toLowerCase() === item.toLowerCase()) === index)
    .slice(0, limit);
}

function resolveFeatureContext(
  workspace: ReturnType<typeof getMainWorkspace>,
  featureSlug: string,
  featureTitle: string,
  sectionTitle?: string,
) {
  const sections = workspace?.sections ?? [];
  const sectionByTitle = sections.find((section) => section.title === sectionTitle);

  for (const section of sections) {
    if (slugifyWorkspace(section.title) === featureSlug) {
      return { kind: 'section' as FeatureContextKind, section, sourceLabel: section.title };
    }
    const item = section.items.find((entry) => slugifyWorkspace(entry) === featureSlug);
    if (item) return { kind: 'item' as FeatureContextKind, section, sourceLabel: item };

    const control = section.controls.find((entry) => slugifyWorkspace(entry) === featureSlug);
    if (control) return { kind: 'control' as FeatureContextKind, section, sourceLabel: control };

    if (slugifyWorkspace(section.output) === featureSlug) {
      return { kind: 'output' as FeatureContextKind, section, sourceLabel: section.output };
    }
  }

  const quickAction = workspace?.quickActions.find((entry) => slugifyWorkspace(entry) === featureSlug);
  if (quickAction) return { kind: 'quick-action' as FeatureContextKind, section: sectionByTitle ?? sections[0], sourceLabel: quickAction };

  const report = workspace?.reports.find((entry) => slugifyWorkspace(entry) === featureSlug);
  if (report) return { kind: 'report' as FeatureContextKind, section: sectionByTitle ?? sections[0], sourceLabel: report };

  const workflow = workspace?.workflow.find((entry) => slugifyWorkspace(entry.title) === featureSlug);
  if (workflow) return { kind: 'workflow' as FeatureContextKind, section: sectionByTitle ?? sections[0], sourceLabel: workflow.title };

  return { kind: 'custom' as FeatureContextKind, section: sectionByTitle ?? sections[0], sourceLabel: featureTitle };
}

function moduleLanguage(moduleSlug: string) {
  const fallback = {
    record: 'record',
    subject: 'subject',
    owner: 'owner',
    evidence: 'evidence',
    control: 'rules',
    report: 'report',
    action: 'operate',
  };

  const map: Record<string, typeof fallback> = {
    school: {
      record: 'school student record',
      subject: 'student, guardian, class, and section',
      owner: 'class teacher or school admin',
      evidence: 'admission form, guardian proof, attendance, marks, and fee notes',
      control: 'class capacity, guardian consent, attendance, exam, and fee rules',
      report: 'student, class, attendance, exam, and fee report',
      action: 'enroll and operate',
    },
    institutes: {
      record: 'institute learner record',
      subject: 'lead, learner, course batch, and trainer',
      owner: 'counsellor, trainer, or institute admin',
      evidence: 'enquiry note, demo booking, attendance, assessment, payment, and certificate proof',
      control: 'lead source, batch capacity, trainer workload, assessment, and payment rules',
      report: 'lead conversion, batch progress, trainer, revenue, and certificate report',
      action: 'convert and deliver',
    },
    internship: {
      record: 'placement file',
      subject: 'student and partner',
      owner: 'supervisor or mentor',
      evidence: 'offer letter, weekly log, and mentor review',
      control: 'eligibility, supervisor, and completion rules',
      report: 'placement and completion report',
      action: 'place and monitor',
    },
    training: {
      record: 'training batch record',
      subject: 'learner group',
      owner: 'trainer',
      evidence: 'session plan, attendance, and skill proof',
      control: 'capacity, trainer, and progress rules',
      report: 'batch progress report',
      action: 'plan and deliver',
    },
    programmes: {
      record: 'programme governance record',
      subject: 'department and curriculum',
      owner: 'academic coordinator',
      evidence: 'curriculum, credits, outcomes, and committee files',
      control: 'version, credit, and eligibility rules',
      report: 'catalogue and outcome report',
      action: 'approve and publish',
    },
    submissions: {
      record: 'submission file',
      subject: 'student or team',
      owner: 'evaluator',
      evidence: 'uploaded work, rubric, originality, and feedback',
      control: 'submission window, rubric, and release rules',
      report: 'submission status report',
      action: 'collect and evaluate',
    },
    certificates: {
      record: 'certificate request',
      subject: 'recipient',
      owner: 'issuing authority',
      evidence: 'eligibility proof, template, signature, and QR log',
      control: 'template, signature, QR, and reissue rules',
      report: 'issue and verification report',
      action: 'approve and issue',
    },
    transport: {
      record: 'route or trip record',
      subject: 'rider group and stop',
      owner: 'driver or transport coordinator',
      evidence: 'route sheet, driver log, vehicle file, and incident note',
      control: 'capacity, stop timing, duty, and safety rules',
      report: 'fleet and trip report',
      action: 'dispatch and track',
    },
    hostel: {
      record: 'resident care record',
      subject: 'resident and room',
      owner: 'warden',
      evidence: 'resident profile, leave pass, visitor proof, and care note',
      control: 'capacity, guardian, visitor, and warden rules',
      report: 'occupancy and care report',
      action: 'allocate and supervise',
    },
    library: {
      record: 'resource circulation record',
      subject: 'member and resource',
      owner: 'librarian',
      evidence: 'accession proof, issue slip, return proof, and overdue note',
      control: 'borrowing, due date, reservation, and fine rules',
      report: 'catalogue and circulation report',
      action: 'catalogue and circulate',
    },
    support: {
      record: 'support ticket',
      subject: 'requester and issue',
      owner: 'support owner',
      evidence: 'screenshot, internal note, escalation, and resolution proof',
      control: 'priority, SLA, owner, and response rules',
      report: 'SLA and service quality report',
      action: 'route and resolve',
    },
    community: {
      record: 'engagement record',
      subject: 'audience and group',
      owner: 'moderator',
      evidence: 'announcement copy, event plan, poll result, and moderation proof',
      control: 'audience, membership, post, and feedback rules',
      report: 'engagement and moderation report',
      action: 'publish and moderate',
    },
    settings: {
      record: 'configuration change',
      subject: 'system area',
      owner: 'institution admin',
      evidence: 'change request, preview proof, approval note, and audit log',
      control: 'role, security, preview, and rollback rules',
      report: 'configuration and security report',
      action: 'configure and audit',
    },
  };

  return map[moduleSlug] ?? fallback;
}

function getExactFeatureWorkConfig({
  moduleSlug,
  moduleName,
  featureSlug,
  featureName,
  workspace,
  sectionTitle,
  capabilities,
  controls,
  output,
  reports,
}: {
  moduleSlug: string;
  moduleName: string;
  featureSlug: string;
  featureName: string;
  workspace: ReturnType<typeof getMainWorkspace>;
  sectionTitle?: string;
  capabilities: string[];
  controls: string[];
  output: string;
  reports: string[];
}): FeatureWorkConfig {
  const base = getFeatureWorkConfig(moduleSlug, moduleName, featureName, sectionTitle);
  const context = resolveFeatureContext(workspace, featureSlug, featureName, sectionTitle);
  const language = moduleLanguage(moduleSlug);
  const section = context.section;
  const areaTitle = section?.title ?? sectionTitle ?? moduleName;
  const areaSummary = section?.summary ?? `Operational page for ${featureName.toLowerCase()}.`;
  const areaItems = section?.items ?? capabilities;
  const areaControls = section?.controls ?? controls;
  const areaReports = workspace?.reports ?? reports;
  const relatedInputs = compactUnique([featureName, language.subject, ...areaItems, ...capabilities], 4);
  const relatedControls = compactUnique([featureName, ...areaControls, ...controls], 4);
  const relatedReports = compactUnique([featureName, output, ...areaReports, ...reports], 4);
  const evidenceItems =
    moduleSlug === 'community'
      ? compactUnique(['Announcement copy', 'Event plan', 'Poll results', 'Moderation proof', output], 4)
      : compactUnique([language.evidence, output], 3);
  const sourceEvidenceItems =
    moduleSlug === 'community'
      ? compactUnique(['Announcement copy', 'Event plan', 'Poll results', 'Moderation proof', ...areaItems], 4)
      : compactUnique([language.evidence, ...areaItems], 4);
  const kindLabel = {
    section: 'Section command page',
    item: 'Work page',
    control: 'Control page',
    output: 'Output page',
    'quick-action': 'Action page',
    report: 'Report page',
    workflow: 'Workflow page',
    custom: 'Operation page',
  }[context.kind];

  if (moduleSlug === 'school') {
    const schoolContext = `${areaTitle} ${featureName}`.toLowerCase();
    const isAdmissions = /(admission|sis|enquiry|application|document)/.test(schoolContext);

    if (/(parent|guardian|consent|meeting|message|notice)/.test(schoolContext) && !isAdmissions) {
      return {
        eyebrow: 'School / Parent command page',
        title: `${featureName} family engagement page`,
        summary: `${featureName} is handled as a parent and guardian workflow with contact access, message history, meetings, consent, student updates, and follow-up records.`,
        sections: [
          workSection('Parent Dashboard Setup', 'Connect guardian profiles, linked students, contact preferences, access permissions, and role visibility.', ['Guardian profile', 'Student link', 'Access'], '#create-record', <Users size={18} />, 'from-fuchsia-500 to-violet-600'),
          workSection('Communication Timeline', 'Send notices, homework updates, fee reminders, attendance alerts, and track acknowledgements.', ['Notice', 'Reminder', 'Reply'], '#workflow-status', <MessageSquare size={18} />, 'from-sky-500 to-cyan-500'),
          workSection('Meeting and Consent Desk', 'Schedule meetings, collect consent, attach proof, record minutes, and manage escalation.', ['Meeting slots', 'Consent proof', 'Minutes'], '#documents', <CalendarDays size={18} />, 'from-amber-500 to-orange-500'),
          workSection('Student Update Register', 'Review attendance, behaviour, homework, fee notices, results, and parent follow-up.', ['Attendance', 'Homework', 'Results'], '#live-records', <ClipboardList size={18} />, 'from-emerald-500 to-teal-500'),
          workSection('Guardian Rules', 'Control parent access, message templates, notification rules, meeting slots, and consent approval.', ['Access rule', 'Templates', 'Notification'], '#controls', <ShieldCheck size={18} />, 'from-rose-500 to-pink-500'),
          workSection('Family Communication Reports', 'Export acknowledgement logs, meeting history, consent records, and parent response summaries.', ['Response report', 'Consent log', 'Meetings'], '#reports', <BarChart3 size={18} />, 'from-indigo-500 to-blue-500'),
        ],
      };
    }

    if (/(fee|payment|receipt|invoice|balance|concession)/.test(schoolContext)) {
      return {
        eyebrow: 'School / Fees command page',
        title: `${featureName} finance page`,
        summary: `${featureName} is handled as a school fee workflow with invoice creation, collection, receipts, concessions, balances, reminders, and reports.`,
        sections: [
          workSection('Invoice Builder', 'Create fee categories, terms, due dates, student account links, discounts, and invoice status.', ['Fee category', 'Term', 'Invoice'], '#create-record', <Database size={18} />, 'from-emerald-500 to-teal-500'),
          workSection('Payment Collection Desk', 'Capture cash, bank, gateway, receipt number, payer confirmation, and cashier owner.', ['Payment', 'Receipt', 'Payer'], '#workflow-status', <CheckCircle2 size={18} />, 'from-sky-500 to-cyan-500'),
          workSection('Concession Approval', 'Route scholarships, sibling discounts, waivers, refunds, policy evidence, and approver notes.', ['Scholarship', 'Discount', 'Waiver'], '#documents', <ShieldCheck size={18} />, 'from-violet-600 to-fuchsia-500'),
          workSection('Balance Monitor', 'Track due, part-paid, overdue, service blocks, parent reminders, and statement generation.', ['Due', 'Overdue', 'Reminder'], '#live-records', <BarChart3 size={18} />, 'from-amber-500 to-orange-500'),
          workSection('Fee Controls', 'Lock receipts, manage payment approval, concession rules, late fee settings, and statement access.', ['Receipt lock', 'Approval', 'Late fee'], '#controls', <KeyRound size={18} />, 'from-rose-500 to-pink-500'),
          workSection('Collection Reports', 'Export collection summary, outstanding balances, concessions, receipt ledger, and parent notice reports.', ['Collection', 'Outstanding', 'Ledger'], '#reports', <BarChart3 size={18} />, 'from-indigo-500 to-blue-500'),
        ],
      };
    }

    if (/(academic|class|section|teacher|timetable|curriculum|homework)/.test(schoolContext)) {
      return {
        eyebrow: 'School / Academic command page',
        title: `${featureName} academic page`,
        summary: `${featureName} is handled as a school academic workflow with class structure, section allocation, teacher workload, timetable, curriculum coverage, and homework tracking.`,
        sections: [
          workSection('Class Structure Board', 'Create classes, sections, rooms, roll ranges, capacity, house groups, and academic year mapping.', ['Class', 'Section', 'Capacity'], '#create-record', <GraduationCap size={18} />, 'from-violet-600 to-fuchsia-500'),
          workSection('Teacher Allocation Matrix', 'Assign class teachers, subject teachers, substitutes, room ownership, and workload balance.', ['Teacher', 'Subject', 'Workload'], '#workflow-status', <Users size={18} />, 'from-sky-500 to-cyan-500'),
          workSection('Timetable Planner', 'Build periods, labs, rooms, substitutions, conflicts, timetable locks, and published views.', ['Periods', 'Rooms', 'Publish'], '#documents', <CalendarDays size={18} />, 'from-emerald-500 to-teal-500'),
          workSection('Curriculum and Homework Desk', 'Track syllabus coverage, lesson plans, homework, resources, parent notices, and completion.', ['Syllabus', 'Homework', 'Completion'], '#live-records', <BookOpen size={18} />, 'from-amber-500 to-orange-500'),
          workSection('Academic Rules', 'Control class capacity, teacher workload, timetable locks, homework visibility, and curriculum mapping.', ['Capacity', 'Workload', 'Visibility'], '#controls', <ShieldCheck size={18} />, 'from-rose-500 to-pink-500'),
          workSection('Academic Reports', 'Export class strength, timetable load, homework completion, syllabus coverage, and section reports.', ['Strength', 'Load', 'Coverage'], '#reports', <BarChart3 size={18} />, 'from-indigo-500 to-blue-500'),
        ],
      };
    }
  }

  const templates: Record<FeatureContextKind, FeatureWorkSection[]> = {
    section: [
      workSection(`${areaTitle} Command Desk`, `${areaSummary} Use this page to control the whole ${areaTitle.toLowerCase()} area.`, compactUnique(areaItems, 3), '#create-record', <ClipboardList size={18} />, 'from-violet-600 to-fuchsia-500'),
      workSection(`${areaTitle} Operating Lanes`, `Move ${language.record} work through intake, ownership, approval, and closure.`, ['Intake', 'Ownership', 'Closure'], '#workflow-status', <ShieldCheck size={18} />, 'from-sky-500 to-cyan-500'),
      workSection(`${areaTitle} Live Register`, `Review saved ${language.record} items for this institution only.`, ['Saved records', 'Owner', 'Status'], '#live-records', <Database size={18} />, 'from-emerald-500 to-teal-500'),
      workSection(`${areaTitle} Evidence Room`, `Store ${language.evidence} for this section.`, evidenceItems, '#documents', <FileText size={18} />, 'from-amber-500 to-orange-500'),
      workSection(`${areaTitle} Rule Control`, `Manage ${language.control} for this section.`, compactUnique(areaControls, 3), '#controls', <KeyRound size={18} />, 'from-rose-500 to-pink-500'),
      workSection(`${areaTitle} Management View`, `Export ${language.report} from the section records.`, compactUnique(areaReports, 3), '#reports', <BarChart3 size={18} />, 'from-indigo-500 to-blue-500'),
    ],
    item: [
      workSection(`Capture ${featureName}`, `Create a real ${featureName.toLowerCase()} ${language.record} with ${language.subject}, ${language.owner}, dates, and notes.`, relatedInputs, '#create-record', <Send size={18} />, 'from-violet-600 to-fuchsia-500'),
      workSection(`${featureName} Review Flow`, `Validate ${featureName.toLowerCase()} inside ${areaTitle} before approval or release.`, ['Draft', 'Review', 'Approval'], '#workflow-status', <ClipboardList size={18} />, 'from-sky-500 to-cyan-500'),
      workSection(`${featureName} Register`, `Every saved ${featureName.toLowerCase()} appears here with priority, owner, and status.`, ['Live record', 'Priority', 'Status'], '#live-records', <Database size={18} />, 'from-emerald-500 to-teal-500'),
      workSection(`${featureName} Evidence`, `Attach or describe ${language.evidence} for this exact option.`, evidenceItems, '#documents', <FileText size={18} />, 'from-amber-500 to-orange-500'),
      workSection(`${featureName} Rules`, `Apply ${language.control} only to this option.`, relatedControls, '#controls', <ShieldCheck size={18} />, 'from-rose-500 to-pink-500'),
      workSection(`${featureName} Reports`, `Review ${featureName.toLowerCase()} progress, exceptions, and export output.`, relatedReports, '#reports', <BarChart3 size={18} />, 'from-indigo-500 to-blue-500'),
    ],
    control: [
      workSection(`Configure ${featureName}`, `Set the exact ${featureName.toLowerCase()} rule for ${areaTitle}.`, relatedControls, '#controls', <KeyRound size={18} />, 'from-rose-500 to-pink-500'),
      workSection(`${featureName} Test Path`, `Check how this rule affects draft, review, approved, and closed records.`, ['Draft test', 'Approval test', 'Exception test'], '#workflow-status', <ShieldCheck size={18} />, 'from-violet-600 to-fuchsia-500'),
      workSection(`Affected ${language.record} Items`, `View records controlled by ${featureName.toLowerCase()} in this institution.`, ['Affected records', 'Owner', 'Status'], '#live-records', <Database size={18} />, 'from-emerald-500 to-teal-500'),
      workSection(`${featureName} Policy Proof`, `Keep evidence for why this control exists and who approved it.`, ['Policy note', 'Approval proof', 'Audit log'], '#documents', <FileText size={18} />, 'from-amber-500 to-orange-500'),
      workSection(`${featureName} Exceptions`, `Manage override notes, access limits, and escalation handling.`, ['Override', 'Access limit', 'Escalation'], '#create-record', <ClipboardList size={18} />, 'from-sky-500 to-cyan-500'),
      workSection(`${featureName} Audit`, `Export control history, affected records, and exception reports.`, compactUnique([`${featureName} audit`, ...relatedReports], 4), '#reports', <BarChart3 size={18} />, 'from-indigo-500 to-blue-500'),
    ],
    output: [
      workSection(`${featureName} Output File`, `Prepare the final ${featureName.toLowerCase()} with source records and review notes.`, compactUnique([output, ...areaItems], 4), '#documents', <FileText size={18} />, 'from-amber-500 to-orange-500'),
      workSection(`${featureName} Release Flow`, `Generate, review, approve, and close this output safely.`, ['Generate', 'Review', 'Release'], '#workflow-status', <ShieldCheck size={18} />, 'from-violet-600 to-fuchsia-500'),
      workSection(`${featureName} Register`, `Track saved output records and their delivery status.`, ['Output record', 'Delivery', 'Status'], '#live-records', <Database size={18} />, 'from-emerald-500 to-teal-500'),
      workSection(`${featureName} Source Evidence`, `Link ${language.evidence} behind this output.`, sourceEvidenceItems, '#create-record', <ClipboardList size={18} />, 'from-sky-500 to-cyan-500'),
      workSection(`${featureName} Release Rules`, `Control who can generate, view, edit, or export this output.`, compactUnique(['Generate access', 'View access', ...areaControls], 4), '#controls', <KeyRound size={18} />, 'from-rose-500 to-pink-500'),
      workSection(`${featureName} Archive Report`, `Export delivery, verification, and archive history.`, relatedReports, '#reports', <BarChart3 size={18} />, 'from-indigo-500 to-blue-500'),
    ],
    'quick-action': [
      workSection(`Run ${featureName}`, `Start this action with the needed ${language.subject}, ${language.owner}, priority, and notes.`, relatedInputs, '#create-record', <Send size={18} />, 'from-violet-600 to-fuchsia-500'),
      workSection(`${featureName} Required Checks`, `Complete the required checks before the action is approved.`, compactUnique([language.control, ...areaControls], 4), '#workflow-status', <ShieldCheck size={18} />, 'from-sky-500 to-cyan-500'),
      workSection(`${featureName} Action Queue`, `Track action records after they are saved.`, ['Action record', 'Owner', 'Priority'], '#live-records', <Database size={18} />, 'from-emerald-500 to-teal-500'),
      workSection(`${featureName} Attachments`, `Keep action proof, notes, and output evidence.`, evidenceItems, '#documents', <FileText size={18} />, 'from-amber-500 to-orange-500'),
      workSection(`${featureName} Safety Rules`, `Apply access, approval, and exception rules for this action.`, relatedControls, '#controls', <KeyRound size={18} />, 'from-rose-500 to-pink-500'),
      workSection(`${featureName} Follow-up`, `Export action history and related management reports.`, relatedReports, '#reports', <BarChart3 size={18} />, 'from-indigo-500 to-blue-500'),
    ],
    report: [
      workSection(`Build ${featureName}`, `Use saved ${language.record} records to prepare the ${featureName.toLowerCase()}.`, compactUnique([featureName, ...areaReports], 4), '#reports', <BarChart3 size={18} />, 'from-indigo-500 to-blue-500'),
      workSection(`${featureName} Filters`, `Filter by status, owner, priority, due date, and section.`, ['Status', 'Owner', 'Date range'], '#workflow-status', <ClipboardList size={18} />, 'from-violet-600 to-fuchsia-500'),
      workSection(`${featureName} Source Records`, `The report reads from saved records in this option.`, ['Live records', 'Status', 'Owner'], '#live-records', <Database size={18} />, 'from-emerald-500 to-teal-500'),
      workSection(`${featureName} Evidence Pack`, `Attach source proof behind exported report results.`, evidenceItems, '#documents', <FileText size={18} />, 'from-amber-500 to-orange-500'),
      workSection(`${featureName} Export Rules`, `Control who can print, download, and share this report.`, compactUnique(['Download access', 'Print access', ...areaControls], 4), '#controls', <KeyRound size={18} />, 'from-rose-500 to-pink-500'),
      workSection(`${featureName} Management Pack`, `Prepare summary, exception, trend, and audit output.`, ['Summary', 'Exceptions', 'Audit'], '#create-record', <Send size={18} />, 'from-sky-500 to-cyan-500'),
    ],
    workflow: [
      workSection(`${featureName} Stage Queue`, `Work on records currently moving through the ${featureName.toLowerCase()} stage.`, ['Stage queue', 'Owner', 'Status'], '#live-records', <Database size={18} />, 'from-emerald-500 to-teal-500'),
      workSection(`${featureName} Stage Rules`, `Define entry conditions, approval needs, and closure checks.`, compactUnique([language.control, ...areaControls], 4), '#controls', <ShieldCheck size={18} />, 'from-violet-600 to-fuchsia-500'),
      workSection(`${featureName} Stage Entry`, `Create a record that needs this workflow stage.`, relatedInputs, '#create-record', <Send size={18} />, 'from-sky-500 to-cyan-500'),
      workSection(`${featureName} Stage Evidence`, `Store proof and notes required before the stage can move forward.`, evidenceItems, '#documents', <FileText size={18} />, 'from-amber-500 to-orange-500'),
      workSection(`${featureName} Stage Monitor`, `Watch draft, review, approved, and closed counts.`, ['Draft', 'Review', 'Approved'], '#workflow-status', <ClipboardList size={18} />, 'from-rose-500 to-pink-500'),
      workSection(`${featureName} Stage Reports`, `Export stage performance, pending work, and audit trail.`, relatedReports, '#reports', <BarChart3 size={18} />, 'from-indigo-500 to-blue-500'),
    ],
    custom: [
      workSection(`${featureName} Workspace`, `Manage ${featureName.toLowerCase()} as a full ${moduleName.toLowerCase()} operation.`, relatedInputs, '#create-record', <ClipboardList size={18} />, 'from-violet-600 to-fuchsia-500'),
      workSection(`${featureName} Flow`, `Track the operational flow for this page.`, ['Draft', 'Review', 'Approved'], '#workflow-status', <ShieldCheck size={18} />, 'from-sky-500 to-cyan-500'),
      workSection(`${featureName} Records`, `View saved records for this exact page.`, ['Saved records', 'Owner', 'Status'], '#live-records', <Database size={18} />, 'from-emerald-500 to-teal-500'),
      workSection(`${featureName} Evidence`, `Keep proof and documents for this page.`, evidenceItems, '#documents', <FileText size={18} />, 'from-amber-500 to-orange-500'),
      workSection(`${featureName} Controls`, `Apply permissions and rules for this page.`, relatedControls, '#controls', <KeyRound size={18} />, 'from-rose-500 to-pink-500'),
      workSection(`${featureName} Reports`, `Export audit and summary outputs for this page.`, relatedReports, '#reports', <BarChart3 size={18} />, 'from-indigo-500 to-blue-500'),
    ],
  };

  return {
    eyebrow: `${moduleName} / ${kindLabel}`,
    title: `${featureName} operation page`,
    summary: `${featureName} is handled as a ${context.kind.replace('-', ' ')} inside ${areaTitle}. This page is built around its own ${language.record}, ${language.evidence}, ${language.control}, and ${language.report}.`,
    sections: templates[context.kind] ?? base.sections,
  };
}

type HelpFeatureSection = {
  title: string;
  summary: string;
  items: string[];
  action?: string;
  href?: string;
};

type HelpFeatureConfig = {
  title: string;
  eyebrow: string;
  summary: string;
  primaryAction: string;
  primaryHref: string;
  sections: HelpFeatureSection[];
  workflow: { title: string; detail: string }[];
  faq: string[];
  related: string[];
};

const helpFeaturePages: Record<string, HelpFeatureConfig> = {
  'getting-started': {
    title: 'Getting Started',
    eyebrow: 'First setup guide',
    summary: 'A clean starting path for new admins, staff, and learners to understand the ERP workspace without confusion.',
    primaryAction: 'Open Dashboard',
    primaryHref: '/dashboard',
    sections: [
      { title: 'Account Access', summary: 'Start with a working email and password account before using system modules.', items: ['Create an account from signup', 'Use the same email every time', 'Reset password from the login page', 'Keep recovery email updated'], action: 'Create account', href: '/signup' },
      { title: 'Dashboard Basics', summary: 'Use the dashboard as the main control room for activity, totals, and quick movement.', items: ['Read KPI cards first', 'Use search for records', 'Open sidebar sections', 'Check recent activity before actions'], action: 'Go to dashboard', href: '/dashboard' },
      { title: 'Navigation', summary: 'Move through the ERP using the side menu, top search, and related section links.', items: ['Use sidebar for main modules', 'Use top search for records and guides', 'Use related pages inside each section', 'Return home from breadcrumbs'] },
      { title: 'Daily Routine', summary: 'A simple operating rhythm for managing records without missing work.', items: ['Check pending work', 'Update records', 'Review submissions', 'Download required documents'] },
    ],
    workflow: [
      { title: 'Sign in', detail: 'Use email and password or approved Google login for an account that already exists.' },
      { title: 'Open workspace', detail: 'Start from the dashboard and choose the needed section from the sidebar.' },
      { title: 'Search first', detail: 'Use search to find existing records or help guides before creating anything new.' },
      { title: 'Save changes', detail: 'Update the correct section and confirm the result appears in the workspace.' },
    ],
    faq: ['How do I create my first account?', 'Where is the dashboard?', 'How do I move between ERP sections?', 'What should I check after login?'],
    related: ['Account & Settings', 'FAQ Library', 'Video Guides', 'Contact Support'],
  },
  internships: {
    title: 'Internships',
    eyebrow: 'Internship help',
    summary: 'Guidance for internship applications, approvals, task progress, mentor review, completion, and certificate release.',
    primaryAction: 'Open Internship',
    primaryHref: '/internship',
    sections: [
      { title: 'Applications', summary: 'Track internship requests from student submission to department approval.', items: ['Student details', 'Programme or batch', 'Company or placement type', 'Approval owner'], action: 'Open internship', href: '/internship' },
      { title: 'Approvals', summary: 'Make approval status clear for students, coordinators, and mentors.', items: ['Eligibility check', 'Coordinator review', 'Mentor assignment', 'Final approval note'] },
      { title: 'Tasks & Logs', summary: 'Organize weekly work, submissions, review comments, and completion evidence.', items: ['Weekly tasks', 'Progress log', 'Submitted files', 'Review feedback'], action: 'Open submissions', href: '/submissions' },
      { title: 'Completion', summary: 'Prepare final evidence before releasing internship completion certificates.', items: ['Final report', 'Mentor evaluation', 'Attendance evidence', 'Certificate eligibility'], action: 'Open certificates', href: '/certificates' },
    ],
    workflow: [
      { title: 'Apply', detail: 'Create the internship request with student, programme, and placement details.' },
      { title: 'Review', detail: 'Coordinator checks eligibility, missing documents, and mentor requirements.' },
      { title: 'Monitor', detail: 'Student submits tasks or logs while mentors add review notes.' },
      { title: 'Complete', detail: 'Final approval unlocks completion status and certificate processing.' },
    ],
    faq: ['How do I check internship approval?', 'Where do students upload internship tasks?', 'How do mentors add feedback?', 'When is the certificate released?'],
    related: ['Training', 'Submissions', 'Certificates', 'Contact Support'],
  },
  training: {
    title: 'Training',
    eyebrow: 'Training programme help',
    summary: 'A practical guide for batches, sessions, learners, attendance, materials, assessments, and progress tracking.',
    primaryAction: 'Open Training',
    primaryHref: '/training',
    sections: [
      { title: 'Batches', summary: 'Create and manage learner groups with clear trainer ownership.', items: ['Batch name', 'Trainer', 'Capacity', 'Schedule'] },
      { title: 'Sessions', summary: 'Keep each training session organized with material and attendance rules.', items: ['Session plan', 'Learning outcome', 'Resource links', 'Attendance mark'] },
      { title: 'Assessments', summary: 'Track skill checks, submissions, evaluation, and feedback.', items: ['Task brief', 'Rubric', 'Submission window', 'Evaluator comment'], action: 'Open submissions', href: '/submissions' },
      { title: 'Progress', summary: 'Show learner progress clearly for trainers and administrators.', items: ['Completion percent', 'Attendance health', 'Pending tasks', 'Certificate readiness'] },
    ],
    workflow: [
      { title: 'Plan', detail: 'Create the batch, trainer, schedule, and learning outcomes.' },
      { title: 'Deliver', detail: 'Run sessions, share material, and mark attendance.' },
      { title: 'Evaluate', detail: 'Collect submissions and add review feedback.' },
      { title: 'Close', detail: 'Confirm progress and move qualified learners to certification.' },
    ],
    faq: ['How do I create a training batch?', 'How do I mark training attendance?', 'Where are training submissions reviewed?', 'How is progress calculated?'],
    related: ['Internships', 'Submissions', 'Certificates', 'Video Guides'],
  },
  'payments-and-billing': {
    title: 'Payments & Billing',
    eyebrow: 'Fees and payment help',
    summary: 'Support for invoices, payments, receipts, failed transactions, pending fees, and billing checks.',
    primaryAction: 'Open Payments',
    primaryHref: '/fees',
    sections: [
      { title: 'Invoices', summary: 'Use invoices to identify what is due, who must pay, and the current status.', items: ['Student or account name', 'Invoice number', 'Amount due', 'Due date'] },
      { title: 'Payment Status', summary: 'Check whether a payment is pending, successful, failed, or needs review.', items: ['Transaction ID', 'Gateway status', 'Receipt status', 'Updated balance'] },
      { title: 'Failed Payments', summary: 'When payment fails, collect the right details before reporting.', items: ['Payment time', 'Amount', 'Account email', 'Transaction reference'], action: 'Open failed payment guide', href: '/modules/help-centre/payment-failed' },
      { title: 'Receipts', summary: 'Confirm successful payments have generated receipts correctly.', items: ['Receipt number', 'Paid date', 'Paid amount', 'Download option'] },
    ],
    workflow: [
      { title: 'Find invoice', detail: 'Search by student, account, invoice number, or payment reference.' },
      { title: 'Check status', detail: 'Review pending, paid, failed, or partially paid status before retrying.' },
      { title: 'Verify receipt', detail: 'Confirm the receipt exists and matches the paid amount.' },
      { title: 'Escalate', detail: 'If money was deducted but status failed, send support the transaction details.' },
    ],
    faq: ['What should I do if payment fails?', 'Where do I find receipts?', 'How do I check pending fees?', 'What details are needed for support?'],
    related: ['Payment Failed', 'FAQ Library', 'Contact Support', 'Account & Settings'],
  },
  certificates: {
    title: 'Certificates',
    eyebrow: 'Certificate help',
    summary: 'Guide for certificate eligibility, generation, verification, release, download, and reissue handling.',
    primaryAction: 'Open Certificates',
    primaryHref: '/certificates',
    sections: [
      { title: 'Eligibility', summary: 'Confirm the student or learner has completed required work.', items: ['Programme completion', 'Attendance rule', 'Payment clearance', 'Approval status'] },
      { title: 'Generation', summary: 'Prepare the certificate record with the correct template and details.', items: ['Template', 'Recipient name', 'Completion date', 'Authorized signatory'] },
      { title: 'Verification', summary: 'Make certificates traceable for external checking.', items: ['Certificate ID', 'QR code', 'Issued date', 'Verification status'] },
      { title: 'Download & Reissue', summary: 'Support download issues and controlled reissue requests.', items: ['Download status', 'Correction reason', 'Reissue approval', 'Old copy archive'] },
    ],
    workflow: [
      { title: 'Check completion', detail: 'Confirm the student has met all academic or training requirements.' },
      { title: 'Approve release', detail: 'Admin or authorized owner approves certificate generation.' },
      { title: 'Generate', detail: 'System prepares the certificate with verification details.' },
      { title: 'Download', detail: 'Recipient downloads or verifies the released certificate.' },
    ],
    faq: ['Why is my certificate not visible?', 'How do I verify a certificate?', 'Can a certificate be reissued?', 'Where is the download option?'],
    related: ['Training', 'Internships', 'Payments & Billing', 'Contact Support'],
  },
  'account-and-settings': {
    title: 'Account & Settings',
    eyebrow: 'Access and profile help',
    summary: 'Help for passwords, Google login, account creation, profile changes, institution settings, and security checks.',
    primaryAction: 'Open Settings',
    primaryHref: '/settings',
    sections: [
      { title: 'Password Access', summary: 'Recover accounts and update passwords without changing institution data.', items: ['Forgot password', 'Reset link or code', 'New password', 'Login confirmation'], action: 'Reset password', href: '/forgot-password' },
      { title: 'Google Login', summary: 'Use Google only for emails that already belong to created system accounts.', items: ['Created account required', 'Same Gmail address', 'Allowed OAuth redirect', 'Fallback email login'], action: 'Open Google login guide', href: '/modules/help-centre/google-login-troubleshooting' },
      { title: 'Profile Details', summary: 'Keep user and institution profile data correct.', items: ['Name', 'Email', 'Institution type', 'Brand settings'], action: 'Open settings', href: '/settings' },
      { title: 'Security', summary: 'Protect access with clear ownership and safe account practices.', items: ['Admin role', 'Session check', 'Account recovery', 'Access review'] },
    ],
    workflow: [
      { title: 'Identify account', detail: 'Confirm the email is already created in the ERP system.' },
      { title: 'Choose login method', detail: 'Use email/password or approved Google login for the same account.' },
      { title: 'Recover if needed', detail: 'Use forgot password when normal login fails.' },
      { title: 'Update settings', detail: 'Save profile or institution settings from the settings page.' },
    ],
    faq: ['Can any Google account log in?', 'How do I reset my password?', 'Where do I change profile details?', 'Why is Google login blocked?'],
    related: ['Google Login Troubleshooting', 'Getting Started', 'FAQ Library', 'Contact Support'],
  },
  'faq-library': {
    title: 'FAQ Library',
    eyebrow: 'Frequently asked questions',
    summary: 'A structured FAQ space for common ERP questions across access, payments, certificates, submissions, and support.',
    primaryAction: 'Search Guides',
    primaryHref: '/search?q=reset%20password',
    sections: [
      { title: 'Account FAQs', summary: 'Answers for login, password reset, account creation, and Google sign-in.', items: ['Forgot password', 'Create account', 'Google access', 'Profile changes'] },
      { title: 'Student & Training FAQs', summary: 'Answers for student records, internships, training batches, and submissions.', items: ['Student profile', 'Batch progress', 'Internship approval', 'Task upload'] },
      { title: 'Finance FAQs', summary: 'Answers for invoices, receipts, failed payments, and pending fees.', items: ['Payment failed', 'Receipt missing', 'Pending fees', 'Transaction ID'] },
      { title: 'Certificate FAQs', summary: 'Answers for certificate generation, release, verification, and reissue.', items: ['Download certificate', 'Verify certificate', 'Reissue request', 'Eligibility'] },
    ],
    workflow: [
      { title: 'Search question', detail: 'Type the problem in the search bar using simple words.' },
      { title: 'Open matching guide', detail: 'Choose the closest guide card from the result list.' },
      { title: 'Follow steps', detail: 'Complete the steps shown in the guide.' },
      { title: 'Contact support', detail: 'If the FAQ does not solve it, send a support request.' },
    ],
    faq: ['How do I find the right FAQ?', 'What if no FAQ matches?', 'Are FAQs the same as published articles?', 'Can I contact support from here?'],
    related: ['Getting Started', 'Payments & Billing', 'Certificates', 'Contact Support'],
  },
  'video-guides': {
    title: 'Video Guides',
    eyebrow: 'Visual walkthroughs',
    summary: 'A planned space for short walkthroughs that explain major ERP actions clearly for users.',
    primaryAction: 'Search Guides',
    primaryHref: '/search?q=video%20guides',
    sections: [
      { title: 'Login & Account', summary: 'Walkthrough topics for account creation, login, and password recovery.', items: ['Create account', 'Normal login', 'Google login', 'Forgot password'] },
      { title: 'Dashboard Use', summary: 'Walkthrough topics for reading KPIs, using search, and opening modules.', items: ['Dashboard overview', 'Top search', 'Sidebar navigation', 'Quick activity'] },
      { title: 'Academic Workflows', summary: 'Walkthrough topics for internships, training, submissions, and certificates.', items: ['Internship approval', 'Training batch', 'Task submission', 'Certificate download'] },
      { title: 'Support Flow', summary: 'Walkthrough topics for finding guides and reporting an issue.', items: ['Help search', 'FAQ library', 'Report issue', 'Contact support'] },
    ],
    workflow: [
      { title: 'Choose topic', detail: 'Pick the workflow you want to understand.' },
      { title: 'Watch steps', detail: 'Follow the short guided sequence for that feature.' },
      { title: 'Try in system', detail: 'Open the matching ERP page and complete the action.' },
      { title: 'Ask support', detail: 'Contact support if the walkthrough does not match your issue.' },
    ],
    faq: ['Are videos published now?', 'Where will login videos appear?', 'Can I request a video guide?', 'Do video guides replace support?'],
    related: ['Getting Started', 'FAQ Library', 'Report an Issue', 'Contact Support'],
  },
  'report-an-issue': {
    title: 'Report an Issue',
    eyebrow: 'Support request help',
    summary: 'Use this guide to prepare a clear support request with the right evidence and issue details.',
    primaryAction: 'Open Support',
    primaryHref: '/support',
    sections: [
      { title: 'Issue Type', summary: 'Choose the closest category so support can route it correctly.', items: ['Login problem', 'Payment problem', 'Certificate problem', 'Page or data issue'] },
      { title: 'Evidence', summary: 'Attach details that make the issue easy to understand.', items: ['Screenshot', 'Email used', 'Page link', 'Error message'] },
      { title: 'Priority', summary: 'Set priority based on real urgency and impact.', items: ['Low', 'Normal', 'High', 'Urgent'] },
      { title: 'Follow-up', summary: 'Track the response and add more details if support asks.', items: ['Ticket status', 'Support reply', 'Resolution note', 'Closure confirmation'] },
    ],
    workflow: [
      { title: 'Capture issue', detail: 'Write what happened, where it happened, and who is affected.' },
      { title: 'Add proof', detail: 'Include screenshots, links, account email, and exact error text.' },
      { title: 'Submit request', detail: 'Send the request through the support page.' },
      { title: 'Track response', detail: 'Follow support updates until the issue is solved.' },
    ],
    faq: ['What details should I include?', 'When should I mark urgent?', 'Where do I add screenshots?', 'How do I track a support request?'],
    related: ['FAQ Library', 'Google Login Troubleshooting', 'Payment Failed', 'Contact Support'],
  },
  'all-categories': {
    title: 'All Categories',
    eyebrow: 'Help category index',
    summary: 'Every Help Centre category in one place, with correct next pages for each support area.',
    primaryAction: 'Back to Help Centre',
    primaryHref: '/help-centre',
    sections: [
      { title: 'Getting Started', summary: 'First login, dashboard, navigation, and daily routine.', items: ['Account access', 'Dashboard basics', 'Navigation', 'Daily routine'], href: '/modules/help-centre/getting-started' },
      { title: 'Internships', summary: 'Applications, approvals, mentor review, and completion.', items: ['Applications', 'Approvals', 'Tasks', 'Completion'], href: '/modules/help-centre/internships' },
      { title: 'Training', summary: 'Batches, sessions, assessments, and learner progress.', items: ['Batches', 'Sessions', 'Assessments', 'Progress'], href: '/modules/help-centre/training' },
      { title: 'Payments & Billing', summary: 'Invoices, failed payments, receipts, and billing checks.', items: ['Invoices', 'Payment status', 'Failed payments', 'Receipts'], href: '/modules/help-centre/payments-and-billing' },
      { title: 'Certificates', summary: 'Eligibility, generation, verification, download, and reissue.', items: ['Eligibility', 'Generation', 'Verification', 'Download'], href: '/modules/help-centre/certificates' },
      { title: 'Account & Settings', summary: 'Passwords, Google login, profile, and institution settings.', items: ['Password', 'Google login', 'Profile', 'Security'], href: '/modules/help-centre/account-and-settings' },
    ],
    workflow: [
      { title: 'Choose category', detail: 'Pick the Help Centre area closest to the issue.' },
      { title: 'Open guide', detail: 'Use the category page to see steps and related sections.' },
      { title: 'Search if unsure', detail: 'Use search terms like reset password, payment failed, or certificate download.' },
      { title: 'Contact support', detail: 'Escalate if the guide does not solve the problem.' },
    ],
    faq: ['Why are articles zero?', 'Which category should I open first?', 'Can I search instead?', 'Where is support?'],
    related: ['Getting Started', 'FAQ Library', 'Video Guides', 'Contact Support'],
  },
  'all-articles': {
    title: 'All Articles',
    eyebrow: 'Published article library',
    summary: 'No published article records exist yet. Search guides are available until real articles are added.',
    primaryAction: 'Search Guides',
    primaryHref: '/search?q=reset%20password',
    sections: [
      { title: 'Published Articles', summary: 'This section will show real published articles only after they are created.', items: ['Current published articles: 0', 'No fake article rows', 'Search guides remain available', 'Support can still be contacted'] },
      { title: 'Create Real Content Later', summary: 'When article management is added, counts and lists can come from saved article records.', items: ['Article title', 'Category', 'Review status', 'Published date'] },
    ],
    workflow: [
      { title: 'Search guide', detail: 'Use the Help Centre search for current support topics.' },
      { title: 'Open category', detail: 'Browse category pages for structured guidance.' },
      { title: 'Contact support', detail: 'Use support if the current guides are not enough.' },
      { title: 'Publish later', detail: 'Real articles can appear here once saved in the system.' },
    ],
    faq: ['Why are there no articles?', 'Are guide cards fake articles?', 'How can I get help now?', 'Will articles appear later?'],
    related: ['Getting Started', 'FAQ Library', 'Report an Issue', 'Contact Support'],
  },
  'google-login-troubleshooting': {
    title: 'Google Login Troubleshooting',
    eyebrow: 'Google access guide',
    summary: 'A focused guide for Google sign-in problems, blocked access, missing accounts, and callback issues.',
    primaryAction: 'Open Login',
    primaryHref: '/login',
    sections: [
      { title: 'Account Must Exist', summary: 'Google login should only work for emails that already have an ERP account.', items: ['Create account first', 'Use same Gmail', 'No unknown emails', 'Fallback email/password login'] },
      { title: 'Access Blocked', summary: 'Access blocked usually means Google OAuth settings are not allowing the callback URL.', items: ['Check redirect URL', 'Use correct client ID', 'Use the deployed domain', 'Try after settings update'] },
      { title: 'Phone Login', summary: 'Phone login must return to the live domain, not localhost.', items: ['Use live URL', 'Avoid localhost on phone', 'Check callback domain', 'Refresh after update'] },
      { title: 'When to Contact Support', summary: 'Send support the exact error and account email if login still fails.', items: ['Screenshot', 'Email address', 'Browser', 'Live link used'] },
    ],
    workflow: [
      { title: 'Confirm account', detail: 'Make sure the Gmail account exists in the ERP system.' },
      { title: 'Use correct domain', detail: 'Open the same live domain configured in Google OAuth.' },
      { title: 'Try login', detail: 'Select the Google account and wait for redirect.' },
      { title: 'Report exact error', detail: 'If blocked, send the error text and URL to the admin/support owner.' },
    ],
    faq: ['Why does Google show access blocked?', 'Can any Gmail log in?', 'Why does phone open localhost?', 'What details should I send support?'],
    related: ['Account & Settings', 'Getting Started', 'Report an Issue', 'Contact Support'],
  },
  'payment-failed': {
    title: 'Payment Failed',
    eyebrow: 'Payment troubleshooting',
    summary: 'A focused guide for failed payments, deducted amounts, missing receipts, and support escalation.',
    primaryAction: 'Open Payments',
    primaryHref: '/fees',
    sections: [
      { title: 'Check Invoice', summary: 'Confirm the invoice and payer details before retrying.', items: ['Invoice number', 'Student or account', 'Amount', 'Due date'] },
      { title: 'Check Transaction', summary: 'Record the payment details exactly as shown.', items: ['Transaction ID', 'Paid time', 'Payment method', 'Gateway status'] },
      { title: 'Receipt Missing', summary: 'A successful payment should produce a receipt or paid status.', items: ['Receipt number', 'Paid status', 'Balance update', 'Download option'] },
      { title: 'Escalate Safely', summary: 'If money was deducted but the ERP shows failed, send support the evidence.', items: ['Screenshot', 'Transaction ID', 'Account email', 'Invoice number'] },
    ],
    workflow: [
      { title: 'Do not retry immediately', detail: 'If money was deducted, wait and check the payment status first.' },
      { title: 'Collect proof', detail: 'Save transaction ID, invoice number, amount, and screenshot.' },
      { title: 'Check receipt', detail: 'Look for paid status or generated receipt in the payment area.' },
      { title: 'Contact support', detail: 'Send evidence if status remains failed or receipt is missing.' },
    ],
    faq: ['Should I pay again after failure?', 'What if money was deducted?', 'Where is the receipt?', 'What proof does support need?'],
    related: ['Payments & Billing', 'FAQ Library', 'Report an Issue', 'Contact Support'],
  },
};

function getHelpFeatureConfig(featureSlug: string): HelpFeatureConfig {
  const existing = helpFeaturePages[featureSlug];
  if (existing) return existing;

  const title = titleFromSlug(featureSlug);
  const lower = title.toLowerCase();
  const topic: {
    type: string;
    action: string;
    href: string;
    problem: string;
    sections: [string, string, string[]][];
  } = lower.includes('password')
    ? {
        type: 'Account recovery',
        action: 'Reset password',
        href: '/forgot-password',
        problem: 'Password reset, login recovery, and account access.',
        sections: [
          ['Account Check', 'Confirm the email belongs to a created ERP account before resetting.', ['Email address', 'Created account', 'Recovery access']],
          ['Reset Steps', 'Use the reset page and follow the code or link flow carefully.', ['Open reset page', 'Enter email', 'Set new password']],
          ['Login Verification', 'After reset, test normal email and password login.', ['Same email', 'New password', 'Dashboard check']],
          ['When It Fails', 'Collect the exact message before raising a support request.', ['Screenshot', 'Browser', 'Account email']],
        ],
      }
    : lower.includes('payment') || lower.includes('billing') || lower.includes('refund') || lower.includes('invoice')
      ? {
          type: 'Payment support',
          action: 'Open payments',
          href: '/fees',
          problem: 'Invoices, failed payments, refunds, receipts, and billing checks.',
          sections: [
            ['Invoice Details', 'Start with the invoice and payer details before any action.', ['Invoice number', 'Amount', 'Due date']],
            ['Transaction Check', 'Match gateway status with ERP payment status.', ['Transaction ID', 'Paid time', 'Gateway status']],
            ['Receipt and Refund', 'Confirm receipt, deduction, refund reason, and support evidence.', ['Receipt', 'Refund reason', 'Proof']],
            ['Escalation Pack', 'Send support exact details if the amount was deducted or receipt is missing.', ['Screenshot', 'Account email', 'Reference']],
          ],
        }
      : lower.includes('certificate')
        ? {
            type: 'Certificate support',
            action: 'Open certificates',
            href: '/certificates',
            problem: 'Certificate eligibility, release, verification, reissue, and download.',
            sections: [
              ['Eligibility Check', 'Confirm completion, attendance, clearance, and approval status.', ['Completion', 'Clearance', 'Approval']],
              ['Certificate Record', 'Check template, recipient spelling, issue date, and signatory.', ['Template', 'Recipient', 'Signatory']],
              ['Verification', 'Use certificate ID or QR status to confirm authenticity.', ['Certificate ID', 'QR status', 'Issue log']],
              ['Reissue Request', 'Keep correction reason and previous copy history before reissue.', ['Correction reason', 'Old copy', 'Approval']],
            ],
          }
        : lower.includes('submission') || lower.includes('task') || lower.includes('upload')
          ? {
              type: 'Submission support',
              action: 'Open submissions',
              href: '/submissions',
              problem: 'Uploads, task submission, evaluator review, revisions, and feedback release.',
              sections: [
                ['Task Window', 'Check whether the submission window and file requirements are valid.', ['Open date', 'Due date', 'File type']],
                ['Upload Proof', 'Confirm uploaded files and version history before review.', ['File name', 'Version', 'Timestamp']],
                ['Evaluation', 'Track evaluator assignment, rubric status, and revision notes.', ['Evaluator', 'Rubric', 'Revision']],
                ['Feedback Release', 'Review result posting, comments, and archive evidence.', ['Feedback', 'Result status', 'Archive']],
              ],
            }
          : {
              type: 'Help guide',
              action: 'Search guides',
              href: `/search?q=${encodeURIComponent(title)}`,
              problem: `${title} guidance with steps, checks, related pages, and support details.`,
              sections: [
                ['What To Check', `Identify the exact ${title.toLowerCase()} issue and where it appears.`, ['Page name', 'Account email', 'Exact message']],
                ['Step By Step', `Follow the normal ${title.toLowerCase()} flow before reporting it.`, ['Open page', 'Check details', 'Try again']],
                ['Required Proof', 'Keep clear evidence so support can solve the issue quickly.', ['Screenshot', 'Record name', 'Time seen']],
                ['Next Action', 'Use related ERP pages or support if the guide does not solve it.', ['Related page', 'Support request', 'Follow-up note']],
              ],
            };

  return {
    title,
    eyebrow: topic.type,
    summary: topic.problem,
    primaryAction: topic.action,
    primaryHref: topic.href,
    sections: topic.sections.map(([sectionTitle, summary, items]) => ({
      title: sectionTitle,
      summary,
      items,
    })),
    workflow: [
      { title: 'Identify', detail: `Confirm the exact ${title.toLowerCase()} problem and the page where it happened.` },
      { title: 'Check details', detail: 'Review the account, record, status, required fields, and visible message.' },
      { title: 'Try correct page', detail: 'Open the correct ERP page or guide and complete the normal steps.' },
      { title: 'Escalate with proof', detail: 'Send support the screenshot, account email, page link, and exact issue if it still fails.' },
    ],
    faq: [`How do I solve ${title.toLowerCase()}?`, `What details are needed for ${title.toLowerCase()} support?`, 'Where do I check the related ERP page?', 'When should I contact support?'],
    related: ['Getting Started', 'FAQ Library', 'Report an Issue', 'Contact Support'],
  };
}

function helpRelatedHref(label: string) {
  if (label === 'Contact Support') return '/support';
  if (label === 'Community') return '/community';
  if (label === 'Submissions') return '/submissions';
  if (label === 'Training') return '/training';
  if (label === 'Internships') return '/internship';
  if (label === 'Certificates') return '/certificates';
  if (label === 'Payments & Billing') return '/modules/help-centre/payments-and-billing';
  if (label === 'Payment Failed') return '/modules/help-centre/payment-failed';
  return `/modules/help-centre/${slugifyWorkspace(label)}`;
}

function helpChildHref(featureSlug: string, label: string) {
  return `/modules/help-centre/${featureSlug}/${slugifyWorkspace(label)}`;
}

function getBlueprint(moduleSlug: string, featureName: string, output: string, controls: string[], reports: string[]) {
  const shared = {
    formTitle: `${featureName} Record`,
    titleLabel: 'Record title',
    titlePlaceholder: `Create ${featureName.toLowerCase()} record`,
    requesterLabel: 'Requester / subject',
    requesterPlaceholder: 'Student, staff, department, or owner',
    ownerLabel: 'Responsible owner',
    ownerPlaceholder: 'Team member or department',
    dueLabel: 'Due date',
    detailLabel: 'Operational details',
    detailPlaceholder: 'Add requirements, evidence, notes, and decision context',
    documentTitle: 'Documents and Evidence',
    documents: ['Request form', 'Approval proof', output, 'Audit history'],
    approvalTitle: 'Approval Path',
    reportTitle: 'Reports and Exports',
    settingsTitle: 'Rules and Settings',
    reports,
    controls,
  };

  const byModule: Record<string, Partial<typeof shared> & { documents?: string[]; reports?: string[]; controls?: string[] }> = {
    school: {
      formTitle: 'School Student Operations Record',
      titleLabel: 'Student / class work item',
      titlePlaceholder: 'New admission / class assignment / attendance case',
      requesterLabel: 'Student / guardian',
      requesterPlaceholder: 'Student name, admission number, guardian, class, or section',
      ownerLabel: 'School owner',
      ownerPlaceholder: 'Class teacher, admission officer, exams desk, or school admin',
      detailLabel: 'School operation details',
      detailPlaceholder: 'Add class, section, guardian contact, documents, attendance, exam, fee, service, and follow-up notes',
      documents: ['Admission form', 'Guardian proof', 'Health note', 'Report card evidence', output],
      controls: ['Class capacity', 'Guardian consent', 'Attendance threshold', 'Marks approval', 'Fee category'],
      reports: ['Admissions register', 'Class strength report', 'Attendance summary', 'Report card pack', 'Fee collection report'],
    },
    institutes: {
      formTitle: 'Institute Enrollment and Delivery Record',
      titleLabel: 'Lead / learner / batch item',
      titlePlaceholder: 'Counselling lead / demo booking / course batch / assessment',
      requesterLabel: 'Lead / learner',
      requesterPlaceholder: 'Prospect, learner, batch, course, branch, or company contact',
      ownerLabel: 'Institute owner',
      ownerPlaceholder: 'Counsellor, trainer, branch admin, finance owner, or support owner',
      detailLabel: 'Institute operation details',
      detailPlaceholder: 'Add lead source, counselling notes, demo class, course batch, trainer, assessment, payment, certificate, and branch follow-up',
      documents: ['Lead enquiry proof', 'Demo booking note', 'Batch attendance sheet', 'Assessment evidence', output],
      controls: ['Lead source', 'Batch capacity', 'Trainer workload', 'Payment clearance', 'Certificate template'],
      reports: ['Lead conversion report', 'Batch progress report', 'Trainer workload report', 'Revenue collection report', 'Certificate readiness report'],
    },
    internship: {
      formTitle: 'Internship Placement Record',
      titleLabel: 'Placement / company title',
      titlePlaceholder: 'Frontend Internship at partner company',
      requesterLabel: 'Student / learner',
      requesterPlaceholder: 'Student name or registration number',
      ownerLabel: 'Supervisor / mentor',
      ownerPlaceholder: 'Faculty supervisor or company mentor',
      detailLabel: 'Placement details',
      detailPlaceholder: 'Role, company, weekly log requirements, risks, and completion evidence',
      documents: ['Offer letter', 'MoU / agreement', 'Weekly log', 'Supervisor evaluation', output],
      controls: ['Eligibility rules', 'Supervisor approval', 'Weekly log cycle', 'Completion lock'],
    },
    training: {
      formTitle: 'Training Delivery Record',
      titleLabel: 'Batch / session title',
      titlePlaceholder: 'Web Development Batch - Session Plan',
      requesterLabel: 'Learner group / batch',
      requesterPlaceholder: 'Batch, cohort, or learner group',
      ownerLabel: 'Trainer',
      ownerPlaceholder: 'Trainer name',
      detailLabel: 'Delivery plan',
      detailPlaceholder: 'Session outcomes, materials, attendance rule, and assessment method',
      documents: ['Session plan', 'Attendance sheet', 'Training material', 'Skill checklist', output],
      controls: ['Trainer assignment', 'Capacity limit', 'Attendance rule', 'Progress publishing'],
    },
    programmes: {
      formTitle: 'Programme Governance Record',
      titleLabel: 'Programme / curriculum title',
      titlePlaceholder: 'BSc Computer Science - Curriculum Version',
      requesterLabel: 'Department / faculty',
      requesterPlaceholder: 'Academic department or faculty',
      ownerLabel: 'Academic owner',
      ownerPlaceholder: 'Programme coordinator',
      detailLabel: 'Curriculum details',
      detailPlaceholder: 'Credits, outcomes, eligibility, approval committee, and version notes',
      documents: ['Curriculum map', 'Credit matrix', 'Outcome mapping', 'Committee approval', output],
      controls: ['Version lock', 'Credit rule', 'Eligibility gate', 'Catalogue publishing'],
    },
    submissions: {
      formTitle: 'Submission Review Record',
      titleLabel: 'Submission task',
      titlePlaceholder: 'Project report / assignment submission',
      requesterLabel: 'Student / team',
      requesterPlaceholder: 'Student, group, or cohort',
      ownerLabel: 'Evaluator',
      ownerPlaceholder: 'Evaluator or review panel',
      detailLabel: 'Submission and marking details',
      detailPlaceholder: 'Files needed, rubric, late policy, feedback release, and revision rules',
      documents: ['Submitted file', 'Rubric sheet', 'Originality status', 'Feedback comments', output],
      controls: ['Submission window', 'Rubric lock', 'Evaluator routing', 'Feedback release'],
    },
    certificates: {
      formTitle: 'Certificate Issue Record',
      titleLabel: 'Certificate request',
      titlePlaceholder: 'Completion certificate / bonafide letter',
      requesterLabel: 'Recipient',
      requesterPlaceholder: 'Student, learner, or staff member',
      ownerLabel: 'Issuing authority',
      ownerPlaceholder: 'Registrar, admin, or authorized signatory',
      detailLabel: 'Issuing details',
      detailPlaceholder: 'Template, eligibility proof, signature rule, delivery method, and reissue reason',
      documents: ['Eligibility proof', 'Certificate template', 'Signature approval', 'QR verification', output],
      controls: ['Template lock', 'Signature authority', 'QR status', 'Reissue reason'],
    },
    transport: {
      formTitle: 'Transport Operations Record',
      titleLabel: 'Route / trip title',
      titlePlaceholder: 'Morning route - Zone A',
      requesterLabel: 'Rider / stop group',
      requesterPlaceholder: 'Student, rider group, or pickup area',
      ownerLabel: 'Driver / transport owner',
      ownerPlaceholder: 'Driver, attendant, or transport coordinator',
      detailLabel: 'Route and safety details',
      detailPlaceholder: 'Stops, pickup time, vehicle, capacity, incident notes, and guardian communication',
      documents: ['Route sheet', 'Vehicle document', 'Driver duty log', 'Incident note', output],
      controls: ['Capacity rule', 'Stop timing', 'Driver duty', 'Incident severity'],
    },
    hostel: {
      formTitle: 'Hostel Resident Care Record',
      titleLabel: 'Room / care request',
      titlePlaceholder: 'Room allocation / leave pass / visitor approval',
      requesterLabel: 'Resident',
      requesterPlaceholder: 'Student or resident name',
      ownerLabel: 'Warden / care owner',
      ownerPlaceholder: 'Warden or residential office',
      detailLabel: 'Residential details',
      detailPlaceholder: 'Room, bed, leave dates, visitor details, health note, or incident context',
      documents: ['Resident profile', 'Leave approval', 'Visitor ID proof', 'Health or incident note', output],
      controls: ['Capacity rule', 'Guardian approval', 'Visitor check', 'Warden ownership'],
    },
    library: {
      formTitle: 'Library Circulation Record',
      titleLabel: 'Resource / circulation title',
      titlePlaceholder: 'Book issue / reservation / catalogue update',
      requesterLabel: 'Member',
      requesterPlaceholder: 'Student, staff, or member name',
      ownerLabel: 'Library owner',
      ownerPlaceholder: 'Librarian or resource manager',
      detailLabel: 'Resource details',
      detailPlaceholder: 'Title, accession, ISBN, due date, reservation, overdue rule, and fine note',
      documents: ['Accession record', 'Issue slip', 'Return proof', 'Overdue note', output],
      controls: ['Borrowing limit', 'Due date rule', 'Reservation priority', 'Fine policy'],
    },
    support: {
      formTitle: 'Support Ticket Record',
      titleLabel: 'Service request',
      titlePlaceholder: 'Login issue / department support / parent query',
      requesterLabel: 'Requester',
      requesterPlaceholder: 'Student, parent, staff, or department',
      ownerLabel: 'Support owner',
      ownerPlaceholder: 'Assigned team member',
      detailLabel: 'Issue details',
      detailPlaceholder: 'Problem, priority reason, communication notes, escalation route, and resolution',
      documents: ['Request evidence', 'Internal notes', 'Escalation trail', 'Resolution proof', output],
      controls: ['Priority rule', 'Owner queue', 'SLA timer', 'Response template'],
    },
    community: {
      formTitle: 'Community Engagement Record',
      titleLabel: 'Group / event / announcement',
      titlePlaceholder: 'Alumni meetup / club announcement / poll',
      requesterLabel: 'Audience / group',
      requesterPlaceholder: 'Students, alumni, staff, or community group',
      ownerLabel: 'Moderator',
      ownerPlaceholder: 'Moderator or engagement owner',
      detailLabel: 'Engagement details',
      detailPlaceholder: 'Audience, content, schedule, moderation rule, and feedback channel',
      documents: ['Announcement copy', 'Event plan', 'Poll results', 'Moderation proof', output],
      controls: ['Audience targeting', 'Moderator approval', 'Event capacity', 'Feedback window'],
    },
    'help-centre': {
      formTitle: 'Help Article Record',
      titleLabel: 'Guide / article title',
      titlePlaceholder: 'How to reset password / policy guide',
      requesterLabel: 'Audience',
      requesterPlaceholder: 'Students, staff, parents, or admins',
      ownerLabel: 'Content owner',
      ownerPlaceholder: 'Article owner or reviewer',
      detailLabel: 'Article details',
      detailPlaceholder: 'Problem solved, search keywords, review date, related guides, and contact path',
      documents: ['Article draft', 'Review notes', 'Published guide', 'Feedback summary', output],
      controls: ['Category owner', 'Review cycle', 'Search keywords', 'Publishing approval'],
    },
    settings: {
      formTitle: 'System Configuration Record',
      titleLabel: 'Configuration change',
      titlePlaceholder: 'Institution profile / access / brand update',
      requesterLabel: 'Admin area',
      requesterPlaceholder: 'Profile, branding, access, or security',
      ownerLabel: 'Configuration owner',
      ownerPlaceholder: 'Institution admin',
      detailLabel: 'Change details',
      detailPlaceholder: 'Reason, affected pages, role impact, rollback note, and review requirement',
      documents: ['Change request', 'Approval note', 'Before and after proof', 'Security review', output],
      controls: ['Admin approval', 'Access role', 'Preview check', 'Audit history'],
    },
  };

  return { ...shared, ...(byModule[moduleSlug] ?? {}) };
}

export default async function ModuleFeaturePage({ params }: { params: { module: string; feature: string } }) {
  if (params.module === 'help-centre') {
    return <HelpCentreFeaturePage featureSlug={params.feature} />;
  }

  const workspace = getMainWorkspace(params.module);
  const feature = findWorkspaceFeature(params.module, params.feature);
  const fallbackSection = workspace?.sections[0];
  const moduleName = workspace?.title ?? titleFromSlug(params.module);
  const featureName = feature?.title ?? titleFromSlug(params.feature);
  const summary = feature?.summary ?? fallbackSection?.summary ?? 'A focused operational workspace for configuration, approvals, evidence, reporting, and follow-up control.';
  const capabilities = feature?.items ?? fallbackSection?.items ?? ['Request capture', 'Owner routing', 'Approval control', 'Report export'];
  const controls = feature?.controls ?? fallbackSection?.controls ?? ['Role-based access', 'Approval routing', 'Audit history', 'Export permissions'];
  const output = feature?.output ?? fallbackSection?.output ?? `${featureName} management record`;
  const workflow = workspace?.workflow ?? [
    { title: 'Configure', detail: 'Set the policy, owners, forms, required fields, and visibility rules.' },
    { title: 'Operate', detail: 'Capture work, route responsibilities, track exceptions, and update status.' },
    { title: 'Approve', detail: 'Review evidence, validate decisions, and lock approved outcomes.' },
    { title: 'Report', detail: 'Export summaries, audit trails, and management-ready records.' },
  ];
  const reports = workspace?.reports ?? ['Summary report', 'Pending actions', 'Audit trail', 'Export pack'];
  const blueprint = getBlueprint(params.module, featureName, output, controls, reports);
  const workConfig = getExactFeatureWorkConfig({
    moduleSlug: params.module,
    moduleName,
    featureSlug: params.feature,
    featureName,
    workspace,
    sectionTitle: feature?.sectionTitle ?? fallbackSection?.title,
    capabilities,
    controls,
    output,
    reports,
  });
  const childPageHref = (label: string) => `/modules/${params.module}/${params.feature}/${slugifyWorkspace(label)}`;
  const pageHref = (label: string) => `/modules/${params.module}/${slugifyWorkspace(label)}`;
  const workSections = workConfig.sections.map((section) => ({
    ...section,
    href: childPageHref(section.title),
  }));
  const session = getSession();
  const records = session
    ? await db.moduleRecord.findMany({
        where: { institutionId: session.institutionId, module: params.module, feature: params.feature },
        orderBy: { createdAt: 'desc' },
        take: 40,
      })
    : [];
  const statusCounts = STATUS_FLOW.map((status) => ({
    ...status,
    count: records.filter((record) => record.status === status.value).length,
  }));
  const relatedOperations = Array.from(new Set([
    ...capabilities,
    ...workflow.map((step) => step.title),
    ...reports,
    ...controls,
  ])).filter((item) => slugifyWorkspace(item) !== params.feature);
  const communityExtensionPages =
    params.module === 'community'
      ? Array.from(new Set([...workSections.flatMap((section) => [section.title, ...section.items]), ...relatedOperations])).filter((item) => slugifyWorkspace(item) !== params.feature)
      : [];

  if (params.module === 'community') {
    return (
      <CommunityOperationPage
        featureSlug={params.feature}
        featureName={featureName}
        summary={summary}
        records={records}
        statusCounts={statusCounts}
        relatedOperations={relatedOperations}
        workspaceHref={workspace?.href ?? '/community'}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="premium-home-hero rounded-2xl p-5 text-white">
        <Link href={workspace?.href ?? `/${params.module}`} className="inline-flex items-center gap-1.5 text-sm text-white/75 hover:text-white">
          <ArrowLeft size={15} /> Back to {moduleName}
        </Link>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/60">{moduleName}</p>
            <h1 className="mt-1 break-words text-2xl font-extrabold text-white">{featureName}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">{summary}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={childPageHref('New record')} className="rounded-lg border border-white/20 bg-white/15 px-3 py-2 text-sm text-white">
              New Record
            </Link>
            <Link href={childPageHref('Reports')} className="rounded-lg border border-white/20 bg-white/15 px-3 py-2 text-sm text-white">
              Reports
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Metric icon={<ClipboardList size={18} />} label="Records" value={String(records.length)} accent />
        <Metric icon={<ShieldCheck size={18} />} label="In Review" value={String(statusCounts.find((item) => item.value === 'IN_REVIEW')?.count ?? 0)} />
        <Metric icon={<CheckCircle2 size={18} />} label="Approved" value={String(statusCounts.find((item) => item.value === 'APPROVED')?.count ?? 0)} />
        <Metric icon={<BarChart3 size={18} />} label="Reports" value={String(reports.length)} />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">{workConfig.eyebrow}</p>
            <h2 className="mt-1 break-words text-xl font-extrabold text-slate-950">{workConfig.title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{workConfig.summary}</p>
          </div>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-600">{workSections.length} working areas</span>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {workSections.map((section) => (
            <article key={section.title} className="group min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-brand-300 hover:bg-white hover:shadow-sm">
              <div className="flex min-w-0 items-start gap-3">
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${section.tone} text-white shadow-sm`}>
                  {section.icon}
                </span>
                <div className="min-w-0">
                  <h3 className="break-words text-sm font-extrabold text-slate-950">{section.title}</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{section.detail}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {section.items.filter((item) => slugifyWorkspace(item) !== params.feature).map((item) => (
                  <Link key={item} href={childPageHref(item)} className="inline-flex min-w-0 items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600 transition hover:border-brand-300 hover:text-brand-600">
                    <span className="min-w-0 break-words">{item}</span>
                    <ArrowRight size={11} className="shrink-0" />
                  </Link>
                ))}
              </div>
              <Link href={section.href} className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-brand-600">
                Open separate page <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      {communityExtensionPages.length > 0 && (
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A] p-5 text-white shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-violet-300">Community extended system</p>
              <h2 className="mt-1 break-words text-xl font-extrabold text-white">Open deeper Community pages</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">Every item below opens its own Community ERP page with form entry, workflow, live records, evidence, controls, and reports.</p>
            </div>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-slate-200">{communityExtensionPages.length} pages</span>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {communityExtensionPages.map((item, index) => (
              <Link key={item} href={pageHref(item)} className="group min-w-0 rounded-2xl border border-white/10 bg-white/8 p-3 transition hover:-translate-y-0.5 hover:border-violet-300/50 hover:bg-white/12">
                <div className="flex items-start gap-2">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-violet-300/14 text-violet-200">
                    {index % 3 === 0 ? <Users size={17} /> : index % 3 === 1 ? <MessageSquare size={17} /> : <ShieldCheck size={17} />}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-violet-300">Child page</p>
                    <h3 className="mt-1 break-words text-sm font-bold text-white">{item}</h3>
                  </div>
                </div>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-violet-200">
                  Open page <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <ModuleExperience
        moduleSlug={params.module}
        featureSlug={params.feature}
        moduleName={moduleName}
        featureName={featureName}
        summary={summary}
        capabilities={capabilities}
        controls={controls}
        output={output}
        workflow={workflow}
        reports={reports}
      />

      <section className="grid gap-4 xl:grid-cols-[.95fr_1.05fr]">
        <div id="create-record" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
              <Send size={18} />
            </span>
            <div className="min-w-0">
              <h2 className="break-words font-bold text-slate-950">{blueprint.formTitle}</h2>
              <p className="text-sm text-slate-500">Create and save a real record for this ERP option.</p>
            </div>
          </div>

          <form action={createModuleRecord} className="mt-5 space-y-4">
            <input type="hidden" name="module" value={params.module} />
            <input type="hidden" name="feature" value={params.feature} />
            <Field label={blueprint.titleLabel}>
              <input name="title" required placeholder={blueprint.titlePlaceholder} className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-500" />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={blueprint.requesterLabel}>
                <input name="requester" placeholder={blueprint.requesterPlaceholder} className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-500" />
              </Field>
              <Field label={blueprint.ownerLabel}>
                <input name="owner" placeholder={blueprint.ownerPlaceholder} className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-500" />
              </Field>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Priority">
                <select name="priority" className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-500">
                  <option value="LOW">Low</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </Field>
              <Field label={blueprint.dueLabel}>
                <input name="dueDate" type="date" className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-500" />
              </Field>
            </div>
            <Field label={blueprint.detailLabel}>
              <textarea name="details" rows={5} placeholder={blueprint.detailPlaceholder} className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-500" />
            </Field>
            <button className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700 sm:w-auto">
              <Send size={16} /> Save Record
            </button>
          </form>
        </div>

        <div id="workflow-status" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-bold text-slate-950">Workflow Status</h2>
              <p className="mt-1 text-sm text-slate-500">Move saved records through a proper ERP approval cycle.</p>
            </div>
            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-600">Tenant scoped</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {statusCounts.map((status) => (
              <div key={status.value} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{status.label}</p>
                <p className="mt-2 text-2xl font-extrabold text-slate-950">{status.count}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center gap-2">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
              <ShieldCheck size={16} />
            </span>
            <h3 className="font-semibold text-slate-900">{blueprint.approvalTitle}</h3>
          </div>
          <div className="mt-3 space-y-3">
            {workflow.map((step, index) => (
              <Link key={step.title} href={pageHref(step.title)} className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 transition hover:border-brand-300 hover:bg-white">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-aurora text-xs font-bold text-white">{index + 1}</span>
                <div className="min-w-0">
                  <p className="break-words font-semibold text-slate-900">{step.title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{step.detail}</p>
                </div>
                <ArrowRight size={14} className="ml-auto shrink-0 self-center text-slate-400" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="live-records" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-bold text-slate-950">Live Records</h2>
            <p className="mt-1 text-sm text-slate-500">Only records saved in this institution appear here. No dummy rows.</p>
          </div>
          <span className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500">{featureName}</span>
        </div>

        {records.length ? (
          <>
            <div className="mt-4 hidden overflow-x-auto rounded-xl border border-slate-200 lg:block">
              <table className="w-full min-w-[980px] text-sm">
                <thead className="bg-slate-50 text-left text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Record</th>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3">Owner</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3">Due</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record.id} className="border-t border-slate-100 align-top">
                      <td className="px-4 py-3">
                        <p className="font-mono text-xs text-slate-400">REC-{shortRecordId(record.id)}</p>
                        <p className="mt-1 max-w-xs break-words font-semibold text-slate-900">{record.title}</p>
                        {record.details && <p className="mt-1 max-w-sm break-words text-xs leading-5 text-slate-500">{record.details}</p>}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{record.requester || 'Not added'}</td>
                      <td className="px-4 py-3 text-slate-600">{record.owner || 'Not assigned'}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${priorityClass(record.priority)}`}>{record.priority}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{record.dueDate || 'No date'}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusClass(record.status)}`}>{record.status.replace('_', ' ')}</span>
                      </td>
                      <td className="px-4 py-3">
                        <RecordActions id={record.id} module={params.module} feature={params.feature} status={record.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 grid gap-3 lg:hidden">
              {records.map((record) => (
                <article key={record.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-[11px] uppercase tracking-wide text-slate-400">REC-{shortRecordId(record.id)}</p>
                      <h3 className="mt-1 break-words font-semibold text-slate-900">{record.title}</h3>
                    </div>
                    <span className={`shrink-0 rounded-full border px-2 py-1 text-[11px] font-medium ${statusClass(record.status)}`}>{record.status.replace('_', ' ')}</span>
                  </div>
                  <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                    <Info label={blueprint.requesterLabel} value={record.requester || 'Not added'} />
                    <Info label={blueprint.ownerLabel} value={record.owner || 'Not assigned'} />
                    <Info label="Priority" value={record.priority} />
                    <Info label={blueprint.dueLabel} value={record.dueDate || 'No date'} />
                  </div>
                  {record.details && <p className="mt-3 break-words rounded-lg bg-white px-3 py-2 text-xs leading-5 text-slate-500">{record.details}</p>}
                  <div className="mt-3 border-t border-slate-200 pt-3">
                    <RecordActions id={record.id} module={params.module} feature={params.feature} status={record.status} compact />
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <Database className="mx-auto text-slate-300" size={34} />
            <h3 className="mt-3 font-semibold text-slate-900">No records saved yet</h3>
            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
              Use the form above to create the first {featureName.toLowerCase()} record. It will appear here with status controls, owner, priority, and due date.
            </p>
          </div>
        )}
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <WorkspacePanel moduleSlug={params.module} featureSlug={params.feature} id="documents" icon={<FileText size={18} />} title={blueprint.documentTitle} items={blueprint.documents ?? []} />
        <WorkspacePanel moduleSlug={params.module} featureSlug={params.feature} id="controls" icon={<ShieldCheck size={18} />} title={blueprint.settingsTitle} items={blueprint.controls ?? []} />
        <WorkspacePanel moduleSlug={params.module} featureSlug={params.feature} id="reports" icon={<BarChart3 size={18} />} title={blueprint.reportTitle} items={blueprint.reports ?? []} />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-bold text-slate-950">Next Operational Pages</h2>
            <p className="mt-1 text-sm text-slate-500">Open related pages inside the same ERP module. Every link opens a full workspace like this one.</p>
          </div>
          <Link href={workspace?.href ?? `/${params.module}`} className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-600">
            Module home <ArrowRight size={14} />
          </Link>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {relatedOperations.map((item) => (
            <Link key={item} href={`/modules/${params.module}/${slugifyWorkspace(item)}`} className="group flex min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm transition hover:border-brand-400 hover:bg-white">
              <span className="h-2 w-2 shrink-0 rounded-full bg-aurora" />
              <span className="min-w-0 break-words font-medium text-slate-700">{item}</span>
              <ArrowRight size={14} className="ml-auto shrink-0 text-slate-400 opacity-0 transition group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

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

type CommunityTemplate = {
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
  stages: Array<{ title: string; detail: string; href: string }>;
  panels: Array<{ title: string; note: string; items: string[]; href: string; icon: ReactNode; tone: string }>;
  quickLinks: string[];
  controls: string[];
  outputs: string[];
};

type CommunityLeafTemplate = {
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
  sections: Array<{ title: string; detail: string; items: string[]; icon: ReactNode; tone: string }>;
  controls: string[];
  outputs: string[];
  related: string[];
};

function communityTemplate(featureSlug: string, featureName: string): CommunityTemplate {
  const slug = featureSlug.toLowerCase();
  const page = (label: string) => `/modules/community/${slugifyWorkspace(label)}`;
  const groupLike = ['group', 'club', 'membership', 'student', 'faculty', 'alumni', 'directory', 'visibility'].some((item) => slug.includes(item));
  const announcementLike = ['announcement', 'audience', 'reach', 'copy', 'publish'].some((item) => slug.includes(item));
  const eventLike = ['event', 'calendar', 'capacity', 'participation', 'schedule'].some((item) => slug.includes(item));
  const pollLike = ['poll', 'feedback', 'survey', 'response'].some((item) => slug.includes(item));
  const moderationLike = ['moderation', 'moderator', 'post', 'approval', 'permission', 'queue', 'rules'].some((item) => slug.includes(item));
  const recordLike = ['record', 'status', 'draft', 'review', 'approved', 'closure', 'owner', 'intake', 'ownership', 'audit'].some((item) => slug.includes(item));

  if (announcementLike) {
    return {
      eyebrow: 'Community / Announcement system',
      title: `${featureName} publishing workspace`,
      summary: 'Compose announcements, choose audiences, schedule release, approve copy, and track delivery reach from one community command page.',
      icon: <MessageSquare size={22} />,
      tone: 'from-sky-500 to-cyan-500',
      formTitle: 'Create announcement release',
      titleLabel: 'Announcement title',
      titlePlaceholder: 'Exam briefing / alumni update / event notice',
      requesterLabel: 'Audience',
      requesterPlaceholder: 'Students, alumni, faculty, parents, or selected clubs',
      ownerLabel: 'Publisher',
      ownerPlaceholder: 'Communication owner or moderator',
      detailsLabel: 'Message and release notes',
      detailsPlaceholder: 'Write announcement copy, schedule, audience rule, attachment notes, and approval needs',
      stages: [
        { title: 'Draft copy', detail: 'Prepare headline, body, attachment notes, and language review.', href: page('Announcement copy') },
        { title: 'Target audience', detail: 'Choose groups, roles, programmes, or communities before publishing.', href: page('Audience targeting') },
        { title: 'Approve publish', detail: 'Route sensitive announcements through moderator approval.', href: page('Publish approval') },
        { title: 'Measure reach', detail: 'Track read status, acknowledgement, and follow-up response.', href: page('Announcement reach') },
      ],
      panels: [
        { title: 'Composer', note: 'Message preparation area.', items: ['Announcement copy', 'Attachments', 'Language check', 'Preview'], href: page('Announcement copy'), icon: <FileText size={18} />, tone: 'from-sky-500 to-cyan-500' },
        { title: 'Audience Rules', note: 'Target only the right community.', items: ['Audience targeting', 'Group visibility', 'Role filters', 'Exclusions'], href: page('Audience targeting'), icon: <Users size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
        { title: 'Release Log', note: 'Proof after publish.', items: ['Publish approval', 'Announcement reach', 'Read status', 'Follow-up'], href: page('Announcement reach'), icon: <BarChart3 size={18} />, tone: 'from-emerald-500 to-teal-500' },
      ],
      quickLinks: ['Announcement copy', 'Audience targeting', 'Publish approval', 'Announcement reach', 'Community activity', 'Moderation log'],
      controls: ['Publisher role', 'Audience lock', 'Approval route', 'Schedule window'],
      outputs: ['Published announcement', 'Read receipt log', 'Audience reach report', 'Follow-up list'],
    };
  }

  if (eventLike) {
    return {
      eyebrow: 'Community / Event system',
      title: `${featureName} event operations`,
      summary: 'Plan community events with calendar placement, capacity, invitations, RSVP tracking, participation, and post-event feedback.',
      icon: <CalendarDays size={22} />,
      tone: 'from-emerald-500 to-teal-500',
      formTitle: 'Create event plan',
      titleLabel: 'Event title',
      titlePlaceholder: 'Community meetup / club session / guest talk',
      requesterLabel: 'Audience or group',
      requesterPlaceholder: 'Club, batch, alumni group, or open community',
      ownerLabel: 'Event owner',
      ownerPlaceholder: 'Coordinator, moderator, or faculty lead',
      detailsLabel: 'Venue, capacity, and agenda',
      detailsPlaceholder: 'Add venue, date, capacity, agenda, invitation rule, and participation requirements',
      stages: [
        { title: 'Plan event', detail: 'Set agenda, venue, owner, calendar slot, and resource needs.', href: page('Event plan') },
        { title: 'Control capacity', detail: 'Manage seats, waitlist, RSVP cut-off, and access rules.', href: page('Event capacity') },
        { title: 'Invite audience', detail: 'Send invites to the right groups and publish calendar visibility.', href: page('Event calendar') },
        { title: 'Record participation', detail: 'Capture attendance, feedback, photos, and outcome notes.', href: page('Event participation') },
      ],
      panels: [
        { title: 'Calendar Desk', note: 'Event scheduling and visibility.', items: ['Event calendar', 'Schedule event', 'Venue plan', 'Reminder cycle'], href: page('Event calendar'), icon: <CalendarDays size={18} />, tone: 'from-emerald-500 to-teal-500' },
        { title: 'Capacity Control', note: 'Seats and invite limits.', items: ['Event capacity', 'Waitlist', 'RSVP status', 'Access checks'], href: page('Event capacity'), icon: <ShieldCheck size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
        { title: 'Participation', note: 'After-event evidence.', items: ['Event participation', 'Attendance proof', 'Feedback window', 'Outcome notes'], href: page('Event participation'), icon: <BarChart3 size={18} />, tone: 'from-amber-500 to-orange-500' },
      ],
      quickLinks: ['Event calendar', 'Schedule event', 'Event capacity', 'Event participation', 'Feedback window', 'Community activity'],
      controls: ['Capacity limit', 'RSVP deadline', 'Calendar visibility', 'Host approval'],
      outputs: ['Event plan', 'Attendance register', 'Participation report', 'Feedback summary'],
    };
  }

  if (pollLike) {
    return {
      eyebrow: 'Community / Poll system',
      title: `${featureName} feedback workspace`,
      summary: 'Build polls, open response windows, target audiences, watch response health, and turn community feedback into action.',
      icon: <ClipboardList size={22} />,
      tone: 'from-violet-600 to-fuchsia-500',
      formTitle: 'Create poll or feedback form',
      titleLabel: 'Poll title',
      titlePlaceholder: 'Training feedback / club vote / service survey',
      requesterLabel: 'Response audience',
      requesterPlaceholder: 'Students, staff, club members, alumni, or selected groups',
      ownerLabel: 'Feedback owner',
      ownerPlaceholder: 'Moderator or department owner',
      detailsLabel: 'Questions and response rule',
      detailsPlaceholder: 'Add question list, visibility, anonymous rule, close date, and reporting need',
      stages: [
        { title: 'Build questions', detail: 'Prepare rating, choice, comment, and consent fields.', href: page('Poll builder') },
        { title: 'Open response', detail: 'Publish the form to the selected audience and set close rules.', href: page('Open poll') },
        { title: 'Monitor feedback', detail: 'Watch response volume, missing groups, and moderation flags.', href: page('Polls and feedback') },
        { title: 'Publish insight', detail: 'Summarize trends, actions, and follow-up owners.', href: page('Poll results') },
      ],
      panels: [
        { title: 'Question Builder', note: 'Structured survey design.', items: ['Poll builder', 'Question bank', 'Anonymous mode', 'Required fields'], href: page('Poll builder'), icon: <ClipboardList size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
        { title: 'Response Window', note: 'Audience and deadline.', items: ['Open poll', 'Feedback window', 'Audience targeting', 'Close date'], href: page('Open poll'), icon: <Users size={18} />, tone: 'from-sky-500 to-cyan-500' },
        { title: 'Insights', note: 'Decision-ready output.', items: ['Poll results', 'Response chart', 'Action owner', 'Export summary'], href: page('Poll results'), icon: <BarChart3 size={18} />, tone: 'from-emerald-500 to-teal-500' },
      ],
      quickLinks: ['Open poll', 'Polls and feedback', 'Feedback window', 'Poll results', 'Audience targeting', 'Community activity'],
      controls: ['Anonymous response', 'One response rule', 'Close date', 'Result visibility'],
      outputs: ['Poll results', 'Feedback summary', 'Action list', 'Response export'],
    };
  }

  if (moderationLike || recordLike) {
    return {
      eyebrow: 'Community / Moderation system',
      title: `${featureName} control workspace`,
      summary: 'Review community content, route approvals, handle reports, protect post permissions, and keep an audit-ready moderation log.',
      icon: <ShieldCheck size={22} />,
      tone: 'from-amber-500 to-orange-500',
      formTitle: 'Create moderation case',
      titleLabel: 'Case or rule title',
      titlePlaceholder: 'Post review / membership approval / policy update',
      requesterLabel: 'Reported item or audience',
      requesterPlaceholder: 'Group, post, member, or target audience',
      ownerLabel: 'Moderator',
      ownerPlaceholder: 'Assigned moderator or approval owner',
      detailsLabel: 'Review notes and decision context',
      detailsPlaceholder: 'Add reported content, rule, evidence, decision notes, escalation, and closure requirement',
      stages: [
        { title: 'Intake case', detail: 'Capture reported post, membership request, or rule exception.', href: page('Approval queue') },
        { title: 'Review evidence', detail: 'Check screenshots, audience, rule, impact, and owner notes.', href: page('Review post') },
        { title: 'Apply decision', detail: 'Approve, reject, hide, escalate, or request changes.', href: page('Post permissions') },
        { title: 'Archive audit', detail: 'Store decision, moderator, timestamp, and policy reference.', href: page('Moderation log') },
      ],
      panels: [
        { title: 'Approval Queue', note: 'Pending community decisions.', items: ['Approval queue', 'Moderator roles', 'Review post', 'Reported content'], href: page('Approval queue'), icon: <ClipboardList size={18} />, tone: 'from-amber-500 to-orange-500' },
        { title: 'Rules Engine', note: 'Permission and visibility control.', items: ['Post permissions', 'Membership rules', 'Group visibility', 'Audience targeting'], href: page('Post permissions'), icon: <KeyRound size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
        { title: 'Audit Log', note: 'Evidence for every action.', items: ['Moderation log', 'Decision history', 'Escalation notes', 'Export pack'], href: page('Moderation log'), icon: <Database size={18} />, tone: 'from-sky-500 to-cyan-500' },
      ],
      quickLinks: ['Approval queue', 'Review post', 'Post permissions', 'Moderator roles', 'Membership rules', 'Moderation log'],
      controls: ['Moderator roles', 'Post permissions', 'Approval route', 'Audit history'],
      outputs: ['Moderation log', 'Decision register', 'Escalation report', 'Policy proof'],
    };
  }

  if (groupLike) {
    return {
      eyebrow: 'Community / Groups system',
      title: `${featureName} membership workspace`,
      summary: 'Manage groups, clubs, alumni spaces, faculty circles, membership rules, moderators, visibility, and approval queues.',
      icon: <Users size={22} />,
      tone: 'from-violet-600 to-fuchsia-500',
      formTitle: 'Create group or club profile',
      titleLabel: 'Group / club name',
      titlePlaceholder: 'Robotics club / alumni circle / student council',
      requesterLabel: 'Member audience',
      requesterPlaceholder: 'Students, alumni, faculty, or mixed community',
      ownerLabel: 'Group moderator',
      ownerPlaceholder: 'Faculty moderator or community lead',
      detailsLabel: 'Purpose, membership, and rules',
      detailsPlaceholder: 'Add purpose, category, member rule, visibility, approval path, and expected activities',
      stages: [
        { title: 'Set up profile', detail: 'Define purpose, category, audience, owner, and visibility.', href: page('Student groups') },
        { title: 'Approve members', detail: 'Process join requests, club roles, and alumni access.', href: page('Club memberships') },
        { title: 'Assign moderators', detail: 'Attach faculty leads, student officers, and permission rules.', href: page('Moderator roles') },
        { title: 'Publish directory', detail: 'Show approved groups in the community directory.', href: page('Community directory') },
      ],
      panels: [
        { title: 'Member Spaces', note: 'Groups and club identity.', items: ['Student groups', 'Faculty circles', 'Alumni communities', 'Club memberships'], href: page('Student groups'), icon: <Users size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
        { title: 'Membership Rules', note: 'Join and visibility control.', items: ['Membership rules', 'Group visibility', 'Approval queue', 'Moderator roles'], href: page('Membership rules'), icon: <ShieldCheck size={18} />, tone: 'from-sky-500 to-cyan-500' },
        { title: 'Directory Output', note: 'Published community record.', items: ['Community directory', 'Community activity', 'Engagement', 'Moderation log'], href: page('Community directory'), icon: <Database size={18} />, tone: 'from-emerald-500 to-teal-500' },
      ],
      quickLinks: ['Student groups', 'Faculty circles', 'Alumni communities', 'Club memberships', 'Membership rules', 'Moderator roles', 'Group visibility', 'Approval queue', 'Community directory'],
      controls: ['Membership rules', 'Moderator roles', 'Group visibility', 'Approval queue'],
      outputs: ['Community directory', 'Club membership register', 'Moderator assignment log', 'Group activity report'],
    };
  }

  return communityTemplate('groups-and-clubs', featureName);
}

function makeCommunityLeafTemplate({
  eyebrow,
  title,
  summary,
  icon,
  tone,
  formTitle,
  titleLabel,
  titlePlaceholder,
  requesterLabel,
  requesterPlaceholder,
  ownerLabel,
  ownerPlaceholder,
  detailsLabel,
  detailsPlaceholder,
  sections,
  controls,
  outputs,
  related,
}: CommunityLeafTemplate): CommunityLeafTemplate {
  return {
    eyebrow,
    title,
    summary,
    icon,
    tone,
    formTitle,
    titleLabel,
    titlePlaceholder,
    requesterLabel,
    requesterPlaceholder,
    ownerLabel,
    ownerPlaceholder,
    detailsLabel,
    detailsPlaceholder,
    sections,
    controls,
    outputs,
    related,
  };
}

function communityLeafTemplate(featureSlug: string, featureName: string): CommunityLeafTemplate | undefined {
  const slug = featureSlug.toLowerCase();
  const groupRoutes = ['student-groups', 'faculty-circles', 'alumni-communities', 'club-memberships', 'community-directory'];
  const membershipRoutes = ['membership-rules', 'group-visibility', 'moderator-roles'];
  const announcementRoutes = ['announcement-copy', 'audience-targeting', 'publish-approval', 'announcement-reach', 'read-status', 'published-announcement'];
  const eventRoutes = ['event-plan', 'event-calendar', 'schedule-event', 'event-capacity', 'event-participation', 'waitlist', 'rsvp-status'];
  const pollRoutes = ['poll-builder', 'question-bank', 'open-poll', 'polls-and-feedback', 'feedback-window', 'poll-results', 'response-chart'];
  const moderationRoutes = ['approval-queue', 'review-post', 'post-permissions', 'moderation-log', 'reported-content', 'decision-history', 'escalation-notes'];

  if (moderationRoutes.includes(slug)) {
    const exact: Record<string, Pick<CommunityLeafTemplate, 'title' | 'summary' | 'formTitle' | 'titleLabel' | 'titlePlaceholder' | 'requesterLabel' | 'requesterPlaceholder' | 'detailsLabel' | 'detailsPlaceholder' | 'sections' | 'outputs'>> = {
      'approval-queue': {
        title: 'Approval Queue workspace',
        summary: 'A decision queue for pending posts, group joins, announcements, and policy exceptions that need moderator approval.',
        formTitle: 'Add approval request',
        titleLabel: 'Approval request',
        titlePlaceholder: 'New club post awaiting approval',
        requesterLabel: 'Submitted by',
        requesterPlaceholder: 'Student, staff, club, or group',
        detailsLabel: 'Approval reason',
        detailsPlaceholder: 'Add requested action, policy check, affected audience, due time, and approval note',
        sections: [
          { title: 'Incoming Requests', detail: 'Sort new approvals by type, urgency, owner, and affected audience.', items: ['Post requests', 'Join requests', 'Announcement approvals', 'Exception flags'], icon: <ClipboardList size={18} />, tone: 'from-amber-500 to-orange-500' },
          { title: 'Moderator Assignment', detail: 'Route every request to the correct moderator or department owner.', items: ['Owner queue', 'Backup moderator', 'Due time', 'Escalation owner'], icon: <Users size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
          { title: 'Decision Board', detail: 'Approve, reject, hold, or request changes with clear reasons.', items: ['Approve', 'Reject', 'Hold', 'Need changes'], icon: <ShieldCheck size={18} />, tone: 'from-sky-500 to-cyan-500' },
          { title: 'Queue Audit', detail: 'Preserve request trail, moderator action, and final decision evidence.', items: ['Submitted time', 'Reviewer', 'Decision note', 'Audit export'], icon: <Database size={18} />, tone: 'from-emerald-500 to-teal-500' },
        ],
        outputs: ['Approval queue register', 'Pending approval list', 'Decision history', 'Escalation report'],
      },
      'review-post': {
        title: 'Review Post workspace',
        summary: 'A moderation review page for checking post content, evidence, rules, audience impact, and reviewer decisions.',
        formTitle: 'Add post review',
        titleLabel: 'Post or content title',
        titlePlaceholder: 'Reported community post',
        requesterLabel: 'Author or reporter',
        requesterPlaceholder: 'Post author, reporter, or group',
        detailsLabel: 'Review evidence',
        detailsPlaceholder: 'Add content snapshot, policy match, screenshots, risk note, and recommended decision',
        sections: [
          { title: 'Content Snapshot', detail: 'Capture the original post, attachments, comments, and audience.', items: ['Post body', 'Attachments', 'Comment thread', 'Audience'], icon: <FileText size={18} />, tone: 'from-sky-500 to-cyan-500' },
          { title: 'Policy Match', detail: 'Compare the content with community rules and moderation policy.', items: ['Rule category', 'Severity', 'Previous cases', 'Exception note'], icon: <ShieldCheck size={18} />, tone: 'from-amber-500 to-orange-500' },
          { title: 'Reviewer Decision', detail: 'Record hide, allow, edit request, escalation, or warning outcome.', items: ['Allow', 'Hide', 'Request edit', 'Escalate'], icon: <ClipboardList size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
          { title: 'Notification Trail', detail: 'Keep author messages, moderator notes, and final closure proof.', items: ['Author notice', 'Moderator note', 'Closure reason', 'Appeal window'], icon: <MessageSquare size={18} />, tone: 'from-emerald-500 to-teal-500' },
        ],
        outputs: ['Post review file', 'Policy decision note', 'Author notification', 'Review audit trail'],
      },
      'post-permissions': {
        title: 'Post Permissions workspace',
        summary: 'A permission control page for who can post, comment, publish, edit, pin, or moderate community content.',
        formTitle: 'Add permission rule',
        titleLabel: 'Permission rule',
        titlePlaceholder: 'Club officers can publish announcements',
        requesterLabel: 'Applies to',
        requesterPlaceholder: 'Role, group, club, or audience',
        detailsLabel: 'Permission details',
        detailsPlaceholder: 'Add allowed actions, restricted actions, approval needs, exception handling, and review date',
        sections: [
          { title: 'Role Matrix', detail: 'Map roles to publish, comment, edit, delete, pin, and approve rights.', items: ['Publish', 'Comment', 'Edit', 'Delete'], icon: <KeyRound size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
          { title: 'Visibility Gate', detail: 'Control which audiences can see or interact with the content.', items: ['Public', 'Private', 'Group-only', 'Invite-only'], icon: <Users size={18} />, tone: 'from-sky-500 to-cyan-500' },
          { title: 'Approval Guard', detail: 'Require approval for sensitive groups, keywords, or announcement types.', items: ['Sensitive content', 'Keyword flag', 'Admin approval', 'Auto hold'], icon: <ShieldCheck size={18} />, tone: 'from-amber-500 to-orange-500' },
          { title: 'Permission Audit', detail: 'Track every permission update with owner and rollback proof.', items: ['Changed by', 'Reason', 'Old value', 'Rollback'], icon: <Database size={18} />, tone: 'from-emerald-500 to-teal-500' },
        ],
        outputs: ['Permission matrix', 'Access audit', 'Exception report', 'Rollback log'],
      },
      'moderation-log': {
        title: 'Moderation Log workspace',
        summary: 'An audit-ready register for moderator actions, decisions, evidence, escalations, appeals, and exported reports.',
        formTitle: 'Add moderation log entry',
        titleLabel: 'Log entry title',
        titlePlaceholder: 'Post hidden after rule review',
        requesterLabel: 'Content or case',
        requesterPlaceholder: 'Post, group, user, announcement, or poll',
        detailsLabel: 'Decision and evidence',
        detailsPlaceholder: 'Add decision, moderator, timestamp, evidence, rule reference, appeal status, and final outcome',
        sections: [
          { title: 'Decision Timeline', detail: 'Review the sequence of actions from report to closure.', items: ['Reported', 'Reviewed', 'Decision', 'Closed'], icon: <ClipboardList size={18} />, tone: 'from-amber-500 to-orange-500' },
          { title: 'Evidence Archive', detail: 'Store screenshots, copied text, attachments, and policy proof.', items: ['Screenshots', 'Post copy', 'Attachments', 'Policy proof'], icon: <FileText size={18} />, tone: 'from-sky-500 to-cyan-500' },
          { title: 'Moderator Actions', detail: 'Track warnings, hides, approvals, edits, escalations, and reversals.', items: ['Warning', 'Hide', 'Approve', 'Escalate'], icon: <ShieldCheck size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
          { title: 'Audit Export', detail: 'Prepare filtered moderation reports for admins and governance review.', items: ['By moderator', 'By severity', 'By group', 'Export pack'], icon: <BarChart3 size={18} />, tone: 'from-emerald-500 to-teal-500' },
        ],
        outputs: ['Moderation audit log', 'Decision register', 'Evidence archive', 'Governance export'],
      },
    };
    const item = exact[slug] ?? exact['moderation-log'];
    return makeCommunityLeafTemplate({
      eyebrow: 'Community / Moderation section',
      icon: <ShieldCheck size={22} />,
      tone: 'from-amber-500 to-orange-500',
      ownerLabel: 'Moderator',
      ownerPlaceholder: 'Assigned moderator or approval owner',
      controls: ['Moderator role', 'Permission rule', 'Escalation path', 'Audit lock'],
      related: ['Approval queue', 'Review post', 'Post permissions', 'Moderator roles', 'Membership rules', 'Moderation log'],
      ...item,
    });
  }

  if (membershipRoutes.includes(slug) || groupRoutes.includes(slug)) {
    const membership = membershipRoutes.includes(slug);
    return makeCommunityLeafTemplate({
      eyebrow: membership ? 'Community / Membership control' : 'Community / Group section',
      title: membership ? `${featureName} control workspace` : `${featureName} registry workspace`,
      summary: membership
        ? 'A rules page for member eligibility, visibility, moderator scope, approvals, exceptions, and membership audit.'
        : 'A group operations page for profiles, member registers, roles, activities, documents, and published directory records.',
      icon: membership ? <ShieldCheck size={22} /> : <Users size={22} />,
      tone: membership ? 'from-sky-500 to-cyan-500' : 'from-violet-600 to-fuchsia-500',
      formTitle: membership ? 'Add membership control' : 'Add group record',
      titleLabel: membership ? 'Rule or control name' : 'Group or club name',
      titlePlaceholder: membership ? 'Invite-only alumni groups' : 'Robotics club / alumni circle / student council',
      requesterLabel: membership ? 'Applies to' : 'Member audience',
      requesterPlaceholder: membership ? 'Student groups, alumni, faculty, or all communities' : 'Students, alumni, faculty, or mixed community',
      ownerLabel: membership ? 'Rule owner' : 'Group moderator',
      ownerPlaceholder: membership ? 'Community admin or moderator' : 'Faculty moderator or group lead',
      detailsLabel: membership ? 'Rule details' : 'Group purpose and setup',
      detailsPlaceholder: membership ? 'Add eligibility, visibility, approval path, exception handling, and review cycle' : 'Add purpose, category, member rule, officer roles, activity plan, and visibility',
      sections: membership
        ? [
            { title: 'Eligibility Rules', detail: 'Define who can join and what proof or approval is required.', items: ['Role eligibility', 'Programme rule', 'Alumni access', 'Exception path'], icon: <KeyRound size={18} />, tone: 'from-sky-500 to-cyan-500' },
            { title: 'Visibility Rules', detail: 'Control public, private, invite-only, or hidden group access.', items: ['Public listing', 'Private group', 'Invite-only', 'Hidden'], icon: <Users size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
            { title: 'Approval Flow', detail: 'Route joins, role changes, and moderator requests.', items: ['Join request', 'Role request', 'Moderator approval', 'Escalation'], icon: <ClipboardList size={18} />, tone: 'from-amber-500 to-orange-500' },
            { title: 'Membership Audit', detail: 'Export active members, removed members, and approval history.', items: ['Active members', 'Removed members', 'Approval history', 'Export'], icon: <Database size={18} />, tone: 'from-emerald-500 to-teal-500' },
          ]
        : [
            { title: 'Profile Setup', detail: 'Create the group identity, category, purpose, and ownership.', items: ['Group name', 'Category', 'Purpose', 'Moderator'], icon: <Users size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
            { title: 'Member Register', detail: 'Track active members, officers, alumni, faculty, and pending joins.', items: ['Members', 'Officers', 'Pending joins', 'Alumni'], icon: <Database size={18} />, tone: 'from-sky-500 to-cyan-500' },
            { title: 'Activity Plan', detail: 'Plan meetings, announcements, polls, tasks, and events.', items: ['Meetings', 'Announcements', 'Polls', 'Events'], icon: <CalendarDays size={18} />, tone: 'from-emerald-500 to-teal-500' },
            { title: 'Directory Output', detail: 'Publish approved group profile and engagement summary.', items: ['Directory card', 'Visibility', 'Activity summary', 'Export'], icon: <BarChart3 size={18} />, tone: 'from-amber-500 to-orange-500' },
          ],
      controls: membership ? ['Membership rule', 'Visibility setting', 'Join approval', 'Exception review'] : ['Moderator assignment', 'Member approval', 'Group visibility', 'Activity permission'],
      outputs: membership ? ['Membership policy', 'Approval register', 'Visibility matrix', 'Membership export'] : ['Group profile', 'Member register', 'Activity report', 'Directory listing'],
      related: ['Student groups', 'Club memberships', 'Membership rules', 'Group visibility', 'Moderator roles', 'Community directory'],
    });
  }

  if (announcementRoutes.includes(slug)) {
    return makeCommunityLeafTemplate({
      eyebrow: 'Community / Announcement section',
      title: `${featureName} workspace`,
      summary: 'A publishing page for announcement copy, audience targeting, release approvals, read receipts, and communication outcomes.',
      icon: <MessageSquare size={22} />,
      tone: 'from-sky-500 to-cyan-500',
      formTitle: 'Add announcement work item',
      titleLabel: 'Announcement item',
      titlePlaceholder: 'Library notice / event reminder / deadline alert',
      requesterLabel: 'Audience',
      requesterPlaceholder: 'Students, alumni, faculty, parents, clubs, or selected group',
      ownerLabel: 'Publisher',
      ownerPlaceholder: 'Communication owner or moderator',
      detailsLabel: 'Copy and release details',
      detailsPlaceholder: 'Add message, audience, attachments, schedule, approval owner, and expected acknowledgement',
      sections: [
        { title: 'Message Copy', detail: 'Draft headline, body, attachments, and preview text.', items: ['Headline', 'Body copy', 'Attachments', 'Preview'], icon: <FileText size={18} />, tone: 'from-sky-500 to-cyan-500' },
        { title: 'Audience Targeting', detail: 'Choose exact groups, roles, departments, or communities.', items: ['Roles', 'Groups', 'Departments', 'Exclusions'], icon: <Users size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
        { title: 'Release Approval', detail: 'Approve sensitive notices and schedule the release window.', items: ['Approval owner', 'Schedule', 'Priority', 'Hold rule'], icon: <ShieldCheck size={18} />, tone: 'from-amber-500 to-orange-500' },
        { title: 'Reach Tracking', detail: 'Review read receipts, acknowledgement, and follow-up list.', items: ['Read status', 'Acknowledgement', 'Follow-up', 'Export'], icon: <BarChart3 size={18} />, tone: 'from-emerald-500 to-teal-500' },
      ],
      controls: ['Audience lock', 'Publisher role', 'Approval route', 'Release schedule'],
      outputs: ['Published announcement', 'Read receipt log', 'Audience reach report', 'Follow-up list'],
      related: ['Announcement copy', 'Audience targeting', 'Publish approval', 'Announcement reach', 'Community activity'],
    });
  }

  if (eventRoutes.includes(slug)) {
    return makeCommunityLeafTemplate({
      eyebrow: 'Community / Event section',
      title: `${featureName} workspace`,
      summary: 'A dedicated event page for scheduling, RSVP capacity, venue planning, invitation control, attendance, and participation output.',
      icon: <CalendarDays size={22} />,
      tone: 'from-emerald-500 to-teal-500',
      formTitle: 'Add event work item',
      titleLabel: 'Event item',
      titlePlaceholder: 'Guest talk / club meeting / alumni meetup',
      requesterLabel: 'Audience or group',
      requesterPlaceholder: 'Club, batch, alumni group, or community',
      ownerLabel: 'Event owner',
      ownerPlaceholder: 'Coordinator, moderator, or host',
      detailsLabel: 'Event details',
      detailsPlaceholder: 'Add venue, agenda, capacity, RSVP rule, materials, and attendance requirement',
      sections: [
        { title: 'Schedule Desk', detail: 'Set date, venue, agenda, reminders, and owner.', items: ['Date', 'Venue', 'Agenda', 'Reminder'], icon: <CalendarDays size={18} />, tone: 'from-emerald-500 to-teal-500' },
        { title: 'Capacity Desk', detail: 'Manage seats, waitlist, RSVP status, and entry access.', items: ['Seats', 'Waitlist', 'RSVP', 'Access'], icon: <Users size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
        { title: 'Invitation Desk', detail: 'Target the correct groups and publish calendar visibility.', items: ['Invites', 'Audience', 'Visibility', 'Reminder'], icon: <MessageSquare size={18} />, tone: 'from-sky-500 to-cyan-500' },
        { title: 'Participation Output', detail: 'Capture attendance, feedback, photos, and event result.', items: ['Attendance', 'Feedback', 'Photos', 'Report'], icon: <BarChart3 size={18} />, tone: 'from-amber-500 to-orange-500' },
      ],
      controls: ['Capacity limit', 'RSVP deadline', 'Host approval', 'Calendar visibility'],
      outputs: ['Event plan', 'Attendance register', 'Participation report', 'Feedback summary'],
      related: ['Event calendar', 'Schedule event', 'Event capacity', 'Event participation', 'Feedback window'],
    });
  }

  if (pollRoutes.includes(slug)) {
    return makeCommunityLeafTemplate({
      eyebrow: 'Community / Feedback section',
      title: `${featureName} workspace`,
      summary: 'A poll and feedback page for building questions, opening response windows, controlling audience, and producing insight reports.',
      icon: <ClipboardList size={22} />,
      tone: 'from-violet-600 to-fuchsia-500',
      formTitle: 'Add poll work item',
      titleLabel: 'Poll or feedback title',
      titlePlaceholder: 'Training feedback / club vote / service rating',
      requesterLabel: 'Response audience',
      requesterPlaceholder: 'Students, staff, club members, alumni, or selected group',
      ownerLabel: 'Feedback owner',
      ownerPlaceholder: 'Moderator or department owner',
      detailsLabel: 'Question and response details',
      detailsPlaceholder: 'Add questions, answer type, anonymous rule, open window, close date, and export need',
      sections: [
        { title: 'Question Design', detail: 'Build ratings, multiple choice, comments, and required questions.', items: ['Ratings', 'Choices', 'Comments', 'Required'], icon: <ClipboardList size={18} />, tone: 'from-violet-600 to-fuchsia-500' },
        { title: 'Response Window', detail: 'Open, close, pause, or target the feedback collection period.', items: ['Open date', 'Close date', 'Audience', 'Anonymous'], icon: <CalendarDays size={18} />, tone: 'from-sky-500 to-cyan-500' },
        { title: 'Response Monitor', detail: 'Track responses, missing groups, alerts, and moderation flags.', items: ['Response count', 'Missing groups', 'Flags', 'Reminders'], icon: <Users size={18} />, tone: 'from-emerald-500 to-teal-500' },
        { title: 'Insight Output', detail: 'Turn responses into charts, action owners, and export summaries.', items: ['Charts', 'Action owner', 'Summary', 'Export'], icon: <BarChart3 size={18} />, tone: 'from-amber-500 to-orange-500' },
      ],
      controls: ['Anonymous mode', 'One response rule', 'Close date', 'Result visibility'],
      outputs: ['Poll results', 'Feedback summary', 'Action list', 'Response export'],
      related: ['Poll builder', 'Open poll', 'Polls and feedback', 'Feedback window', 'Poll results'],
    });
  }

  return undefined;
}

function CommunityOperationPage({
  featureSlug,
  featureName,
  summary,
  records,
  statusCounts,
  relatedOperations,
  workspaceHref,
}: {
  featureSlug: string;
  featureName: string;
  summary: string;
  records: ModuleRecordRow[];
  statusCounts: Array<{ value: string; label: string; count: number }>;
  relatedOperations: string[];
  workspaceHref: string;
}) {
  const leaf = communityLeafTemplate(featureSlug, featureName);
  if (leaf) {
    return (
      <CommunityLeafPage
        featureSlug={featureSlug}
        featureName={featureName}
        template={leaf}
        records={records}
        statusCounts={statusCounts}
        workspaceHref={workspaceHref}
      />
    );
  }

  const template = communityTemplate(featureSlug, featureName);
  const page = (label: string) => `/modules/community/${slugifyWorkspace(label)}`;
  const connectedPages = Array.from(new Set([...template.quickLinks, ...template.controls, ...template.outputs, ...relatedOperations])).filter((item) => slugifyWorkspace(item) !== featureSlug);

  return (
    <div className="space-y-5">
      <section className={`overflow-hidden rounded-2xl bg-gradient-to-br ${template.tone} p-5 text-white shadow-sm`}>
        <Link href={workspaceHref} className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/80 hover:text-white">
          <ArrowLeft size={15} /> Back to Community
        </Link>
        <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_320px]">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/70">{template.eyebrow}</p>
            <h1 className="mt-2 break-words text-2xl font-extrabold text-white sm:text-3xl">{template.title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/78">{template.summary || summary}</p>
          </div>
          <div className="overflow-hidden rounded-2xl bg-white/14 p-2 ring-1 ring-white/18">
            <div className="erp-main-visual-frame">
              <img src="/images/community-main-workspace-rounded.png?v=1" alt="Community workspace visual" className="erp-main-visual-image community-main-workspace-image h-auto w-full object-contain object-center" />
            </div>
            <div className="px-2 pb-2 pt-3">
              <p className="text-sm font-bold text-white">Live Community Workspace</p>
              <p className="mt-1 text-xs leading-5 text-white/72">This page has its own sections, actions, records, controls, and output links.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Metric icon={<Database size={18} />} label="Saved records" value={String(records.length)} accent />
        <Metric icon={<ClipboardList size={18} />} label="Work stages" value={String(template.stages.length)} />
        <Metric icon={<ShieldCheck size={18} />} label="Controls" value={String(template.controls.length)} />
        <Metric icon={<BarChart3 size={18} />} label="Outputs" value={String(template.outputs.length)} />
      </div>

      <section className="grid gap-4 xl:grid-cols-[1.05fr_.95fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">{template.icon}</span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Operational flow</p>
              <h2 className="font-bold text-slate-950">Section-specific workflow</h2>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {template.stages.map((stage, index) => (
              <Link key={stage.title} href={stage.href} className="group min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-brand-300 hover:bg-white">
                <div className="flex items-start justify-between gap-3">
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${template.tone} text-xs font-black text-white`}>{index + 1}</span>
                  <ArrowRight size={15} className="shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-brand-600" />
                </div>
                <h3 className="mt-3 break-words text-sm font-extrabold text-slate-950">{stage.title}</h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">{stage.detail}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
              <Send size={18} />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Create</p>
              <h2 className="font-bold text-slate-950">{template.formTitle}</h2>
            </div>
          </div>
          <form action={createModuleRecord} className="mt-4 space-y-3">
            <input type="hidden" name="module" value="community" />
            <input type="hidden" name="feature" value={featureSlug} />
            <Field label={template.titleLabel}>
              <input name="title" required placeholder={template.titlePlaceholder} className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-500" />
            </Field>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label={template.requesterLabel}>
                <input name="requester" placeholder={template.requesterPlaceholder} className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-500" />
              </Field>
              <Field label={template.ownerLabel}>
                <input name="owner" placeholder={template.ownerPlaceholder} className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-500" />
              </Field>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Priority">
                <select name="priority" className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-500">
                  <option value="LOW">Low</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </Field>
              <Field label="Due date">
                <input name="dueDate" type="date" className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-500" />
              </Field>
            </div>
            <Field label={template.detailsLabel}>
              <textarea name="details" rows={4} placeholder={template.detailsPlaceholder} className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-500" />
            </Field>
            <button className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700 sm:w-auto">
              <Send size={16} /> Save
            </button>
          </form>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {template.panels.map((panel) => (
          <article key={panel.title} className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <Link href={panel.href} className={`group block bg-gradient-to-br ${panel.tone} p-4 text-white transition hover:brightness-110`}>
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/18 ring-1 ring-white/25">{panel.icon}</span>
              <span className="mt-4 flex min-w-0 items-center gap-2">
                <h2 className="min-w-0 break-words font-bold text-white">{panel.title}</h2>
                <ArrowRight size={14} className="shrink-0 opacity-75 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
              </span>
              <p className="mt-1 text-xs leading-5 text-white/75">{panel.note}</p>
            </Link>
            <div className="space-y-2 p-4">
              {panel.items.map((item) => (
                <Link key={item} href={page(item)} className="group flex min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition hover:border-brand-300 hover:bg-white hover:text-brand-600">
                  <CheckCircle2 size={15} className="shrink-0 text-brand-600" />
                  <span className="min-w-0 break-words">{item}</span>
                  <ArrowRight size={13} className="ml-auto shrink-0 text-slate-400 opacity-0 transition group-hover:opacity-100" />
                </Link>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-bold text-slate-950">{featureName} records</h2>
              <p className="mt-1 text-sm text-slate-500">Saved records for this exact Community page only.</p>
            </div>
            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-600">{records.length} saved</span>
          </div>
          {records.length ? (
            <div className="mt-4 space-y-3">
              {records.map((record) => (
                <article key={record.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-[11px] uppercase tracking-wide text-slate-400">REC-{shortRecordId(record.id)}</p>
                      <h3 className="mt-1 break-words font-semibold text-slate-900">{record.title}</h3>
                      {record.details && <p className="mt-1 break-words text-xs leading-5 text-slate-500">{record.details}</p>}
                    </div>
                    <span className={`shrink-0 rounded-full border px-2 py-1 text-[11px] font-medium ${statusClass(record.status)}`}>{record.status.replace('_', ' ')}</span>
                  </div>
                  <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2 xl:grid-cols-4">
                    <Info label={template.requesterLabel} value={record.requester || 'Not added'} />
                    <Info label={template.ownerLabel} value={record.owner || 'Not assigned'} />
                    <Info label="Priority" value={record.priority} />
                    <Info label="Due date" value={record.dueDate || 'No date'} />
                  </div>
                  <div className="mt-3 border-t border-slate-200 pt-3">
                    <RecordActions id={record.id} module="community" feature={featureSlug} status={record.status} compact />
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <Database className="mx-auto text-slate-300" size={34} />
              <h3 className="mt-3 font-semibold text-slate-900">No saved records yet</h3>
              <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">Use the page-specific form above to create the first {featureName.toLowerCase()} record.</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <CommunitySideList title="Controls" items={template.controls} icon={<ShieldCheck size={18} />} />
          <CommunitySideList title="Outputs" items={template.outputs} icon={<BarChart3 size={18} />} />
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-950">Status flow</h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {statusCounts.map((status) => (
                <div key={status.value} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{status.label}</p>
                  <p className="mt-2 text-2xl font-extrabold text-slate-950">{status.count}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-bold text-slate-950">Related Community pages</h2>
            <p className="mt-1 text-sm text-slate-500">These open different Community workspaces, not the repeated generic screen.</p>
          </div>
          <Link href="/community" className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-600">
            Community home <ArrowRight size={14} />
          </Link>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {connectedPages.slice(0, 16).map((item) => (
            <Link key={item} href={page(item)} className="group flex min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm transition hover:border-brand-400 hover:bg-white">
              <span className="h-2 w-2 shrink-0 rounded-full bg-aurora" />
              <span className="min-w-0 break-words font-medium text-slate-700">{item}</span>
              <ArrowRight size={14} className="ml-auto shrink-0 text-slate-400 opacity-0 transition group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function CommunityLeafPage({
  featureSlug,
  featureName,
  template,
  records,
  statusCounts,
  workspaceHref,
}: {
  featureSlug: string;
  featureName: string;
  template: CommunityLeafTemplate;
  records: ModuleRecordRow[];
  statusCounts: Array<{ value: string; label: string; count: number }>;
  workspaceHref: string;
}) {
  const page = (label: string) => `/modules/community/${slugifyWorkspace(label)}`;
  const childPage = (label: string) => `/modules/community/${featureSlug}/${slugifyWorkspace(label)}`;

  return (
    <div className="space-y-5">
      <section className={`overflow-hidden rounded-2xl bg-gradient-to-br ${template.tone} p-5 text-white shadow-sm`}>
        <Link href={workspaceHref} className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/80 hover:text-white">
          <ArrowLeft size={15} /> Back to Community
        </Link>
        <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_300px]">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/70">{template.eyebrow}</p>
            <h1 className="mt-2 break-words text-2xl font-extrabold text-white sm:text-3xl">{template.title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/78">{template.summary}</p>
          </div>
          <div className="overflow-hidden rounded-2xl bg-white/14 p-2 ring-1 ring-white/18">
            <div className="erp-main-visual-frame">
              <img src="/images/community-main-workspace-rounded.png?v=1" alt="Community workspace visual" className="erp-main-visual-image community-main-workspace-image h-auto w-full object-contain object-center" />
            </div>
            <div className="px-2 pb-2 pt-3">
              <p className="text-sm font-bold text-white">Dedicated Subpage</p>
              <p className="mt-1 text-xs leading-5 text-white/72">Every card below opens its own separate section page with isolated records.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Metric icon={<Database size={18} />} label="Saved records" value={String(records.length)} accent />
        <Metric icon={<ClipboardList size={18} />} label="Work sections" value={String(template.sections.length)} />
        <Metric icon={<ShieldCheck size={18} />} label="Controls" value={String(template.controls.length)} />
        <Metric icon={<BarChart3 size={18} />} label="Outputs" value={String(template.outputs.length)} />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">{template.icon}</span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">ERP sections</p>
            <h2 className="font-bold text-slate-950">{featureName} work areas</h2>
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {template.sections.map((section) => (
            <article key={section.title} className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <Link href={childPage(section.title)} className="group block">
                <span className={`grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br ${section.tone} text-white shadow-sm`}>{section.icon}</span>
                <span className="mt-4 flex items-start gap-2">
                  <h3 className="min-w-0 flex-1 break-words text-sm font-extrabold text-slate-950">{section.title}</h3>
                  <ArrowRight size={14} className="shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-brand-600" />
                </span>
                <p className="mt-1 text-xs leading-5 text-slate-500">{section.detail}</p>
              </Link>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {section.items.map((item) => (
                  <Link key={item} href={childPage(item)} className="inline-flex min-w-0 items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600 transition hover:border-brand-300 hover:text-brand-600">
                    <span className="min-w-0 break-words">{item}</span>
                    <ArrowRight size={11} className="shrink-0" />
                  </Link>
                ))}
              </div>
              <Link href={childPage(section.title)} className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-brand-600">
                Open separate page <ArrowRight size={13} />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[.95fr_1.05fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
              <Send size={18} />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Action form</p>
              <h2 className="font-bold text-slate-950">{template.formTitle}</h2>
            </div>
          </div>
          <form action={createModuleRecord} className="mt-4 space-y-3">
            <input type="hidden" name="module" value="community" />
            <input type="hidden" name="feature" value={featureSlug} />
            <Field label={template.titleLabel}>
              <input name="title" required placeholder={template.titlePlaceholder} className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-500" />
            </Field>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label={template.requesterLabel}>
                <input name="requester" placeholder={template.requesterPlaceholder} className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-500" />
              </Field>
              <Field label={template.ownerLabel}>
                <input name="owner" placeholder={template.ownerPlaceholder} className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-500" />
              </Field>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Priority">
                <select name="priority" className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-500">
                  <option value="LOW">Low</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </Field>
              <Field label="Due date">
                <input name="dueDate" type="date" className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-500" />
              </Field>
            </div>
            <Field label={template.detailsLabel}>
              <textarea name="details" rows={4} placeholder={template.detailsPlaceholder} className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-500" />
            </Field>
            <button className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700 sm:w-auto">
              <Send size={16} /> Save
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-bold text-slate-950">{featureName} register</h2>
              <p className="mt-1 text-sm text-slate-500">Records saved only for this exact Community subpage.</p>
            </div>
            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-600">{records.length} saved</span>
          </div>
          {records.length ? (
            <div className="mt-4 space-y-3">
              {records.map((record) => (
                <article key={record.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-[11px] uppercase tracking-wide text-slate-400">REC-{shortRecordId(record.id)}</p>
                      <h3 className="mt-1 break-words font-semibold text-slate-900">{record.title}</h3>
                    </div>
                    <span className={`shrink-0 rounded-full border px-2 py-1 text-[11px] font-medium ${statusClass(record.status)}`}>{record.status.replace('_', ' ')}</span>
                  </div>
                  <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                    <Info label={template.requesterLabel} value={record.requester || 'Not added'} />
                    <Info label={template.ownerLabel} value={record.owner || 'Not assigned'} />
                    <Info label="Priority" value={record.priority} />
                    <Info label="Due date" value={record.dueDate || 'No date'} />
                  </div>
                  {record.details && <p className="mt-3 break-words rounded-lg bg-white px-3 py-2 text-xs leading-5 text-slate-500">{record.details}</p>}
                  <div className="mt-3 border-t border-slate-200 pt-3">
                    <RecordActions id={record.id} module="community" feature={featureSlug} status={record.status} compact />
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <Database className="mx-auto text-slate-300" size={34} />
              <h3 className="mt-3 font-semibold text-slate-900">No saved records yet</h3>
              <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">Use the action form to create the first {featureName.toLowerCase()} record.</p>
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <CommunitySideList title="Controls" items={template.controls} icon={<ShieldCheck size={18} />} baseHref={`/modules/community/${featureSlug}`} />
        <CommunitySideList title="Outputs" items={template.outputs} icon={<BarChart3 size={18} />} baseHref={`/modules/community/${featureSlug}`} />
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
              <ArrowRight size={18} />
            </span>
            <h2 className="break-words font-bold text-slate-950">Related pages</h2>
          </div>
          <div className="mt-3 space-y-2">
            {template.related.filter((item) => slugifyWorkspace(item) !== featureSlug).slice(0, 6).map((item) => (
              <Link key={item} href={page(item)} className="group flex min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition hover:border-brand-300 hover:bg-white hover:text-brand-600">
                <span className="h-2 w-2 shrink-0 rounded-full bg-aurora" />
                <span className="min-w-0 break-words">{item}</span>
                <ArrowRight size={13} className="ml-auto shrink-0 text-slate-400 opacity-0 transition group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-bold text-slate-950">Status summary</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {statusCounts.map((status) => (
            <div key={status.value} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{status.label}</p>
              <p className="mt-2 text-2xl font-extrabold text-slate-950">{status.count}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function CommunitySideList({ title, items, icon, baseHref = '/modules/community' }: { title: string; items: string[]; icon: ReactNode; baseHref?: string }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">{icon}</span>
        <h2 className="break-words font-bold text-slate-950">{title}</h2>
      </div>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <Link key={item} href={`${baseHref}/${slugifyWorkspace(item)}`} className="group flex min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition hover:border-brand-300 hover:bg-white hover:text-brand-600">
            <CheckCircle2 size={15} className="shrink-0 text-brand-600" />
            <span className="min-w-0 break-words">{item}</span>
            <ArrowRight size={13} className="ml-auto shrink-0 text-slate-400 opacity-0 transition group-hover:opacity-100" />
          </Link>
        ))}
      </div>
    </section>
  );
}

function HelpCentreFeaturePage({ featureSlug }: { featureSlug: string }) {
  const guide = getHelpFeatureConfig(featureSlug);
  const childHref = (label: string) => helpChildHref(featureSlug, label);

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1fr_300px]">
          <div className="p-5 sm:p-6">
            <Link href="/help-centre" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-brand-600">
              <ArrowLeft size={15} /> Back to Help Centre
            </Link>
            <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-brand-600">{guide.eyebrow}</p>
            <h1 className="mt-2 break-words text-2xl font-extrabold text-slate-950 sm:text-3xl">{guide.title}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{guide.summary}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href={guide.primaryHref} className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700">
                {guide.primaryAction} <ArrowRight size={15} />
              </Link>
              <Link href="/search?q=help" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-white">
                Search guides
              </Link>
            </div>
          </div>
          <aside className="border-t border-slate-200 bg-slate-50 p-5 lg:border-l lg:border-t-0">
            <div className="grid gap-3">
              <HelpStat label="Published articles" value="0" note="Real article count only" />
              <HelpStat label="Guide sections" value={String(guide.sections.length)} note="Structured help blocks" />
              <HelpStat label="Related pages" value={String(guide.related.length)} note="Correct next links" />
            </div>
          </aside>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.08fr_.92fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
              <ClipboardList size={18} />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Section guide</p>
              <h2 className="font-bold text-slate-950">What this section includes</h2>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {guide.sections.map((section) => (
              <article key={section.title} className="group min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-brand-300 hover:bg-white hover:shadow-sm">
                <Link href={childHref(section.title)} className="flex min-w-0 items-start justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block break-words text-sm font-extrabold text-slate-950">{section.title}</span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">{section.summary}</span>
                  </span>
                  <ArrowRight size={16} className="shrink-0 text-slate-400 transition group-hover:text-brand-600" />
                </Link>
                <div className="mt-3 space-y-2">
                  {section.items.map((item) => (
                    <Link key={item} href={childHref(item)} className="group/row flex min-w-0 items-center gap-2 text-xs text-slate-600 transition hover:text-brand-600">
                      <CheckCircle2 size={14} className="shrink-0 text-brand-600" />
                      <span className="min-w-0 break-words">{item}</span>
                      <ArrowRight size={12} className="ml-auto shrink-0 opacity-0 transition group-hover/row:opacity-100" />
                    </Link>
                  ))}
                </div>
                <Link href={childHref(section.title)} className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand-600">
                  Open section <ArrowRight size={13} />
                </Link>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
              <ShieldCheck size={18} />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Workflow</p>
              <h2 className="font-bold text-slate-950">Recommended steps</h2>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {guide.workflow.map((step, index) => (
              <div key={step.title} className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-600 text-xs font-bold text-white">{index + 1}</span>
                <div className="min-w-0">
                  <h3 className="break-words text-sm font-bold text-slate-950">{step.title}</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[.9fr_1.1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
              <FileText size={18} />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">FAQ</p>
              <h2 className="font-bold text-slate-950">Common questions</h2>
            </div>
          </div>
          <div className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200">
            {guide.faq.map((item) => (
              <Link key={item} href={childHref(item)} className="flex min-w-0 items-center gap-3 px-3 py-3 text-sm transition hover:bg-slate-50">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-slate-100 text-brand-600">
                  <FileText size={14} />
                </span>
                <span className="min-w-0 flex-1 break-words font-medium text-slate-700">{item}</span>
                <ArrowRight size={15} className="shrink-0 text-slate-400" />
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
              <ArrowRight size={18} />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Next pages</p>
              <h2 className="font-bold text-slate-950">Correct related sections</h2>
            </div>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {guide.related.map((item) => (
              <Link key={item} href={helpRelatedHref(item)} className="group flex min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm transition hover:border-brand-300 hover:bg-white">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white text-brand-600 shadow-sm">
                  <ArrowRight size={14} />
                </span>
                <span className="min-w-0 flex-1 break-words font-semibold text-slate-700">{item}</span>
              </Link>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-500">
            Article count stays at 0 until real published articles are added. These are guide pages and support paths, not fake article records.
          </div>
        </div>
      </section>
    </div>
  );
}

function HelpStat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-extrabold text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{note}</p>
    </div>
  );
}

function Metric({ icon, label, value, accent }: { icon: ReactNode; label: string; value: string; accent?: boolean }) {
  return (
    <div className={`min-w-0 rounded-xl p-4 shadow-sm ${accent ? 'premium-kpi-accent bg-aurora text-white' : 'premium-kpi glass'}`}>
      <div className="flex items-center justify-between">
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${accent ? 'bg-white/20' : 'bg-brand-50 text-brand-600'}`}>{icon}</span>
      </div>
      <p className={`mt-3 break-words text-sm ${accent ? 'text-white/80' : 'text-slate-500'}`}>{label}</p>
      <p className="break-words text-2xl font-extrabold">{value}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block min-w-0">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <div className="mt-1">{children}</div>
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

function WorkspacePanel({ moduleSlug, featureSlug, id, icon, title, items }: { moduleSlug?: string; featureSlug?: string; id?: string; icon: ReactNode; title: string; items: string[] }) {
  return (
    <section id={id} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">{icon}</span>
        <h2 className="break-words font-bold text-slate-950">{title}</h2>
      </div>
      <div className="mt-4 space-y-2">
        {items.slice(0, 6).map((item) =>
          moduleSlug ? (
            <Link key={item} href={`/modules/${moduleSlug}${featureSlug ? `/${featureSlug}` : ''}/${slugifyWorkspace(item)}`} className="group flex min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition hover:border-brand-300 hover:bg-white hover:text-brand-600">
              <CheckCircle2 size={15} className="shrink-0 text-brand-600" />
              <span className="min-w-0 break-words">{item}</span>
              <ArrowRight size={13} className="ml-auto shrink-0 text-slate-400 opacity-0 transition group-hover:opacity-100" />
            </Link>
          ) : (
            <div key={item} className="flex min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              <CheckCircle2 size={15} className="shrink-0 text-brand-600" />
              <span className="min-w-0 break-words">{item}</span>
            </div>
          ),
        )}
      </div>
    </section>
  );
}
