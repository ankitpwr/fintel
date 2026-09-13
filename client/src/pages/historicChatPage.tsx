import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import { ThinkingOrb } from "thinking-orbs";
import TopSection from "@/components/topSection";
import useChatStore, { type HistoricChat } from "@/store/useChatStore";

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

export default function HistoricChatPage() {
  const { chatId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const routeChat = (location.state as { chat?: HistoricChat } | null)?.chat;
  const [chat, setChat] = useState<HistoricChat | null>(
    routeChat && routeChat.id === chatId ? routeChat : null,
  );
  const [isLoading, setIsLoading] = useState(!routeChat);

  useEffect(() => {
    if (!chatId) return;

    if (routeChat?.id === chatId) {
      setChat(routeChat);
      setIsLoading(false);
      return;
    }

    setChat(null);
    setIsLoading(true);
    useChatStore
      .getState()
      .fetchHistoricChat(chatId)
      .then(setChat)
      .finally(() => setIsLoading(false));
  }, [chatId, routeChat]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#171615]">
        <ThinkingOrb state="shaping" size={64} />
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[#171615] text-center text-gray-100">
        <p className="text-lg">This chat could not be found.</p>
        <button
          type="button"
          onClick={() => navigate("/history")}
          className="rounded-full border border-[#2b2a29] px-4 py-2 text-sm text-[#c4c3c1] transition-colors hover:border-[#31f6b8]/50 hover:text-white"
        >
          Back to history
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col gap-3 bg-[#171615] font-googleSans tracking-normal text-gray-100 antialiased">
      <div className="mx-auto w-full max-w-[1600px] shrink-0 px-6 pt-6 md:px-24 md:pt-8">
        <TopSection title="History" />
      </div>

      <main className="w-full max-w-3xl mx-auto px-4 pb-16 pt-8 md:px-0 md:pt-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex w-full justify-end"
        >
          <div className="max-w-[80%] rounded-3xl rounded-tr-sm border border-[#2b2a29] bg-[#262524] px-5 py-3 text-[17px] font-medium leading-relaxed text-white shadow-sm">
            {chat.userQuery}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.08 }}
          className="mt-8 flex gap-4"
        >
          <div className={MARKDOWN_CLASSES}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {chat.finalResponse}
            </ReactMarkdown>
          </div>
        </motion.div>

        <button
          type="button"
          onClick={() => navigate("/history")}
          aria-label="Back to history"
          className="mt-10 inline-flex items-center gap-2 text-sm text-[#8a8987] transition-colors hover:text-white"
        >
          <ArrowLeftIcon size={16} />
          Back to history
        </button>
      </main>
    </div>
  );
}
