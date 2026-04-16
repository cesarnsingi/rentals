import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../lib/api';

interface User {
  id: string; name: string; email: string;
  avatar?: string; phone?: string; role: string;
  savedListings: string[];
}

interface AuthState {
  user:    User | null;
  token:   string | null;
  loading: boolean;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  login:   (email: string, password: string) => Promise<void>;
  logout:  () => Promise<void>;
  setUser: (u: User) => void;
  isAuth:  () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user:     null,
  token:    null,
  loading:  false,
  hydrated: false,

  hydrate: async () => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      try {
        const { data } = await authApi.me();
        set({ user: data, token, hydrated: true });
      } catch {
        await AsyncStorage.removeItem('token');
        set({ hydrated: true });
      }
    } else {
      set({ hydrated: true });
    }
  },

  login: async (email, password) => {
    set({ loading: true });
    try {
      const { data } = await authApi.login({ email, password });
      await AsyncStorage.setItem('token', data.token);
      set({ user: data.user, token: data.token });
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem('token');
    set({ user: null, token: null });
  },

  setUser: (user) => set({ user }),
  isAuth:  () => !!get().token,
}));
