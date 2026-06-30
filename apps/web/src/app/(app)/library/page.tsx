import { ERPModulePage } from '@/components/ERPModulePage';

export default function LibraryPage() {
  return (
    <ERPModulePage
      eyebrow="Learning resources"
      title="Library"
      moduleSlug="library"
      description="Manage catalogues, circulation, reservations, fines, digital resources, and reading activity for students and staff."
      stats={[
        { label: 'Books', value: '8.4k' },
        { label: 'Issued', value: '312' },
        { label: 'Overdue', value: '19' },
        { label: 'Reservations', value: '27' },
      ]}
      sections={[
        { title: 'Catalogue', items: ['Book records', 'ISBN lookup', 'Categories', 'Digital resources'] },
        { title: 'Circulation', items: ['Issue and return', 'Reservations', 'Overdue tracking', 'Fine rules'] },
        { title: 'Engagement', items: ['Reading history', 'Popular titles', 'Class reading lists', 'Library reports'] },
      ]}
    />
  );
}
