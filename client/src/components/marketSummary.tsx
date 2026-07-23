import { useMarketSummary } from "@/hooks/useMarket";

export default function MarketSummary() {
  const { data, isLoading, isError } = useMarketSummary();

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (isError) {
    return <p>Error occured!</p>;
  }
  return (
    <div className=" bg-[#1e1d1c] border border-[#2b2a29] flex flex-col gap-4 p-8 rounded-xl">
      <h1 className="text-2xl font-googleSans tracking-wide">
        Today's market summary
      </h1>
      <p>{data.generatedAt}</p>
      <p className="font-googleSans text-sm">{data.summary}</p>
    </div>
  );
}
