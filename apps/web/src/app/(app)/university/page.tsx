import { ERPModulePage } from '@/components/ERPModulePage';
import { requireCurrentInstitutionSuite } from '@/lib/current-institution-suite';

export default async function UniversityPage() {
  const suite = await requireCurrentInstitutionSuite('/university');

  return (
    <ERPModulePage
      eyebrow={suite.eyebrow}
      title={suite.title}
      moduleSlug="university"
      description={suite.description}
      stats={suite.stats}
      sections={suite.sections}
    />
  );
}
