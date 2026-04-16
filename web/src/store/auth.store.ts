import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { authApi } from '../lib/api';

interface AuthState {
  user:    User | null;
  token:   string | null;
  loading: boolean;
  login:   (email: string, password: string) => Promise<void>;
  googleLogin: (idToken: string) => Promise<void>;
  logout:  () => void;
  setUser: (user: User) => void;
  isAuth:  () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user:    null,
      token:   null,
      loading: false,

      login: async (email, password) => {
        set({ loading: true });
        try {
          const { data } = await authApi.login({ email, password });
          localStorage.setItem('token', data.token);
          set({ user: data.user, token: data.token });
        } finally {
          set({ loading: false });
        }
      },

      googleLogin: async (idToken) => {
        set({ loading: true });
        try {
          const { data } = await authApi.google(idToken);
          localStorage.setItem('token', data.token);
          set({ user: data.user, token: data.token });
        } finally {
          set({ loading: false });
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null });
      },

      setUser: (user) => set({ user }),
      isAuth:  () => !!get().token,
    }),
    { name: 'auth', partialize: (s) => ({ token: s.token, user: s.user }) },
  ),
);
