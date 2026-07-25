import { ERPModulePage } from '@/components/ERPModulePage';
import { requireCurrentInstitutionSuite } from '@/lib/current-institution-suite';
import { getMainWorkspace } from '@/lib/main-workspaces';

export default async function SchoolPage() {
  await requireCurrentInstitutionSuite('/school');
  const workspace = getMainWorkspace('school')!;

  return (
    <ERPModulePage
      eyebrow={workspace.eyebrow}
      title={workspace.title}
      moduleSlug="school"
      description={workspace.description}
      stats={workspace.stats}
      workflow={workspace.workflow}
      quickActions={workspace.quickActions}
      reports={workspace.reports}
      sections={workspace.sections}
    />
  );
}
