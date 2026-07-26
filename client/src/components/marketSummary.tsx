import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useMarketSummary } from "@/hooks/useMarket";

// Tuned for a hero, paragraph-heavy read: roomier type than a chat bubble,
// with key figures (bold in the AI's markdown) picked out in the brand mint.
const SUMMARY_MARKDOWN_CLASSES =
  "prose prose-invert max-w-none font-googleSans " +
  "prose-p:text-[14px] prose-p:leading-[1.8] prose-p:text-[#d4d3d1] prose-p:my-3 first:prose-p:mt-0 last:prose-p:mb-0 " +
  "prose-strong:text-white prose-strong:font-semibold " +
  "prose-li:text-[#d4d3d1] prose-li:marker:text-[#31f6b8] prose-li:my-1 " +
  "prose-headings:text-white prose-headings:font-semibold prose-h3:text-[14px] prose-h3:mt-4 prose-h3:mb-2 " +
  "prose-a:text-[#31f6b8] text-[13px] prose-a:no-underline hover:prose-a:underline";

function useRelativeTime(isoDate?: string) {
  const [label, setLabel] = useState("");

  useEffect(() => {
    if (!isoDate) return;

    const update = () => {
      const diffMs = Date.now() - new Date(isoDate).getTime();
      const minutes = Math.max(0, Math.round(diffMs / 60_000));

      if (minutes < 1) setLabel("just now");
      else if (minutes < 60) setLabel(`${minutes} min ago`);
      else {
        const hours = Math.round(minutes / 60);
        setLabel(`${hours} hr${hours > 1 ? "s" : ""} ago`);
      }
    };

    update();
    const interval = setInterval(update, 30_000);
    return () => clearInterval(interval);
  }, [isoDate]);

  return label;
}

function SummarySkeleton() {
  return (
    <div className="bg-[#1e1d1c] border border-[#2b2a29] rounded-2xl p-7 flex flex-col gap-5 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#262524]" />
          <div className="flex flex-col gap-2">
            <div className="h-4 w-40 rounded bg-[#262524]" />
            <div className="h-3 w-28 rounded bg-[#262524]" />
          </div>
        </div>
        <div className="h-6 w-24 rounded-full bg-[#262524]" />
      </div>
      <div className="flex flex-col gap-2.5">
        <div className="h-3.5 w-full rounded bg-[#262524]" />
        <div className="h-3.5 w-[92%] rounded bg-[#262524]" />
        <div className="h-3.5 w-[80%] rounded bg-[#262524]" />
      </div>
    </div>
  );
}

export default function MarketSummary() {
  const { data, isLoading, isError } = useMarketSummary();
  const relativeTime = useRelativeTime(data?.generatedAt);

  if (isLoading) {
    return <SummarySkeleton />;
  }

  if (isError) {
    return (
      <div className="bg-[#1e1d1c] border border-rose-500/20 rounded-2xl p-7 flex items-center gap-3 text-rose-400 text-sm">
        Couldn't load today's market summary. Try refreshing the page.
      </div>
    );
  }

  const absoluteTime = data.generatedAt
    ? Intl.DateTimeFormat("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        day: "numeric",
        month: "short",
      }).format(new Date(data.generatedAt))
    : "";

  return (
    <div className="bg-[#1e1d1c] border border-[#2b2a29] rounded-2xl p-7 flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 font-googleSans">
          <h1 className="text-lg font-semibold text-white tracking-tight">
            Today's Market Summary
          </h1>
        </div>

        {data.generatedAt && (
          <div
            className="flex items-center  gap-1.5 pl-3 pr-3 py-1.5 rounded-full bg-[#171615] border border-[#2b2a29] shrink-0"
            title={absoluteTime}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#31f6b8] opacity-60" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#31f6b8]" />
            </span>
            <span className="text-[11px] font-geistmono font-medium text-[#a3a3a3]">
              Updated {relativeTime}
            </span>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={data.generatedAt}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className={SUMMARY_MARKDOWN_CLASSES}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {data.summary}
          </ReactMarkdown>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
