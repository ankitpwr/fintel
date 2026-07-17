import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { motion } from "framer-motion";
import { ArrowRightIcon } from "@phosphor-icons/react";
import useChatStore from "@/store/useChatStore";

interface ChatInputProps {
  onSendMessage?: (message: string, mode: "chat" | "detailed") => void;
  isFixed?: boolean;
}

export default function ChatInput({ isFixed = true }: ChatInputProps) {
  const { userQuery, chatMode, setUserQuery, setChatMode } = useChatStore();

  const navigate = useNavigate();
  const location = useLocation();

  const suggestions = ["what is ROCE of HDFC", "what is market cap of MRF"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim()) return;

    if (location.pathname === "/") {
      navigate("/chat");
    } else {
      //send request
    }
  };

  const handleSuggestionClick = (text: string) => {
    setUserQuery(text);
  };

  const containerClasses = isFixed
    ? "fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-50"
    : "w-full max-w-4xl mx-auto";

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center w-full drop-shadow-2xl font-inter">
        <form
          onSubmit={handleSubmit}
          className="w-full bg-[#141414] border-2 border-[#2b2a29] rounded-3xl p-3 pt-2 pb-2 flex flex-col gap-2 relative z-0 transition-all duration-300 focus-within:border-[#2b2a29]"
        >
          <div className="flex items-center justify-between gap-4 pl-2 pt-1">
            <input
              type="text"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="Ask a financial question or analyze equity..."
              className="flex-1 bg-transparent text-gray-100 placeholder:text-gray-500 text-sm outline-none tracking-wide"
              autoFocus
            />

            <button
              type="submit"
              disabled={!userQuery.trim()}
              className="px-6 py-2.5 bg-zinc-200 hover:bg-zinc-300 rounded-full font-medium transition-all duration-200 flex items-center gap-2 shrink-0 cursor-pointer shadow-md"
            >
              <ArrowRightIcon className="w-4 h-4 text-black" />
            </button>
          </div>

          <div className="flex pt-2">
            {" "}
            <div className="flex items-center gap-2.5 ">
              {suggestions.map((item, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestionClick(item)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#1a1a1a] border border-[#2e2d2c] hover:border-[#4a4947] hover:bg-[#222120] text-xs text-gray-400 hover:text-gray-200 transition-all duration-150 text-left truncate max-w-full"
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="relative flex justify-end w-full z-10 select-none ">
              <div className="bg-[#141414]  border-2 border-[#2b2a29] rounded-xl  flex items-center gap-1 relative z-30">
                <button
                  type="button"
                  onClick={() => setChatMode("brief")}
                  className={`relative px-4 py-1.5 rounded text-xs font-medium transition-colors duration-200 z-10 ${
                    chatMode === "brief"
                      ? "text-white"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  {chatMode === "brief" && (
                    <motion.div
                      layoutId="activeTabPill"
                      className="absolute inset-0 bg-[#262524] border border-[#3b3a39] rounded-lg -z-10 shadow-sm"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.4,
                      }}
                    />
                  )}
                  chat
                </button>

                <button
                  type="button"
                  onClick={() => setChatMode("detailed")}
                  className={`relative px-4 py-1.5 rounded text-xs font-medium transition-colors duration-200 z-10 ${
                    chatMode === "detailed"
                      ? "text-white"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  {chatMode === "detailed" && (
                    <motion.div
                      layoutId="activeTabPill"
                      className="absolute inset-0 bg-[#262524] border border-[#3b3a39] rounded-lg -z-10 shadow-sm"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.4,
                      }}
                    />
                  )}
                  Deep Research
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
