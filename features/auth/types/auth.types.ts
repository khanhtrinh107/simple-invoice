export interface Membership {
  id: string;
  name: string;
  role: string;
  token: string;
  planName?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  memberships: Membership[];
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
  accessToken: string;
}

export interface AuthTokens {
  accessToken: string;
  orgToken: string;
}
