export interface Role {
  _id: string;
  name: string;
  description?: string;
  isDeleted: boolean;
}

export interface User {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role: Role | string;
  isActive: boolean;
  addresses?: Address[];
}


export interface Address {
  _id?: string;
  street: string;
  city: string;
  district: string;
  ward: string;
  phoneNumber: string;
  isDefault: boolean;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}
