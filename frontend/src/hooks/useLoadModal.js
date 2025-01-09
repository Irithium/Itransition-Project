import { create } from "zustand";

const useLoadModal = create((set) => ({
  isLoginModalOpen: false,
  isRegisterModalOpen: false,

  openLoginModal: () => set({ isLoginModalOpen: true }),
  closeLoginModal: () => set({ isLoginModalOpen: false }),
  openRegisterModal: () => set({ isRegisterModalOpen: true }),
  closeRegisterModal: () => set({ isRegisterModalOpen: false }),
  changeModal: () =>
    set((state) => ({
      isLoginModalOpen: !state.isLoginModalOpen,
      isRegisterModalOpen: state.isLoginModalOpen,
    })),
}));

export default useLoadModal;
