import { ERPModulePage } from '@/components/ERPModulePage';

export default function DocumentsPage() {
  return (
    <ERPModulePage
      eyebrow="Records office"
      title="Documents"
      moduleSlug="documents"
      description="Centralize student, staff, finance, and institutional documents with approvals, expiry tracking, and secure access."
      stats={[
        { label: 'Files', value: '18.6k' },
        { label: 'Pending review', value: '34' },
        { label: 'Expiring soon', value: '12' },
        { label: 'Templates', value: '27' },
      ]}
      sections={[
        { title: 'Document Library', items: ['Student records', 'Staff documents', 'Finance files', 'Policy archive'] },
        { title: 'Approval Flow', items: ['Upload review', 'Version control', 'Expiry alerts', 'Access permissions'] },
        { title: 'Templates', items: ['Certificates', 'Letters', 'Forms', 'Bulk generation'] },
      ]}
    />
  );
}
