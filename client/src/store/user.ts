import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type UserStore = {
  username: string;
  setUsername: (username: string) => void;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      username: '',
      setUsername: (username) => set({ username })
    }),
    { name: 'user-storage' }  // Persists username in localStorage
  )
);
