import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User } from '../types/auth';

const storedUser = localStorage.getItem('user');

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  accessToken: localStorage.getItem('accessToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; accessToken: string }>) => {
      state.loading = false;
      const userData = action.payload.user;
      // Đồng bộ _id nếu backend trả về id thuần
      if (userData && !userData._id && (userData as any).id) {
        userData._id = (userData as any).id;
      }
      state.user = userData;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      localStorage.setItem('accessToken', action.payload.accessToken);
      localStorage.setItem('user', JSON.stringify(userData));
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    },
    updateUser: (state, action: PayloadAction<User>) => {
      const userData = action.payload;
      // Đồng bộ _id nếu backend trả về id thuần
      if (userData && !userData._id && (userData as any).id) {
        userData._id = (userData as any).id;
      }
      state.user = userData;
      localStorage.setItem('user', JSON.stringify(userData));
    },
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      localStorage.setItem('accessToken', action.payload);
    }
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, updateUser, setAccessToken } = authSlice.actions;

export default authSlice.reducer;
