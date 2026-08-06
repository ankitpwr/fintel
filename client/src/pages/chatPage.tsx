import { useEffect, useRef, useState } from "react";
import ChatInput from "../components/chatInput";
import useChatStore from "@/store/useChatStore";
import axios from "axios";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { ThinkingOrb } from "thinking-orbs";
import TopSection from "@/components/topSection";

type Message = {
  id: string;
  role: "user" | "agent";
  content: string;
};

const MARKDOWN_CLASSES =
  "prose prose-invert max-w-none text-[16px] leading-[1.8] " +
  "prose-headings:font-semibold prose-headings:text-white " +
  "prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3 " +
  "prose-h4:text-[15px] prose-h4:mt-4 prose-h4:mb-2 prose-h4:text-[#c4c3c1] " +
  "prose-p:text-gray-100 prose-p:leading-relaxed " +
  "prose-strong:text-white prose-strong:font-semibold " +
  "prose-li:text-gray-100 prose-li:marker:text-[#31f6b8] " +
  "prose-hr:border-[#2b2a29] prose-hr:my-6 " +
  "prose-table:text-sm prose-th:text-[#8a8987] prose-td:border-[#2b2a29]";

export default function ChatPage() {
  const userQuery = useChatStore((s) => s.userQuery);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const agentResponse = useChatStore((s) => s.agentResponse);
  const agentUpdate = useChatStore((s) => s.agentUpdates);

  const [messages, setMessages] = useState<Message[]>([]);
  const hasSentInitialQuery = useRef(false);

  useEffect(() => {
    const sse = new EventSource(
      `${import.meta.env.VITE_BASE_URL}/report/stream-update`,
      { withCredentials: true },
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

        useChatStore.getState().finishStream();
      }
    };

    sse.onerror = () => console.log("SSE connection error");
    return () => sse.close();
  }, []);

  useEffect(() => {
    if (userQuery && !hasSentInitialQuery.current) {
      hasSentInitialQuery.current = true;
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "user", content: userQuery },
      ]);
      useChatStore.getState().resetStream();
      window.history.replaceState({}, document.title);
    }
  }, []);

  const handleNewMessage = async () => {
    const { userQuery, chatMode, resetStream } = useChatStore.getState();
    if (!userQuery.trim()) return;

    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: userQuery },
    ]);
    resetStream();

    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/report/generate`,
        {
          userQuery,
          queryType: chatMode,
        },
        { withCredentials: true },
      );
    } catch (error) {
      console.log("error occured ", error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#171615] text-gray-100 font-googleSans tracking-normal antialiased gap-3 ">
      <div className="w-full px-6 md:px-24 pt-6 md:pt-8 max-w-[1600px] mx-auto shrink-0 ">
        <TopSection title="Chats" />
      </div>

      <MessageScrollerProvider autoScroll scrollPreviousItemPeek={64}>
        <MessageScroller className="flex-1 w-full  pb-44">
          <MessageScrollerViewport>
            <MessageScrollerContent className="max-w-3xl mx-auto px-4 md:px-0 pb-32 flex flex-col gap-8">
              {messages.map((msg) => (
                <MessageScrollerItem
                  key={msg.id}
                  messageId={msg.id}
                  scrollAnchor={msg.role === "user"}
                >
                  <MessageBubble role={msg.role} content={msg.content} />
                </MessageScrollerItem>
              ))}

              {isStreaming && (
                <MessageScrollerItem messageId="active-stream">
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex gap-4 self-start mt-2"
                  >
                    {agentResponse ? (
                      <div className={MARKDOWN_CLASSES}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {agentResponse}
                        </ReactMarkdown>
                        <span className="inline-block w-2 h-4 ml-1 bg-gray-400 animate-pulse align-middle rounded-sm" />
                      </div>
                    ) : (
                      <div className="flex gap-2 items-center">
                        <ThinkingOrb state="composing" size={20} />
                        <span className=" font-medium shimmer">
                          {agentUpdate ?? "Analyzing financial data..."}
                        </span>{" "}
                      </div>
                    )}
                  </motion.div>
                </MessageScrollerItem>
              )}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
      </MessageScrollerProvider>

      <div className="w-full bg-gradient-to-t from-[#171615] via-[#171615] to-transparent pt-10 pb-8 fixed bottom-0 z-10 ">
        <ChatInput onSendMessage={handleNewMessage} isFixed={false} />
      </div>
    </div>
  );
}

function MessageBubble({
  role,
  content,
}: {
  role: "user" | "agent";
  content: string;
}) {
  if (role === "user") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex w-full justify-end"
      >
        <div className="max-w-[80%] bg-[#262524] border border-[#2b2a29] text-white px-5 py-3 rounded-3xl rounded-tr-sm shadow-sm text-[17px] leading-relaxed font-medium">
          {content}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex gap-4 self-start mt-2"
    >
      <div className={MARKDOWN_CLASSES}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    </motion.div>
  );
}
