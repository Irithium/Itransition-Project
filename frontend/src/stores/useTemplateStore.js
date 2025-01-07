import { create } from "zustand";
import { getTemplates } from "@/services/templateService";

const useTemplateStore = create((set) => ({
  templates: [],
  loading: true,
  page: 0,
  limit: 10,
  total: "",

  setPage: (page) => set({ page }),
  setLimit: (limit) => set({ limit }),
  setTotal: (total) => set({ total }),
  setTemplates: (templates) => set({ templates }),

  setLoading: (loading) => set({ loading }),
}));

export const loadTemplates = async (setTemplates, setTotal, setLoading) => {
  setLoading(true);
  try {
    const response = await getTemplates();
    setTemplates(response.templates);
    setTotal(response.total);
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};

export default useTemplateStore;
