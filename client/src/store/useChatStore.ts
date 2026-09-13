import { toast } from "@/components/ui/toast";
import axios from "axios";
import { create, type StateCreator } from "zustand";

type ChatModeType = "detailed" | "brief";
export interface HistoricChat {
  id: string;
  userQuery: string;
  finalResponse: string;
}

interface ChatState {
  userQuery: string;
  chatMode: ChatModeType;
  agentResponse: string | null;
  agentUpdates: string | null;
  isStreaming: boolean;
  isLoadingChats: boolean;
  historicChats: HistoricChat[];
}
interface ChatAction {
  setUserQuery: (query: string) => void;
  setChatMode: (mode: ChatModeType) => void;
  setAgentResponse: (response: string) => void;
  setAgentUpdate: (update: string) => void;
  resetStream: () => void;
  finishStream: () => void;
  fetchHistoricChats: () => Promise<void>;
  fetchHistoricChat: (chatId: string) => Promise<HistoricChat | null>;
}

type ChatStoreType = ChatState & ChatAction;
const ChatStore: StateCreator<ChatStoreType> = (set) => ({
  userQuery: "",
  chatMode: "brief",
  agentResponse: null,
  agentUpdates: null,
  isStreaming: false,
  isLoadingChats: false,
  historicChats: [],

  setUserQuery: (query) => set({ userQuery: query }),
  setChatMode: (mode: ChatModeType) => set({ chatMode: mode }),
  setAgentResponse: (response: string) =>
    set((state) => ({
      agentResponse: (state.agentResponse ?? "").concat(response),
    })),
  setAgentUpdate: (update: string) => set({ agentUpdates: update }),
  finishStream: () => set(() => ({ isStreaming: false })),
  resetStream: () =>
    set(() => ({ agentResponse: null, agentUpdates: null, isStreaming: true })),
  fetchHistoricChats: async () => {
    set({ isLoadingChats: true });
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/report/historic-chats`,
        { withCredentials: true },
      );
      set({ historicChats: res.data.data });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.error ??
          error.response?.data?.message ??
          "Something went wrong";
        toast.add({ type: "error", description: message });
      } else {
        console.log("Unexpected error:", error);
        toast.add({ type: "error", description: "Something went wrong" });
      }
    } finally {
      set({ isLoadingChats: false });
    }
  },
  fetchHistoricChat: async (chatId) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/report/historic-chats/${chatId}`,
        { withCredentials: true },
      );
      return res.data.data as HistoricChat;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.error ??
          error.response?.data?.message ??
          "Unable to load this chat";
        toast.add({ type: "error", description: message });
      } else {
        toast.add({ type: "error", description: "Unable to load this chat" });
      }
      return null;
    }
  },
});

const useChatStore = create<ChatStoreType>(ChatStore);
export default useChatStore;
