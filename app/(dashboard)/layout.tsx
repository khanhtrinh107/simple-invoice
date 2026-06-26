import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getAuthTokens } from "@/lib/cookies";
import { ROUTES } from "@/shared/constants";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tokens = await getAuthTokens();

  if (!tokens) {
    redirect(ROUTES.LOGIN);
  }

  return <AppShell>{children}</AppShell>;
}