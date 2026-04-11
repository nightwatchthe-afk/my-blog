import { create } from 'zustand';

interface AuthState {
  isAdmin: boolean;
  isAuthReady: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  setAuthReady: (ready: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAdmin: localStorage.getItem('adminToken') === 'true',
  isAuthReady: false,
  login: (password: string) => {
    if (password === 'nuangetingfengdeboke') {
      localStorage.setItem('adminToken', 'true');
      set({ isAdmin: true });
      return true;
    }
    return false;
  },
  logout: () => {
    localStorage.removeItem('adminToken');
    set({ isAdmin: false });
  },
  setAuthReady: (ready) => set({ isAuthReady: ready }),
}));
