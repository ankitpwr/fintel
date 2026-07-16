import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { motion } from "framer-motion";
import { ArrowRightIcon } from "@phosphor-icons/react";

interface ChatInputProps {
  onSendMessage?: (message: string, mode: "chat" | "detailed") => void;
  isFixed?: boolean;
}

export default function ChatInput({
  onSendMessage,
  isFixed = true,
}: ChatInputProps) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"chat" | "detailed">("chat");
  const navigate = useNavigate();
  const location = useLocation();

  const suggestions = [
    "what is ROCE of HDFC",
    "what is market cap of MRF",
    "whose p/e is more HDFC or SBI",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (location.pathname === "/") {
      navigate("/chat", { state: { initialQuery: query, mode } });
    } else if (onSendMessage) {
      onSendMessage(query, mode);
    }
    setQuery("");
  };

  const handleSuggestionClick = (text: string) => {
    setQuery(text);
  };

  const containerClasses = isFixed
    ? "fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-50"
    : "w-full max-w-4xl mx-auto";

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center w-full drop-shadow-2xl">
        <div className="relative flex justify-center items-end w-full z-10 select-none -mb-[2px]">
          <div className="bg-[#141414] border-t-2 border-x-2 border-[#2b2a29] rounded-t-2xl px-3 py-1.5 flex items-center gap-1 relative z-30">
            <div className="absolute -bottom-[2px] left-0 right-0 h-[4px] bg-[#141414]" />

            <button
              type="button"
              onClick={() => setMode("chat")}
              className={`relative px-4 py-1.5 rounded text-xs font-medium transition-colors duration-200 z-10 ${
                mode === "chat"
                  ? "text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {mode === "chat" && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 bg-[#262524] border border-[#3b3a39] rounded-lg -z-10 shadow-sm"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              chat
            </button>

            <button
              type="button"
              onClick={() => setMode("detailed")}
              className={`relative px-4 py-1.5 rounded text-xs font-medium transition-colors duration-200 z-10 ${
                mode === "detailed"
                  ? "text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {mode === "detailed" && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 bg-[#262524] border border-[#3b3a39] rounded-lg -z-10 shadow-sm"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              detailed Report
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="w-full bg-[#141414] border-2 border-[#2b2a29] rounded-3xl p-4 md:p-5 flex flex-col gap-4 relative z-0 transition-all duration-300 focus-within:border-[#403f3d]"
        >
          <div className="flex items-center justify-between gap-4 pl-2 pt-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a financial question or analyze equity..."
              className="flex-1 bg-transparent text-gray-100 placeholder:text-gray-500 text-sm outline-none tracking-wide"
              autoFocus
            />

            <button
              type="submit"
              disabled={!query.trim()}
              className="px-6 py-2.5 bg-[#1c1c1c] hover:bg-[#262524] disabled:opacity-30 disabled:hover:bg-[#1c1c1c] text-gray-200 border border-[#333231] hover:border-[#4d4c4a] rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shrink-0 cursor-pointer shadow-md"
            >
              <ArrowRightIcon className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-[#222120]">
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
        </form>
      </div>
    </div>
  );
}
