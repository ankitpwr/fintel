import MarketSummary from "@/components/marketSummary";
import { TableDemo } from "@/components/topMover";
import { useTopMovers } from "@/hooks/userMarket";

export default function home() {
  const { data, isLoading, isError, error } = useTopMovers();

  if (isLoading) {
    return <div>Loading ....</div>;
  }

  if (isError) {
    return <div>Error occured ...</div>;
  }
  console.log("data is ", data);
  return (
    <div className="w-dvw h-dvh flex flex-col bg-[#171615] text-white px-12 py-8 gap-20">
      <div className="w-full flex flex-col">
        <h1 className="text-4xl font-geistpixel">Market Overview</h1>
        <div className="flex gap-4">
          <p>{new Date().toLocaleDateString()}</p>
          <p>{new Date().getTime().toString()}</p>
        </div>
      </div>

      <MarketSummary />
      <div className="w-full flex justify-evenly ">
        <TableDemo data={data["topGainers"]} />
        <TableDemo data={data["topLosers"]} />
      </div>
    </div>
  );
}
