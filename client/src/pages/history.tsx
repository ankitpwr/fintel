import TopSection from "@/components/topSection";
import useChatStore from "@/store/useChatStore";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRightIcon, ChatCircleDotsIcon } from "@phosphor-icons/react";
import { useNavigate } from "react-router";
import { ThinkingOrb } from "thinking-orbs";

export default function History() {
  const { fetchHistoricChats, isLoadingChats, historicChats } = useChatStore();
  const navigate = useNavigate();
  useEffect(() => {
    fetchHistoricChats();
  }, []);

  if (isLoadingChats) {
    return (
      <div className="flex w-full h-full items-center justify-center ">
        <ThinkingOrb state="shaping" size={64} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#171615] text-gray-100 font-googleSans tracking-normal antialiased">
      <div className="w-full px-6 md:px-24 pt-6 md:pt-8 max-w-[1600px] mx-auto shrink-0 ">
        <TopSection title="History" />
      </div>

      <main className="w-full max-w-3xl mx-auto px-6 md:px-0 py-8 md:py-12">
        {historicChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
            <ChatCircleDotsIcon size={34} className="text-[#31f6b8]" />
            <h2 className="text-lg font-medium text-white">No chats yet</h2>
            <p className="max-w-sm text-sm leading-relaxed text-[#8a8987]">
              Your completed financial research conversations will appear here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {historicChats.map((chat, index) => (
              <motion.button
                key={chat.id}
                type="button"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.04 }}
                onClick={() =>
                  navigate(`/chat/${chat.id}`, {
                    state: { chat },
                  })
                }
                className="group flex w-full items-center gap-4 rounded-2xl border border-[#2b2a29] bg-[#1e1d1c] px-5 py-4 text-left transition-colors duration-200 hover:border-[#31f6b8]/40 hover:bg-[#242321]"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-medium leading-6 text-white">
                    {chat.userQuery}
                  </p>
                  <p className="mt-1 truncate text-sm leading-6 text-[#8a8987]">
                    {chat.finalResponse.replace(/\s+/g, " ")}
                  </p>
                </div>
                <ArrowRightIcon
                  size={20}
                  className="shrink-0 text-[#8a8987] transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[#31f6b8]"
                />
              </motion.button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
