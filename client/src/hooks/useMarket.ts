import {
  getCurrency,
  getIndexData,
  getMarketSummary,
  getNews,
  getStandoutTicks,
  getTopIndices,
  getTopMovers,
  getTopTicks,
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
    staleTime: 1000 * 10,
  });
}
export function useTopIndices() {
  return useQuery({
    queryKey: ["market", "indices", "top"],
    queryFn: getTopIndices,
    staleTime: 1000 * 60 * 60,
  });
}

export function useTopTicks() {
  return useQuery({
    queryKey: ["market", "ticks", "top"],
    queryFn: getTopTicks,
    staleTime: 1000 * 60 * 60,
  });
}

export function useCurrency() {
  return useQuery({
    queryKey: ["market", "currency"],
    queryFn: getCurrency,
    staleTime: 1000 * 60 * 60 * 4,
  });
}

export function useLatestNews() {
  return useQuery({
    queryKey: ["market", "news"],
    queryFn: getNews,
    staleTime: 1000 * 60 * 60 * 4,
  });
}

export function useStandoutTicks(symbols: string) {
  return useQuery({
    queryKey: ["market", "ticks", "standout", symbols],
    queryFn: () => getStandoutTicks(symbols),

    enabled: symbols != null && symbols != "",
  });
}
