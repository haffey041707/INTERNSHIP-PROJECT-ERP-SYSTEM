import { ERPModulePage } from '@/components/ERPModulePage';
import { requireCurrentInstitutionSuite } from '@/lib/current-institution-suite';

export default async function CollegesPage() {
  const suite = await requireCurrentInstitutionSuite('/colleges');

  return (
    <ERPModulePage
      eyebrow={suite.eyebrow}
      title={suite.title}
      moduleSlug="colleges"
      description={suite.description}
      stats={suite.stats}
      sections={suite.sections}
    />
  );
}
