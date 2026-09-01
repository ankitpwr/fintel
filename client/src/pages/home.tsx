import MarketSummary from "@/components/marketSummary";
import Topindices from "@/components/topindices";
import { TreemapChart } from "@/components/treeHeatmap";
import CurrencyTable from "@/components/currencyTable";
import NewsGrid from "@/components/newsGrid";
import { useTopMovers } from "@/hooks/useMarket";
import { TopMoverTable } from "@/components/topMover";
import { StandoutTick } from "@/components/standout";
import ChatInput from "@/components/chatInput";
import { ThinkingOrb } from "thinking-orbs";

import TopSection from "@/components/topSection";
import { CommodityTable } from "@/components/commodity";

export default function Home() {
  const { data, isLoading, isError } = useTopMovers();

  if (isLoading) {
    return (
      <div className="flex w-full h-full items-center justify-center ">
        <ThinkingOrb state="shaping" size={64} />
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
    <div className="w-full flex flex-col text-white px-6 md:px-24 py-4 pb-20 gap-18 max-w-[1600px] mx-auto">
      <TopSection title="Market Overview" />
      <section className=" pt-8 ">
        <h2 className="font-googleSans text-gray-200">Top Assets</h2>
        <Topindices />
      </section>
      <section className="">
        <MarketSummary />
      </section>
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 ">
        <div className="xl:col-span-8 flex flex-col gap-18">
          <div className="flex flex-col gap-1">
            {" "}
            <h2 className="font-googleSans font-medium  text-gray-200">
              Top 50 Heatmap
            </h2>
            <TreemapChart />
          </div>
          <div className="flex flex-col gap-1">
            {" "}
            <h2 className="font-googleSans font-medium  text-gray-200">
              Standouts
            </h2>
            <StandoutTick symbol={symbol} />
          </div>
        </div>

        <div className="xl:col-span-4 flex flex-col gap-8">
          <div className="flex flex-col gap-1">
            <h2 className="font-googleSans font-medium  text-emerald-400">
              Top Gainers
            </h2>
            <TopMoverTable data={data["topGainers"]} />
          </div>

          <div className="flex flex-col gap-1">
            <h2 className="font-googleSans font-medium   text-rose-400">
              Top Losers
            </h2>
            <TopMoverTable data={data["topLosers"]} />
          </div>

          <div className="flex flex-col gap-1">
            <h2 className="font-googleSans font-medium  text-gray-200">
              Currency Spot Rates
            </h2>
            <CurrencyTable />
          </div>

          <div className="flex flex-col gap-1">
            <h2 className="font-googleSans font-medium  text-gray-200">
              MCX Commodities{" "}
            </h2>
            <CommodityTable />
          </div>
        </div>
      </div>
      <section className="w-full flex flex-col gap-4 border-t border-[#2b2a29] pt-8 mt-4  pb-12">
        <h2 className="font-googleSans font-medium text-xl text-gray-200">
          Top stories
        </h2>
        <NewsGrid />
      </section>
      <ChatInput isFixed={true} />{" "}
    </div>
  );
}
