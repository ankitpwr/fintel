import React from "react";
import {
  CartesianGrid,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

export const description = "An area chart with gradient";

export function IndexChart({
  indexTicks,
  identifier,
}: {
  indexTicks: [number, number][]; // Strongly typing the tuple array
  identifier: string;
}) {
  const chartData = indexTicks.map((ele) => ({
    time: ele[0],
    value: ele[1],
  }));

  const chartConfig = {
    desktop: {
      label: "Index Value",
      color: "#31f6b8",
    },
  } satisfies ChartConfig;

  return (
    <Card className="flex-1 bg-[#1e1d1c] text-white border-[#2b2a29] rounded-xl overflow-hidden transition-all duration-300 ">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold  font-geistmono ">
          {identifier}
        </CardTitle>
        <CardDescription className="text-[#a3a3a3]">
          {Intl.DateTimeFormat("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "short",
          }).format(new Date())}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 px-4 pb-1">
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 12, bottom: 10 }}
            >
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#31f6b8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#31f6b8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#2b2a29"
              />
              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                minTickGap={40}
                tick={{ fill: "#888888", fontSize: 10 }}
                tickFormatter={(value) => {
                  return Intl.DateTimeFormat("en-IN", {
                    hour12: true,
                    hour: "numeric",
                    minute: "2-digit", // Added minutes for better financial precision
                  }).format(new Date(value));
                }}
              />
              <YAxis
                domain={["auto", "auto"]}
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tick={{ fill: "#888888", fontSize: 12 }}
                tickFormatter={(value) => value.toLocaleString("en-IN")}
              />
              <ChartTooltip
                cursor={{
                  stroke: "#555",
                  strokeWidth: 1,
                  strokeDasharray: "3 3",
                }}
                content={
                  <ChartTooltipContent className="bg-[#171615] border-[#2b2a29] text-white" />
                }
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#31f6b8"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorValue)"
                activeDot={{
                  r: 6,
                  fill: "#1e1d1c",
                  stroke: "#31f6b8",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
