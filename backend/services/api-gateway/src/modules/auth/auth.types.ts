export type UserRole = 'learner' | 'domain_expert' | 'admin';

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string | null;
  fullName: string;
  role: UserRole;
  avatarUrl: string | null;
  oauthProvider: string | null;
  oauthProviderId: string | null;
  preferredLanguage: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}
