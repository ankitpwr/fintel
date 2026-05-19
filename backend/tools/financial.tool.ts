import "dotenv/config";
import axios from "axios";
import YahooFinance from "yahoo-finance2";

import type { AppStateType } from "../worker/agent";
import type { ShareHoldingInfo } from "../types/agent.types";

export const nseClient = axios.create({
  baseURL: process.env.BASE_URL,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    Accept: "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    Referer: process.env.BASE_URL,
  },
});

const yahooFinance = new YahooFinance();

export async function extractStockInfo(state: AppStateType) {
  try {
    const { data } = await nseClient.get(
      `/quote-equity?symbol=${state.companySymbol}`,
    );

    // console.log("extract-stock-info ", data);

    return {
      stockInfo: {
        symbol: data.info?.symbol ?? "",
        companyName: data.info?.companyName ?? "",
        industry: data.info?.industry ?? "",
        sector: data.industryInfo?.sector ?? "",
        basicIndustry: data.industryInfo?.basicIndustry ?? "",
        faceValue: data.securityInfo?.faceValue ?? "",

        lastTradedPrice: data.priceInfo?.lastPrice,
        openPrice: data.priceInfo?.open,
        closePrice: data.priceInfo?.close,
        volumeWeightedAveragePrice: data.priceInfo?.vwap,
        priceChange: data.priceInfo?.change,
        percentageChange: data.priceInfo?.pChange,

        intradayHigh: data.priceInfo?.intraDayHighLow?.ma,
        intradayLow: data.priceInfo.intraDayHighLow?.min,
        fiftyTwoWeekHigh: data.priceInfo.weekHighLow.max,
        fiftyTwoWeekLow: data.priceInfo.weekHighLow.min,
        fiftyTwoWeekHighDate: data.priceInfo.weekHighLow.maxDate,
        fiftyTwoWeekLowDate: data.priceInfo.weekHighLow.minDate,

        sectorPriceToEarningsRatio: data.metadata.pdSectorPe,
        stockPriceToEarningsRatio: data.metadata.pdSymbolPe,
        primaryIndex: data.metadata.pdSectorInd,
      },
    };
  } catch (error) {
    console.log("error in extract-stock-info");
    console.log(error);
  }
}

export async function extractPeersInfo(state: AppStateType) {
  try {
    const { data } = await nseClient.get(
      `/NextApi/apiClient/GetQuoteApi?functionName=getPeerComparisonData&symbol=${state.companySymbol}&type=S&quarter=2025-12&param=industry&index=`,
    );

    // console.log("extract-peers-info ", data);
    return {
      peerInfo: data.map((peer: any) => ({
        symbol: peer.symbol,
        price: peer.ltp,
        priceToEarningsRatio: peer.pe,
        earningsPerShare: peer.eps,
        profitAfterTax: peer.pat,
        totalIncome: peer.totalIncome,
        marketCap: peer.marketCap,
        promoterHoldingPercentage: peer.promoterHolding,
        dayChangePercentage: peer.pChange,
      })),
    };
  } catch (error) {
    console.log("error in extract-peers-info");
    console.log(error);
  }
}

export async function extractShareHoldingInfo(state: AppStateType) {
  try {
    const { data } = await nseClient.get(
      `/NextApi/apiClient/GetQuoteApi?functionName=getShareHoldingPatternCorp&symbol=${state.companySymbol}&type=W&noOfRecords=3`,
    );

    const shareHoldingPattern: ShareHoldingInfo[] = [];
    Object.entries(data).forEach(([key, value]: [string, any]) => {
      shareHoldingPattern.push({
        date: key as string,
        promoterHoldingPercentage:
          "promoter_group" in value
            ? (value.promoter_group.value as number)
            : 0,
        publicHoldingPercentage:
          "public" in value ? (value.public.value as number) : 0,
      });
    });

    return { shareHoldingInfo: shareHoldingPattern };
  } catch (error) {
    console.log("error in extract-share-holding-info");
    console.log(error);
  }
}

export async function extractSymbol(state: AppStateType) {
  try {
    const url =
      `NextApi/globalSearch/equity?symbol=` +
      encodeURIComponent(state.companyName);
    const { data } = await nseClient.get(url);

    if (data["data"].length == 0) return { companySymbol: "" };

    return { companySymbol: data["data"][0]["symbol"] };
  } catch (error) {
    console.log("error in extract-symbol");
    console.log(error);
    return { companySymbol: "" };
  }
}

async function extractBalanceSheet(state: AppStateType) {
  try {
    const result = await yahooFinance.fundamentalsTimeSeries(
      `${state.companySymbol}.NS`,
      {
        period1: "2026-01-01",
        type: "annual",
        module: "balance-sheet",
      },
    );

    console.log("--- DETAILED Balance sheet DATA ---");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Error fetching fundamentals:", error);
  }
}
