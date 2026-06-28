import { redirect } from "next/navigation";
import { hasValidSession } from "@/lib/cookies";
import { ROUTES } from "@/shared/constants";

export default async function HomePage() {
  redirect((await hasValidSession()) ? ROUTES.INVOICES : ROUTES.LOGIN);
}