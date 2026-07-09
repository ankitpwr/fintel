import { getMarketSummary, getTopMovers } from "@/api/market";
import { useQuery } from "@tanstack/react-query";

export function useMarketSummary() {
  return useQuery({
    queryKey: ["market", "summary"],
    queryFn: getMarketSummary,
  });
}

export function useTopMovers() {
  return useQuery({
    queryKey: ["market", "top movers"],
    queryFn: getTopMovers,
  });
}
