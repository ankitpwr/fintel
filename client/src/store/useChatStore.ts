import { create, type StateCreator } from "zustand";

type ChatModeType = "detailed" | "brief";
interface ChatState {
  userQuery: string;
  chatMode: ChatModeType;
  agentResponse: string | null;
  agentUpdates: string | null;
  isStreaming: boolean;
}
interface ChatAction {
  setUserQuery: (query: string) => void;
  setChatMode: (mode: ChatModeType) => void;
  setAgentResponse: (response: string) => void;
  setAgentUpdate: (update: string) => void;
  resetStream: () => void;
}

type ChatStoreType = ChatState & ChatAction;
const ChatStore: StateCreator<ChatStoreType> = (set) => ({
  userQuery: "",
  chatMode: "brief",
  agentResponse: null,
  agentUpdates: null,
  isStreaming: false,

  setUserQuery: (query) => set((state) => ({ userQuery: query })),
  setChatMode: (mode: ChatModeType) => set((state) => ({ chatMode: mode })),
  setAgentResponse: (response: string) =>
    set((state) => ({
      agentResponse: (state.agentResponse ?? "").concat(response),
    })),
  setAgentUpdate: (update: string) =>
    set((state) => ({ agentUpdates: update })),
  finishStream: () => set(() => ({ isStreaming: false })),
  resetStream: () =>
    set(() => ({ agentResponse: null, agentUpdates: null, isStreaming: true })),
});

const useChatStore = create<ChatStoreType>(ChatStore);
export default useChatStore;
