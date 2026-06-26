/**
 * Snake-case types — mirror the wire format returned by
 * the membership service so we can map them in one place.
 */
export interface MembershipRaw {
  membershipId: string;
  organisationId: string;
  organisationName: string;
  roleName: string;
  token: string;
  organisationNumber?: string;
  companyNumber?: string;
  organisationRole?: string;
}

export interface CustomField {
  customFieldId: string;
  customKey: string;
  customValue: string;
}

export interface Role {
  roleId: string;
  roleName: string;
  permissions?: string[];
  type?: string;
  entityId?: string;
}

export interface Contact {
  type?: string;
  value?: string;
  isPrimary?: boolean;
  verified?: boolean;
}

export interface Address {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  type?: string;
}

export interface UserProfileRaw {
  userId: string;
  userName: string;
  firstName?: string;
  lastName?: string;
  mobileNumber?: string;
  email?: string;
  isUSCitizen?: boolean;
  status?: string;
  isDeleted?: boolean;
  lastLoginAt?: string;
  contacts?: Contact[];
  addresses?: Address[];
  listCustomFields?: CustomField[];
  employmentDetails?: unknown[];
  taxDetails?: unknown[];
  memberships?: MembershipRaw[];
  orgRelationships?: unknown[];
  kycDetails?: { documents?: unknown[] };
  apps?: { appName: string; onboardingAt?: string }[];
  listRoles?: string[];
  permissions?: string[];
  segments?: unknown[];
  creditDetails?: unknown[];
  createdAt?: string;
  passwordExpired?: boolean;
  updatedAt?: string;
  cif?: string;
  devices?: unknown[];
  roles?: Role[];
}

export interface UserProfileResponse {
  data: UserProfileRaw;
}

/**
 * OIDC token endpoint response — snake_case as defined by RFC 6749/6750.
 */
export interface OidcTokenResponse {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

export interface IdTokenPayload {
  sub: string;
  userid?: string;
  email?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  name?: string;
  org_id?: string;
  org_name?: string;
  aud?: string | string[];
  iss?: string;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

/**
 * App-facing camelCase shapes.
 */
export interface Membership {
  id: string;
  organisationId: string;
  name: string;
  role: string;
  organisationRole?: string;
  /** JWT scoped to this membership — used as the org_token cookie. */
  token: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  isUSCitizen?: boolean;
  status?: string;
  memberships: Membership[];
  roles: string[];
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface TokenResponse {
  accessToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface LoginResponse {
  user: Pick<UserProfile, "id" | "username" | "email" | "firstName" | "lastName">;
}

export interface AuthTokens {
  accessToken: string;
  orgToken: string;
}
