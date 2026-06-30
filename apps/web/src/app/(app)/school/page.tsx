import { ERPModulePage } from '@/components/ERPModulePage';
import { requireCurrentInstitutionSuite } from '@/lib/current-institution-suite';

export default async function SchoolPage() {
  const suite = await requireCurrentInstitutionSuite('/school');

  return (
    <ERPModulePage
      eyebrow={suite.eyebrow}
      title={suite.title}
      moduleSlug="school"
      description={suite.description}
      stats={suite.stats}
      sections={suite.sections}
    />
  );
}
