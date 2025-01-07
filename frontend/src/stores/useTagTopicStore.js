import { create } from "zustand";
import { getTopics } from "@/services/topicService";
import { getTags } from "@/services/tagService";

const useTagTopicStore = create((set) => ({
  topics: [],
  tags: [],
  loading: true,

  setTopics: (topics) => set({ topics }),
  setTags: (tags) => set({ tags }),
  setLoading: (loading) => set({ loading }),
}));

export const loadTagTopics = async (setTopics, setTags, setLoading) => {
  setLoading(true);
  try {
    const [topics, tags] = await Promise.all([getTopics(), getTags()]);
    setTopics(topics);
    setTags(tags);
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};

export default useTagTopicStore;
