// src/pages/Chat.tsx
import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { RobotIcon } from "@phosphor-icons/react";
import ChatInput from "../components/chatInput";

type Message = {
  id: string;
  role: "user" | "agent";
  content: string;
};

export default function ChatPage() {
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Handle the initial query passed from the Home page
  useEffect(() => {
    if (location.state?.initialQuery) {
      handleNewMessage(location.state.initialQuery);
      // Clear state so a refresh doesn't trigger it again
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleNewMessage = (content: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // Mocking an AI stream response
    setTimeout(() => {
      const agentMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "agent",
        content:
          "Based on the latest market data, the top movers are showing significant volatility. We are seeing heavy institutional buying in the tech sector, particularly around AI infrastructure. Would you like me to pull up the specific ticker symbols?",
      };
      setMessages((prev) => [...prev, agentMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] text-gray-200 font-sans">
      {/* Chat History Area */}
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
                  // User Bubble (Right aligned or distinct bubble)
                  <div className="self-end max-w-[80%] bg-[#2b2a29] text-gray-100 px-5 py-3 rounded-2xl rounded-tr-sm shadow-sm font-medium">
                    {msg.content}
                  </div>
                ) : (
                  // Agent Response (Perplexity style: no bubble, clean text)
                  <div className="flex gap-4 self-start max-w-[90%] mt-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-1">
                      <RobotIcon className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed">
                      {msg.content}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4 self-start"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                <RobotIcon className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-center gap-1.5 text-gray-500 h-8">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-emerald-400/50 animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-emerald-400/50 animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-emerald-400/50 animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Input Anchored to Bottom */}
      <div className="w-full bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-transparent pt-10 pb-8 fixed bottom-0">
        <ChatInput onSendMessage={handleNewMessage} isFixed={false} />
      </div>
    </div>
  );
}
