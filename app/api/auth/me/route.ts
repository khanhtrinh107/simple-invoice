import { NextResponse } from "next/server";
import { fetchUserProfile } from "@/features/auth/api/auth-api";
import { getAuthTokens } from "@/lib/cookies";

export async function GET() {
  const tokens = await getAuthTokens();

  if (!tokens) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const profile = await fetchUserProfile(tokens.accessToken);
    return NextResponse.json(
      {
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
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}
