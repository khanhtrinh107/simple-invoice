import { NextResponse } from "next/server";
import { fetchUserProfile } from "@/features/auth/api/auth-api";
import {
  clearAuthCookies,
  getAuthTokens,
  refreshAccessToken,
} from "@/lib/cookies";

export async function GET() {
  const tokens = await getAuthTokens();

  if (!tokens) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const profile = await fetchUserProfile(tokens.accessToken);
    return NextResponse.json({
      user: {
        id: profile.id,
        username: profile.username,
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        phoneNumber: profile.phoneNumber,
        memberships: profile.memberships.map((m) => ({
          id: m.id,
          organisationId: m.organisationId,
          name: m.name,
          role: m.role,
        })),
        roles: profile.roles,
      },
    });
  } catch (err) {
    const isAuthFailure =
      err instanceof Error &&
      (err.message.includes("401") ||
        err.message.toLowerCase().includes("unauthorized"));

    if (!isAuthFailure) {
      return NextResponse.json(
        { error: "Failed to fetch user profile" },
        { status: 500 }
      );
    }

    // access_token expired — attempt a silent refresh.
    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      await clearAuthCookies();
      return NextResponse.json(
        { error: "Session expired" },
        { status: 401 }
      );
    }

    try {
      const profile = await fetchUserProfile(refreshed.accessToken);
      return NextResponse.json({
        user: {
          id: profile.id,
          username: profile.username,
          email: profile.email,
          firstName: profile.firstName,
          lastName: profile.lastName,
          phoneNumber: profile.phoneNumber,
          memberships: profile.memberships.map((m) => ({
            id: m.id,
            organisationId: m.organisationId,
            name: m.name,
            role: m.role,
          })),
          roles: profile.roles,
        },
        refreshed: true,
      });
    } catch (refreshErr) {
      const message =
        refreshErr instanceof Error
          ? refreshErr.message
          : "Failed to fetch user profile after token refresh";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }
}
