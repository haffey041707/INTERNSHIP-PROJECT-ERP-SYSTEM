import { ERPModulePage } from '@/components/ERPModulePage';

export default function HostelPage() {
  return (
    <ERPModulePage
      eyebrow="Residential management"
      title="Hostel"
      moduleSlug="hostel"
      description="Track rooms, occupancy, wardens, meals, leave passes, visitors, and hostel fee operations."
      stats={[
        { label: 'Rooms', value: '96' },
        { label: 'Occupancy', value: '78%' },
        { label: 'Leave passes', value: '12' },
        { label: 'Visitors', value: '31' },
      ]}
      sections={[
        { title: 'Accommodation', items: ['Room allocation', 'Bed capacity', 'Warden assignment', 'Room transfer'] },
        { title: 'Student Care', items: ['Leave passes', 'Visitor register', 'Meal plans', 'Health notes'] },
        { title: 'Administration', items: ['Hostel fees', 'Inventory checks', 'Incident records', 'Occupancy reports'] },
      ]}
    />
  );
}
