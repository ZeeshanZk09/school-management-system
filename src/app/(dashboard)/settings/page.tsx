import { requirePermission } from '@/lib/auth/permissions';
import { getSystemSettings } from '@/lib/settings';
import SettingsForm from './settings-form';

export default async function SettingsPage() {
  await requirePermission('system.manage');

  const settings = await getSystemSettings();

  return <SettingsForm initialData={settings} />;
}
