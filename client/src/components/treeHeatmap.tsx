import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { useTopTicks } from "@/hooks/useMarket";
import { TreemapNode } from "./treeMapNode";

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isPositive = data.change >= 0;

    // Convert to Crores (1 Crore = 10,000,000)
    const marketCapInCrores = data.marketcap / 10000000;

    return (
      <div className="bg-[#171615] border border-[#2b2a29] p-4 rounded-xl shadow-2xl flex flex-col gap-3 min-w-[240px]">
        <div className="flex justify-between items-center border-b border-[#2b2a29] pb-3">
          <span className="font-bold text-white text-lg tracking-wide">
            {data.symbol?.split(".")[0]}
          </span>
          <span
            className={`font-semibold tabular-nums ${isPositive ? "text-[#31f6b8]" : "text-rose-400"}`}
          >
            {isPositive ? "+" : ""}
            {data.change?.toFixed(2)}%
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          <span className="text-xs text-[#a3a3a3] uppercase tracking-wider font-semibold line-clamp-1">
            {data.name}
          </span>

          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-[#a3a3a3]">Price</span>
            <span className="text-sm font-medium text-white tabular-nums">
              ₹{" "}
              {data.price?.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs text-[#a3a3a3]">Market Cap</span>
            <span className="text-sm font-medium text-white tabular-nums">
              ₹{" "}
              {marketCapInCrores.toLocaleString("en-IN", {
                maximumFractionDigits: 0,
              })}{" "}
              Cr
            </span>
          </div>

          {data.analystRating && (
            <div className="flex justify-between items-center pt-1 border-t border-[#2b2a29]/50">
              <span className="text-xs text-[#a3a3a3]">Analyst Rating</span>
              <span className="text-xs font-medium bg-[#262524] px-2 py-1 rounded text-gray-200">
                {data.analystRating}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export function TreemapChart() {
  const { data, isLoading, isError } = useTopTicks();

  if (isLoading) {
    return (
      <div className="flex h-[500px] w-full items-center justify-center bg-[#1e1d1c] border border-[#2b2a29] rounded-xl animate-pulse">
        <span className="text-[#a3a3a3]">Loading market data...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-[500px] w-full items-center justify-center bg-[#1e1d1c] border border-[#2b2a29] rounded-xl text-rose-400">
        Failed to load market data.
      </div>
    );
  }

  return (
    <Card className="w-full bg-[#1e1d1c] border-[#2b2a29] pb-0 text-white shadow-xl overflow-hidden rounded-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold tracking-tight">
          Market Cap Heatmap
        </CardTitle>
        <CardDescription className="text-[#a3a3a3]">
          Top 50 Companies by Capitalization
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        <ChartContainer config={{}} className="h-[440px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={data || []}
              dataKey="marketcap"
              aspectRatio={4 / 3}
              content={<TreemapNode />}
              isAnimationActive={false}
            >
              <Tooltip content={<CustomTooltip />} cursor={false} />
            </Treemap>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
