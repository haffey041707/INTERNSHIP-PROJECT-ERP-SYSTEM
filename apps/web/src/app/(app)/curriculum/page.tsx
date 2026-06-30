import { ERPModulePage } from '@/components/ERPModulePage';

export default function CurriculumPage() {
  return (
    <ERPModulePage
      eyebrow="Academic planning"
      title="Curriculum"
      moduleSlug="curriculum"
      description="Organize course plans, syllabus coverage, learning outcomes, assessments, and teaching resources across grades."
      stats={[
        { label: 'Courses', value: '24' },
        { label: 'Outcomes', value: '118' },
        { label: 'Resources', value: '340' },
        { label: 'Coverage', value: '74%' },
      ]}
      sections={[
        { title: 'Planning', items: ['Course structure', 'Term-wise syllabus', 'Learning outcomes', 'Lesson sequencing'] },
        { title: 'Teaching Resources', items: ['Lesson material', 'Assignments', 'Reference files', 'Resource approval'] },
        { title: 'Quality Review', items: ['Coverage tracking', 'Assessment mapping', 'Department review', 'Curriculum reports'] },
      ]}
    />
  );
}
