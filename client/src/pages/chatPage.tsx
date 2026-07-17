import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ChatInput from "../components/chatInput";
import useChatStore from "@/store/useChatStore";
import axios from "axios";
import StreamingBubble from "@/components/streamBubble";

type Message = {
  id: string;
  role: "user" | "agent";
  content: string;
};

export default function ChatPage() {
  const userQuery = useChatStore((s) => s.userQuery);
  const chatMode = useChatStore((s) => s.chatMode);

  const [messages, setMessages] = useState<Message[]>([]);
  const hasSentInitialQuery = useRef(false);

  useEffect(() => {
    const sse = new EventSource(
      `${import.meta.env.VITE_BASE_URL}/report/stream-update`,
    );

    sse.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const { type, message } = data;

      if (type === "step") {
        useChatStore.getState().setAgentUpdate(message as string);
      } else if (type === "token") {
        useChatStore.getState().setAgentResponse(message as string);
      } else if (type === "done") {
        const text = useChatStore.getState().agentResponse ?? "";
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: "agent", content: text },
        ]);
        // useChatStore.getState().finishStream();
      }
    };

    sse.onerror = () => console.log("SSE connection error");

    return () => sse.close();
  }, []);

  useEffect(() => {
    if (userQuery && !hasSentInitialQuery.current) {
      hasSentInitialQuery.current = true;
      handleNewMessage();
      window.history.replaceState({}, document.title);
    }
  }, [userQuery]);

  const handleNewMessage = async () => {
    const { userQuery, chatMode, resetStream } = useChatStore.getState();
    if (!userQuery.trim()) return;

    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: userQuery },
    ]);
    resetStream(); // clears agentResponse/agentUpdates, sets isStreaming = true

    try {
      await axios.post(`${import.meta.env.VITE_BASE_URL}/report/generate`, {
        userQuery,
        queryType: chatMode,
      });
    } catch (error) {
      console.log("error occured ", error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] text-gray-200 font-sans">
      <div className="flex-1 overflow-y-auto pt-10 pb-32 px-4 md:px-0">
        <div className="max-w-3xl mx-auto flex flex-col gap-8">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col w-full"
              >
                {msg.role === "user" ? (
                  <div className="self-end max-w-[80%] bg-[#2b2a29] text-gray-100 px-5 py-3 rounded-2xl rounded-tr-sm shadow-sm font-medium">
                    {msg.content}
                  </div>
                ) : (
                  <div className="flex gap-4 self-start  mt-2">
                    <div className="prose prose-invert max-w-none text-lg text-gray-300 leading-relaxed">
                      {msg.content}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          <StreamingBubble />
        </div>
      </div>

      <div className="w-full bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-transparent pt-10 pb-8 fixed bottom-0">
        <ChatInput onSendMessage={handleNewMessage} isFixed={false} />
      </div>
    </div>
  );
}
