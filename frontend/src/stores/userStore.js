import { create } from "zustand";

const useUserStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setUser: (user, token) => set({ user, token, isAuthenticated: true }),

  clearUser: () => set({ user: null, token: null, isAuthenticated: false }),

  updateUser: (user) => set({ user }),
  setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
}));

export default useUserStore;
