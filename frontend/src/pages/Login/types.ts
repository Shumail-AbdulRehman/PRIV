
export type LoginForm={
  email: string;
  password: string;
  role: "Staff" | "Manager"
}


export type UserRole = 'MANAGER' | 'STAFF';


export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  companyId: number;
}
