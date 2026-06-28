import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { hasValidSession } from "@/lib/cookies";
import { ROUTES } from "@/shared/constants";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await hasValidSession())) {
    redirect(ROUTES.LOGIN);
  }

  return <AppShell>{children}</AppShell>;
}