import { ERPModulePage } from '@/components/ERPModulePage';

export default function HelpDeskPage() {
  return (
    <ERPModulePage
      eyebrow="Service management"
      title="Help Desk"
      moduleSlug="help-desk"
      description="Capture and resolve requests from staff, students, parents, and departments with ownership and SLA tracking."
      stats={[
        { label: 'Open tickets', value: '26' },
        { label: 'Urgent', value: '4' },
        { label: 'SLA met', value: '93%' },
        { label: 'Avg response', value: '2h' },
      ]}
      sections={[
        { title: 'Ticket Intake', items: ['Parent requests', 'Staff issues', 'Department queues', 'Priority levels'] },
        { title: 'Resolution', items: ['Assignment rules', 'Internal notes', 'SLA tracking', 'Escalations'] },
        { title: 'Knowledge Base', items: ['Help articles', 'Reusable replies', 'Issue trends', 'Service reports'] },
      ]}
    />
  );
}
