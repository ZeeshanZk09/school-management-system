import { requirePermission } from "@/lib/auth/permissions";
import prisma from "@/lib/prisma";
import SettingsForm from "./settings-form";

export default async function SettingsPage() {
  await requirePermission("system.manage");

  const settings = await prisma.systemSettings.findFirst();

  return <SettingsForm initialData={settings} />;
}
