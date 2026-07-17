import useChatStore from "@/store/useChatStore";

// only re-renders this component when agentResponse changes — not the whole page
export default function StreamingBubble() {
  const agentResponse = useChatStore((s) => s.agentResponse);
  const agentUpdate = useChatStore((s) => s.agentUpdates);
  const isStreaming = useChatStore((s) => s.isStreaming);

  if (!isStreaming) return null;

  return (
    <div className="flex gap-4 self-start mt-2">
      <div className="prose prose-invert max-w-none text-lg text-gray-300 leading-relaxed">
        {agentResponse ? (
          <>
            {agentResponse}
            <span className="inline-block w-2 h-5 ml-0.5 bg-gray-300 animate-pulse align-middle" />
          </>
        ) : (
          <span className="shimmer-text">{agentUpdate ?? "Thinking..."}</span>
        )}
      </div>
    </div>
  );
}
