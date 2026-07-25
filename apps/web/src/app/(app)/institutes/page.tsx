import { ERPModulePage } from '@/components/ERPModulePage';
import { requireCurrentInstitutionSuite } from '@/lib/current-institution-suite';
import { getMainWorkspace } from '@/lib/main-workspaces';

export default async function InstitutesPage() {
  await requireCurrentInstitutionSuite('/institutes');
  const workspace = getMainWorkspace('institutes')!;

  return (
    <ERPModulePage
      eyebrow={workspace.eyebrow}
      title={workspace.title}
      moduleSlug="institutes"
      description={workspace.description}
      stats={workspace.stats}
      workflow={workspace.workflow}
      quickActions={workspace.quickActions}
      reports={workspace.reports}
      sections={workspace.sections}
    />
  );
}
