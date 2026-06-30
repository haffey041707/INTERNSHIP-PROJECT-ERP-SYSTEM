import { ERPModulePage } from '@/components/ERPModulePage';
import { requireCurrentInstitutionSuite } from '@/lib/current-institution-suite';

export default async function InstitutesPage() {
  const suite = await requireCurrentInstitutionSuite('/institutes');

  return (
    <ERPModulePage
      eyebrow={suite.eyebrow}
      title={suite.title}
      moduleSlug="institutes"
      description={suite.description}
      stats={suite.stats}
      sections={suite.sections}
    />
  );
}
