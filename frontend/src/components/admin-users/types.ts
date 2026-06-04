export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: 'ADM' | 'SELLER';
  is_active: boolean;
  must_change_password: boolean;
  password_reset_requested_at?: string | null;
}
