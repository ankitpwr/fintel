import React from "react";
import {
  CartesianGrid,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { useStandoutTicks } from "@/hooks/useMarket";
import { TrendDownIcon, TrendUpIcon } from "@phosphor-icons/react";

const formatTime = (value: string | number) =>
  Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(value));

const formatRupee = (value: number, decimals: number = 2) =>
  value.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

// Sleek custom tooltip for the standout stock chart
const ChartCustomTooltip = ({ active, payload, openPrice }: any) => {
  if (!active || !payload?.length) return null;

  const point = payload[0].payload;
  const diffPercent = openPrice
    ? ((point.value - openPrice) / openPrice) * 100
    : 0;
  const isPositive = diffPercent >= 0;

  return (
    <div className="bg-[#171615]/95 backdrop-blur-sm border border-[#2b2a29] px-3.5 py-2.5 rounded-lg shadow-2xl flex flex-col gap-1.5 min-w-[130px]">
      <span className="text-[10px] font-medium text-[#8a8987] uppercase tracking-wider">
        {formatTime(point.time)}
      </span>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-white tabular-nums">
          ₹{formatRupee(point.value)}
        </span>
        <span
          className={`text-[11px] font-medium tabular-nums ${
            isPositive ? "text-[#31f6b8]" : "text-rose-400"
          }`}
        >
          {isPositive ? "+" : ""}
          {diffPercent.toFixed(2)}%
        </span>
      </div>
    </div>
  );
};

export function StandoutTick({ symbol }: { symbol: string }) {
  const { data, isLoading, isError } = useStandoutTicks(symbol);

  if (isLoading) {
    return (
      <div className="h-[380px] w-full animate-pulse bg-[#1e1d1c] rounded-xl border border-[#2b2a29]" />
    );
  }
  if (isError || !data) {
    return (
      <div className="h-[380px] w-full flex items-center justify-center bg-[#1e1d1c] rounded-xl border border-[#2b2a29] text-rose-400 text-sm">
        Error loading standout stock metrics.
      </div>
    );
  }

  const chartData = data.price.map((ele: any) => ({
    time: ele.date,
    value: ele.price,
  }));

  const [rawSymbol, exchangeSuffix] = symbol.split(".");
  const cleanSymbol = rawSymbol;

  const openPrice = chartData[0]?.value || 0;
  const latestPrice = chartData[chartData.length - 1]?.value || 0;
  const netChangePercent = openPrice
    ? ((latestPrice - openPrice) / openPrice) * 100
    : 0;
  const isPositive = netChangePercent >= 0;
  const trendColor = isPositive ? "#31f6b8" : "#f87171";

  const marketCapInCrores = data.marketCap / 10000000;

  const values = chartData.map((d: any) => d.value);
  const valueSpan = Math.max(...values) - Math.min(...values) || 1;
  const yPadding = Math.max(valueSpan * 0.12, 1);

  const chartConfig = {
    desktop: {
      label: "Stock Value",
      color: trendColor,
    },
  } satisfies ChartConfig;

  return (
    <Card className="w-full bg-[#1e1d1c] border border-[#2b2a29] rounded-xl overflow-hidden shadow-xl">
      <CardContent className="p-6 pt-0 flex flex-col gap-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex flex-col gap-0.5">
              <h1 className="text-[16px] font-semibold text-white leading-tight font-geistmono">
                {data.name}
              </h1>
              <h2 className="text-[10px]  text-zinc-300">{symbol}.NS</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-2xl font-semibold text-white tabular-nums tracking-tight">
              ₹{formatRupee(latestPrice, 0)}
            </span>
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium tabular-nums border ${
                isPositive
                  ? "bg-[#31f6b8]/10 text-[#31f6b8] border-[#31f6b8]/20"
                  : "bg-rose-500/10 text-rose-400 border-rose-500/20"
              }`}
            >
              {isPositive ? (
                <TrendUpIcon className="w-3.5 h-3.5" weight="bold" />
              ) : (
                <TrendDownIcon className="w-3.5 h-3.5" weight="bold" />
              )}
              {isPositive ? "+" : ""}
              {netChangePercent.toFixed(2)}%
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-9 w-full">
            <ChartContainer config={chartConfig} className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 16, left: 4, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id={`standoutColor-${cleanSymbol}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={trendColor}
                        stopOpacity={0.25}
                      />
                      <stop
                        offset="95%"
                        stopColor={trendColor}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#2b2a29"
                    strokeOpacity={0.6}
                  />
                  <XAxis
                    dataKey="time"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={12}
                    minTickGap={48}
                    padding={{ left: 12, right: 12 }}
                    tick={{ fill: "#6b6a69", fontSize: 11, fontWeight: 400 }}
                    tickFormatter={formatTime}
                  />
                  <YAxis
                    domain={[
                      (min: number) => Math.floor(min - yPadding),
                      (max: number) => Math.ceil(max + yPadding),
                    ]}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    width={56}
                    tick={{ fill: "#6b6a69", fontSize: 11, fontWeight: 400 }}
                    tickFormatter={(value) => value.toLocaleString("en-IN")}
                  />
                  <ReferenceLine
                    y={openPrice}
                    stroke="#6b6a69"
                    strokeDasharray="4 4"
                    strokeOpacity={0.7}
                    label={{
                      value: `Open: ₹${formatRupee(openPrice)}`,
                      position: "insideBottomRight",
                      fill: "#8a8987",
                      fontSize: 10,
                      fontWeight: 500,
                      dy: -6,
                    }}
                  />
                  <Tooltip
                    content={<ChartCustomTooltip openPrice={openPrice} />}
                    cursor={{ stroke: "#3a3937", strokeWidth: 1 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={trendColor}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill={`url(#standoutColor-${cleanSymbol})`}
                    activeDot={{
                      r: 4.5,
                      fill: "#1e1d1c",
                      stroke: trendColor,
                      strokeWidth: 2,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          <div className="lg:col-span-3 text-xs border-t lg:border-t-0 lg:border-l border-[#2b2a29] pt-4 lg:pt-0 lg:pl-6 flex flex-col gap-3.5">
            <div className="flex justify-between items-center ">
              <span className="text-[#8a8987]">Market Cap</span>
              <span className="font-medium text-white tabular-nums">
                ₹
                {marketCapInCrores.toLocaleString("en-IN", {
                  maximumFractionDigits: 0,
                })}{" "}
                Cr
              </span>
            </div>

            <div className="flex justify-between items-center ">
              <span className="text-[#8a8987]">P/E Ratio</span>
              <span className="font-medium text-white tabular-nums">
                {data.pe?.toFixed(2) ?? "--"}
              </span>
            </div>

            <div className="flex justify-between items-cente">
              <span className="text-[#8a8987] font-normal">Session High</span>
              <span className="font-medium text-emerald-400 tabular-nums">
                ₹{data.high?.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[#8a8987] ">Session Low</span>
              <span className="font-medium text-rose-400 tabular-nums">
                ₹{data.low?.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
