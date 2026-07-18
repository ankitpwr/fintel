import { useEffect, useRef, useState } from "react";
import ChatInput from "../components/chatInput";
import useChatStore from "@/store/useChatStore";
import axios from "axios";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";

type Message = {
  id: string;
  role: "user" | "agent";
  content: string;
};

export default function ChatPage() {
  const userQuery = useChatStore((s) => s.userQuery);
  const chatMode = useChatStore((s) => s.chatMode);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const agentResponse = useChatStore((s) => s.agentResponse);
  const agentUpdate = useChatStore((s) => s.agentUpdates);

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

        useChatStore.getState().finishStream();
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
      await axios.post(`${import.meta.env.VITE_BASE_URL}/report/generate`, {
        userQuery,
        queryType: chatMode,
      });
    } catch (error) {
      console.log("error occured ", error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] text-gray-100 font-googleSans tracking-normal antialiased">
      <MessageScrollerProvider autoScroll scrollPreviousItemPeek={64}>
        <MessageScroller className="flex-1 w-full pt-10 pb-32">
          <MessageScrollerViewport>
            <MessageScrollerContent className="max-w-3xl mx-auto px-4 md:px-0 flex flex-col gap-6">
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
                  <div className="flex gap-4 self-start mt-2">
                    <div className="prose prose-invert max-w-none text-[16px] leading-[1.8] text-gray-100">
                      {agentResponse ? (
                        <>
                          {agentResponse}
                          <span className="inline-block w-2 h-4 ml-1 bg-gray-400 animate-pulse align-middle rounded-sm" />
                        </>
                      ) : (
                        <span className=" font-medium shimmer">
                          {agentUpdate ?? "Analyzing financial data..."}
                        </span>
                      )}
                    </div>
                  </div>
                </MessageScrollerItem>
              )}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
      </MessageScrollerProvider>

      <div className="w-full bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-transparent pt-10 pb-8 fixed bottom-0 z-10">
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
      <div className="flex w-full justify-end">
        <div className="max-w-[80%] bg-[#262626] text-white px-5 py-3 rounded-3xl rounded-tr-sm shadow-sm text-[17px] leading-relaxed font-medium">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 self-start mt-2">
      <div className="prose prose-invert max-w-none text-[17px] leading-[1.8] text-white">
        {content}
      </div>
    </div>
  );
}
