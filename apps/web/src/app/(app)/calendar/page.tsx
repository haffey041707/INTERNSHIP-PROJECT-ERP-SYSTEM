import { ERPModulePage } from '@/components/ERPModulePage';

export default function CalendarPage() {
  return (
    <ERPModulePage
      eyebrow="Institution schedule"
      title="Calendar"
      moduleSlug="calendar"
      description="Coordinate academic calendars, events, meetings, holidays, exam windows, and operational reminders."
      stats={[
        { label: 'Events', value: '38' },
        { label: 'This week', value: '9' },
        { label: 'Exam windows', value: '3' },
        { label: 'Holidays', value: '14' },
      ]}
      sections={[
        { title: 'Academic Calendar', items: ['Term dates', 'Exam schedules', 'Holidays', 'Result days'] },
        { title: 'Operations', items: ['Meetings', 'Transport events', 'Fee deadlines', 'Maintenance windows'] },
        { title: 'Communication', items: ['Audience targeting', 'Event reminders', 'Calendar exports', 'Announcement links'] },
      ]}
    />
  );
}
