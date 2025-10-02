import { create } from 'zustand';
import { User } from '../types';
import api from '../services/api';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  checkAuthStatus: () => Promise<void>;
  login: (user: User) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,

  checkAuthStatus: async () => {
    try {
      const { data } = await api.get('/auth/status');
      if (data.isAuthenticated) {
        set({ isAuthenticated: true, user: data.user });
      } else {
        set({ isAuthenticated: false, user: null });
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      set({ isAuthenticated: false, user: null });
    }
  },

  login: (user: User) => {
    set({ isAuthenticated: true, user });
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
      set({ isAuthenticated: false, user: null });
    } catch (error) {
      console.error('Error logging out:', error);
      // Even if the backend call fails, force logout on the client
      set({ isAuthenticated: false, user: null });
    }
  },
}));