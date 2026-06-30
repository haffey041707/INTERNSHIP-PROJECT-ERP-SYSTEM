import { ERPModulePage } from '@/components/ERPModulePage';

export default function AssetsPage() {
  return (
    <ERPModulePage
      eyebrow="Asset lifecycle"
      title="Assets"
      moduleSlug="assets"
      description="Maintain asset registers, ownership, location, warranty, service plans, depreciation, and disposal records."
      stats={[
        { label: 'Assets', value: '2.8k' },
        { label: 'Maintenance due', value: '17' },
        { label: 'Warranty alerts', value: '11' },
        { label: 'Utilization', value: '88%' },
      ]}
      sections={[
        { title: 'Asset Register', items: ['Asset tagging', 'Location mapping', 'Custodian assignment', 'Warranty records'] },
        { title: 'Maintenance', items: ['Service schedules', 'Repair tickets', 'Downtime logs', 'Vendor service notes'] },
        { title: 'Financial Control', items: ['Depreciation', 'Asset transfer', 'Disposal approval', 'Asset reports'] },
      ]}
    />
  );
}
