import {
  getIndexData,
  getMarketSummary,
  getTopIndices,
  getTopMovers,
} from "@/api/market";
import { useQuery } from "@tanstack/react-query";

export function useMarketSummary() {
  return useQuery({
    queryKey: ["market", "summary"],
    queryFn: getMarketSummary,
    staleTime: 1000 * 60 * 60 * 2,
  });
}

export function useTopMovers() {
  return useQuery({
    queryKey: ["market", "top movers"],
    queryFn: getTopMovers,
    staleTime: 1000 * 60 * 60 * 5,
  });
}

export function useIndex() {
  return useQuery({
    queryKey: ["market", "indices"],
    queryFn: getIndexData,
    staleTime: 1000 * 2,
  });
}
export function useTopIndices() {
  return useQuery({
    queryKey: ["market", "indices", "top"],
    queryFn: getTopIndices,
    staleTime: 1000 * 60 * 60,
  });
}
