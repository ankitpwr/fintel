import MarketSummary from "@/components/marketSummary";
import Topindices from "@/components/topindices";
import { TreemapChart } from "@/components/treeHeatmap";
import CurrencyTable from "@/components/currencyTable";
import NewsGrid from "@/components/newsGrid";
import { useTopMovers } from "@/hooks/useMarket";
import { TopMoverTable } from "@/components/topMover";
import { StandoutTick } from "@/components/standout";

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
      <div className="flex h-full items-center justify-center text-rose-400">
        Failed to load market data.
      </div>
    );
  }

  const symbol = data.topGainers[0].tickerSymbol;

  return (
    <div className="w-full flex flex-col text-white px-6 md:px-24 py-8 gap-18 max-w-[1600px] mx-auto">
      <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-8 ">
        <h2 className="font-geistmono text-gray-200">Top Assets</h2>

        <Topindices />
      </section>

      <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
        <MarketSummary />
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
        <div className="xl:col-span-8 flex flex-col gap-18">
          {/* <MarketIndex /> */}
          <div className="flex flex-col gap-1">
            {" "}
            <h2 className="font-geistmono text-gray-200">Top 50 Heatmap</h2>
            <TreemapChart />
          </div>
          <div className="flex flex-col gap-1">
            {" "}
            <h2 className="font-geistmono text-gray-200">Standouts</h2>
            <StandoutTick symbol={symbol} />
          </div>
        </div>

        <div className="xl:col-span-4 flex flex-col gap-8">
          <div className="flex flex-col gap-1">
            <h2 className="font-geistmono text-emerald-400">Top Gainers</h2>
            <TopMoverTable data={data["topGainers"]} />
          </div>

          <div className="flex flex-col gap-1">
            <h2 className="font-geistmono  text-rose-400">Top Losers</h2>
            <TopMoverTable data={data["topLosers"]} />
          </div>

          <div className="flex flex-col gap-1">
            <h2 className="font-geistmono text-blue-400">
              Currency Spot Rates
            </h2>
            <CurrencyTable />
          </div>
        </div>
      </div>

      <section className="w-full flex flex-col gap-4 border-t border-[#2b2a29] pt-8 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500 pb-12">
        <h2 className="font-geistmono text-lg text-gray-200">Top stories</h2>
        <NewsGrid />
      </section>
    </div>
  );
}
