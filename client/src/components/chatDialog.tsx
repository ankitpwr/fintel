import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  PaperPlaneTiltIcon,
  SparkleIcon,
  UserCircleIcon,
} from "@phosphor-icons/react";

interface Message {
  role: "user" | "assistant";
  content: string;
  time: Date;
}

const now = Date.now();

const initialMessages: Message[] = [
  {
    role: "assistant",
    content:
      "Hi! I'm Fintel AI. Ask me anything about Indian stocks, company fundamentals, financial statements, valuation metrics, earnings, or the latest market news.",
    time: new Date(now - 6 * 60_000),
  },
  {
    role: "user",
    content: "Compare TCS and Infosys based on valuation.",
    time: new Date(now - 5 * 60_000),
  },
  {
    role: "assistant",
    content:
      "TCS currently trades at a higher PE multiple than Infosys due to its consistent margins and stronger return ratios. I can also compare revenue growth, ROCE, ROE, market cap and financial statements.",
    time: new Date(now - 4 * 60_000),
  },
];

const suggestedQuestions = [
  "Top gainers today",
  "Compare TCS vs Infosys",
  "Latest Reliance news",
  "Explain ROCE",
  "Highest PE stocks",
  "Nifty outlook",
];

const formatTime = (date: Date) =>
  Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);

export default function ChatDialog() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Keep the conversation pinned to the latest message
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  // Auto-grow the textarea as the person types, capped at max-h-40
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: trimmed, time: new Date() },
    ]);
    setInput("");
    setLoading(true);

    // Call your backend here — this simulates a reply so the typing state is visible
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I don't have a live backend connected yet, but once wired up I'll pull real fundamentals and market data to answer that.",
          time: new Date(),
        },
      ]);
      setLoading(false);
    }, 1400);
  };

  return (
    <div className="mx-auto flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[#2b2a29] bg-[#171615] shadow-2xl">
      {/* HEADER */}
      <div className="border-b border-[#2b2a29] bg-[#1e1d1c]/95 backdrop-blur px-6 py-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#31f6b8]/10 border border-[#31f6b8]/20">
            <SparkleIcon weight="fill" className="h-4.5 w-4.5 text-[#31f6b8]" />
          </div>

          <div className="min-w-0">
            <h2 className="text-base font-semibold text-white leading-tight">
              Ask Fintel AI
            </h2>
            <p className="text-[11px] font-geistmono uppercase tracking-wider text-[#8a8987] mt-0.5">
              Stocks · Earnings · Financials · Valuation · Market insights
            </p>
          </div>
        </div>
      </div>

      {/* CHAT */}
      <div className="relative flex-1 min-h-0">
        <div
          ref={scrollRef}
          className="h-full overflow-y-auto px-6 md:px-10 py-6 space-y-6"
        >
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex items-end gap-2.5 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#31f6b8]/10 border border-[#31f6b8]/20">
                  <SparkleIcon
                    weight="fill"
                    className="h-3.5 w-3.5 text-[#31f6b8]"
                  />
                </div>
              )}

              <div
                className={`flex max-w-[75%] flex-col gap-1 ${
                  message.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`rounded-2xl px-4 py-3 text-[14.5px] leading-relaxed ${
                    message.role === "assistant"
                      ? "bg-[#1e1d1c] border border-[#2b2a29] text-[#d4d3d1] rounded-bl-md"
                      : "bg-[#31f6b8] text-[#0f1210] font-medium rounded-br-md"
                  }`}
                >
                  {message.content}
                </div>
                <span className="text-[10px] font-geistmono text-[#6b6a69] px-1">
                  {formatTime(message.time)}
                </span>
              </div>

              {message.role === "user" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2b2a29]">
                  <UserCircleIcon
                    weight="fill"
                    className="h-4 w-4 text-[#a3a3a3]"
                  />
                </div>
              )}
            </motion.div>
          ))}

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-2.5 items-center"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#31f6b8]/10 border border-[#31f6b8]/20">
                <SparkleIcon
                  weight="fill"
                  className="h-3.5 w-3.5 text-[#31f6b8]"
                />
              </div>

              <div className="rounded-2xl rounded-bl-md border border-[#2b2a29] bg-[#1e1d1c] px-4 py-3.5">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((dot) => (
                    <motion.div
                      key={dot}
                      animate={{ y: [0, -4, 0] }}
                      transition={{
                        duration: 0.7,
                        repeat: Infinity,
                        delay: dot * 0.15,
                      }}
                      className="h-1.5 w-1.5 rounded-full bg-[#31f6b8]"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Fade mask hinting there's more to scroll */}
        <div className="pointer-events-none absolute top-0 inset-x-0 h-8 bg-gradient-to-b from-[#171615] to-transparent" />
      </div>

      {/* SUGGESTIONS */}
      <div className="border-t border-[#2b2a29] px-6 md:px-10 pt-4 shrink-0">
        <div className="mb-4 flex flex-wrap gap-2">
          {suggestedQuestions.map((question) => (
            <button
              key={question}
              onClick={() => setInput(question)}
              className="rounded-full border border-[#2b2a29] bg-[#1e1d1c] px-3.5 py-1.5 text-[13px] text-[#a3a3a3] transition-all hover:-translate-y-0.5 hover:border-[#31f6b8]/40 hover:bg-[#31f6b8]/10 hover:text-white"
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      {/* INPUT */}
      <div className="border-t border-[#2b2a29] bg-[#171615] px-6 md:px-10 py-4 shrink-0">
        <div className="flex items-end gap-3 rounded-2xl border border-[#2b2a29] bg-[#1e1d1c] px-4 py-2.5 focus-within:border-[#31f6b8]/50 transition-colors">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            placeholder="Ask anything about the market..."
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            className="max-h-40 flex-1 resize-none bg-transparent text-[14.5px] leading-relaxed text-white placeholder:text-[#6b6a69] outline-none py-1.5"
          />

          <motion.button
            whileHover={input.trim() ? { scale: 1.08 } : undefined}
            whileTap={input.trim() ? { scale: 0.92 } : undefined}
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${
              input.trim() && !loading
                ? "bg-[#31f6b8] text-[#0f1210] hover:bg-[#53f8c5] cursor-pointer"
                : "bg-[#2b2a29] text-[#6b6a69] cursor-not-allowed"
            }`}
          >
            <PaperPlaneTiltIcon weight="fill" className="h-4.5 w-4.5" />
          </motion.button>
        </div>
        <p className="mt-2 text-[11px] font-geistmono text-[#6b6a69] px-1">
          Enter to send · Shift + Enter for a new line
        </p>
      </div>
    </div>
  );
}
