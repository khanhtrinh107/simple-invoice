import { redirect } from "next/navigation";
import { getAuthTokens } from "@/lib/cookies";
import { ROUTES } from "@/shared/constants";

export default async function HomePage() {
  const tokens = await getAuthTokens();
  redirect(tokens ? ROUTES.INVOICES : ROUTES.LOGIN);
}