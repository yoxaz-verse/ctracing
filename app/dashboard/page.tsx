import { getSessionProfile, redirectForRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardIndexPage() {
  const { profile } = await getSessionProfile();
  redirectForRole(profile.role);
}
