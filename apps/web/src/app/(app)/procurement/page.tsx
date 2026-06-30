import { ERPModulePage } from '@/components/ERPModulePage';

export default function ProcurementPage() {
  return (
    <ERPModulePage
      eyebrow="Purchase management"
      title="Procurement"
      moduleSlug="procurement"
      description="Run requisitions, vendor comparisons, approvals, purchase orders, deliveries, and invoice matching."
      stats={[
        { label: 'Requisitions', value: '23' },
        { label: 'Pending approvals', value: '8' },
        { label: 'Vendors', value: '64' },
        { label: 'PO value', value: '$42k' },
      ]}
      sections={[
        { title: 'Request to Order', items: ['Purchase requisitions', 'Approval chain', 'Quotation comparison', 'Purchase orders'] },
        { title: 'Vendor Desk', items: ['Vendor profile', 'Rate cards', 'Performance notes', 'Compliance documents'] },
        { title: 'Receiving', items: ['Goods receipt', 'Invoice matching', 'Returns', 'Procurement reports'] },
      ]}
    />
  );
}
