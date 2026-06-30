import { ERPModulePage } from '@/components/ERPModulePage';

export default function InventoryPage() {
  return (
    <ERPModulePage
      eyebrow="Stock control"
      title="Inventory"
      moduleSlug="inventory"
      description="Control stock, stores, issue requests, reorder levels, consumables, and department-level usage."
      stats={[
        { label: 'Stock items', value: '1.2k' },
        { label: 'Low stock', value: '16' },
        { label: 'Requests', value: '28' },
        { label: 'Stores', value: '5' },
      ]}
      sections={[
        { title: 'Stock Register', items: ['Item catalogue', 'Stock levels', 'Batch tracking', 'Reorder rules'] },
        { title: 'Issue Workflow', items: ['Department requests', 'Approvals', 'Issue notes', 'Return tracking'] },
        { title: 'Controls', items: ['Stock adjustments', 'Audit trail', 'Store transfers', 'Consumption reports'] },
      ]}
    />
  );
}
