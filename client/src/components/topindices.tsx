import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";
import { useTopIndices } from "@/hooks/useMarket";

export default function Topindices() {
  const { data, isLoading, isError } = useTopIndices();

  if (isLoading) {
    return (
      <div className="h-24 w-full animate-pulse bg-[#1e1d1c] rounded-xl border border-[#2b2a29]"></div>
    );
  }

  if (isError) {
    return (
      <div className="h-24 w-full flex items-center justify-center bg-[#1e1d1c] rounded-xl border border-[#2b2a29] text-rose-400 text-sm">
        Error loading indices data
      </div>
    );
  }

  return (
    <div className="flex flex-col antialiased items-center justify-center relative overflow-hidden w-full">
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#171615] to-transparent z-10 pointer-events-none"></div>
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#171615] to-transparent z-10 pointer-events-none"></div>

      <InfiniteMovingCards
        items={data}
        direction="left"
        speed="normal"
        className="py-2"
      />
    </div>
  );
}
