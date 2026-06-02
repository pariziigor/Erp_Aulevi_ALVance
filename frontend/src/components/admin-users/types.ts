export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: 'ADM' | 'SELLER';
  is_active: boolean;
}
