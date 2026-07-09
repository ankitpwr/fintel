import MarketIndex from "@/components/marketIndex";
import MarketSummary from "@/components/marketSummary";
import Topindices from "@/components/topindices";
import { TableDemo } from "@/components/topMover";
import { useTopMovers } from "@/hooks/useMarket";
import { ClockAfternoonIcon } from "@phosphor-icons/react";

export default function Home() {
  const { data, isLoading, isError } = useTopMovers();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-white">
        Loading market data...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center text-red-400">
        Failed to load market data.
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col text-white px-20 py-8 gap-12 max-w-7xl mx-auto">
      {/* Header Section */}
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-geistpixel font-bold ">
          Market Overview
        </h1>
        <div className="flex items-center gap-2 text-sm text-[#a3a3a3]">
          <ClockAfternoonIcon className="w-4 h-4" />
          <span>
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          <span>•</span>
          <span>Last updated: {new Date().toLocaleTimeString("en-IN")}</span>
        </div>
      </header>
      <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
        <Topindices />
      </section>

      <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <MarketSummary />
      </section>

      <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
        <MarketIndex />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in font-geistmono fade-in slide-in-from-bottom-4 duration-500 delay-500 pb-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold text-emerald-400">
            Top Gainers
          </h2>
          <TableDemo data={data["topGainers"]} />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold text-rose-400">Top Losers</h2>
          <TableDemo data={data["topLosers"]} />
        </div>
      </section>
    </div>
  );
}
