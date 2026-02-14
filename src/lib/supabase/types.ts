export type UserRole = 'customer' | 'admin' | 'affiliate';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}
