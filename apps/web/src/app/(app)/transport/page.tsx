import { ERPModulePage } from '@/components/ERPModulePage';

export default function TransportPage() {
  return (
    <ERPModulePage
      eyebrow="Route operations"
      title="Transport"
      moduleSlug="transport"
      description="Coordinate routes, vehicles, drivers, student pickup points, fees, and operational checks for daily transport."
      stats={[
        { label: 'Routes', value: '14' },
        { label: 'Vehicles', value: '22' },
        { label: 'Riders', value: '610' },
        { label: 'Utilization', value: '81%' },
      ]}
      sections={[
        { title: 'Route Planning', items: ['Route map', 'Stops', 'Pickup assignment', 'Capacity balancing'] },
        { title: 'Fleet', items: ['Vehicle register', 'Driver assignment', 'Maintenance schedule', 'Fuel logs'] },
        { title: 'Operations', items: ['Daily trip sheet', 'Transport fees', 'Incident records', 'Guardian notifications'] },
      ]}
    />
  );
}
