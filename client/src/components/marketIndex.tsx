import React from "react";
import { IndexChart } from "./indexChart";
import { useIndex } from "@/hooks/useMarket";

export default function MarketIndex() {
  const { data, isLoading, isError, error } = useIndex();

  if (isLoading) {
    return <div>Loading ....</div>;
  }
  if (isError) {
    return <div>Error occured ...</div>;
  }
  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
      <IndexChart indexTicks={data.grapthData} identifier="NIFTY 50" />
      <IndexChart indexTicks={data.grapthData} identifier="SENSEX" />
    </div>
  );
}
