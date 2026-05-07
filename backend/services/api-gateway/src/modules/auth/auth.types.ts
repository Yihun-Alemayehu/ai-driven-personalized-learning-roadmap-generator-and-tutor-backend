export type UserRole = 'learner' | 'instructor' | 'admin' | 'domain_expert';

export interface UserRecord {
  id: string;
  email: string;
  password_hash: string | null;
  full_name: string;
  role: UserRole;
  avatar_url: string | null;
  oauth_provider: string | null;
  oauth_provider_id: string | null;
  preferred_language: string;
  created_at: Date;
  updated_at: Date;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}
