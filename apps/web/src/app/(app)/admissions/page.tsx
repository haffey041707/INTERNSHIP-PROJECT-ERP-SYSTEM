import { ERPModulePage } from '@/components/ERPModulePage';

export default function AdmissionsPage() {
  return (
    <ERPModulePage
      eyebrow="Enrollment operations"
      title="Admissions"
      moduleSlug="admissions"
      description="Manage enquiries, applications, interviews, offers, and enrollment conversion from one controlled admissions workspace."
      stats={[
        { label: 'Open enquiries', value: '42' },
        { label: 'Applications', value: '18' },
        { label: 'Interviews', value: '7' },
        { label: 'Offer rate', value: '68%' },
      ]}
      sections={[
        { title: 'Pipeline', items: ['Lead capture', 'Application review', 'Interview scheduling', 'Offer letters'] },
        { title: 'Applicant Records', items: ['Guardian details', 'Documents checklist', 'Eligibility notes', 'Admission history'] },
        { title: 'Conversion', items: ['Fee deposit tracking', 'Class placement', 'Welcome tasks', 'Enrollment reports'] },
      ]}
    />
  );
}
