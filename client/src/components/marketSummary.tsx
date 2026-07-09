import { useMarketSummary } from "@/hooks/userMarket";
import React from "react";

export default function MarketSummary() {
  const { data, isLoading, isError } = useMarketSummary();

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (isError) {
    return <p>Error occured!</p>;
  }
  return (
    <div className="w-full bg-[#1e1d1c] flex flex-col gap-4 p-8 rounded-xl">
      <h1 className="text-2xl font-geistmono">Today's market summary</h1>
      <p>{data.generatedAt}</p>
      <p className="font-inter text-sm">{data.summary}</p>
    </div>
  );
}
