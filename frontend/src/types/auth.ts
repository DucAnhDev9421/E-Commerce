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
  lockTime?: string | Date | null;
  isDeleted: boolean;
  addresses?: Address[];
}


export interface Address {
  _id?: string;
  receiverName: string;
  phoneNumber: string;
  street: string;
  ward: string;
  district: string;
  city: string;
  isDefault: boolean;
  userId?: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}
