import "dotenv/config";
import YahooFinance from "yahoo-finance2";
import type { ShareHoldingInfo } from "../../types/agent.types";
import { nseClient } from "../../lib/nseClient";

export const yahooFinance = new YahooFinance({
  suppressNotices: ["yahooSurvey"],
});

export async function fetchStockInfo(symbol: string) {
  try {
    const data = await yahooFinance.quoteSummary(`${symbol}.NS`, {
      modules: [
        "assetProfile",
        "indexTrend",
        "defaultKeyStatistics",
        "industryTrend",
        "summaryDetail",
        "price",
        "summaryProfile",
        "financialData",
      ],
    });

    // console.log("extract-stock-info ", data);

    return {
      stockInfo: {
        companyName: data.price?.longName,
        industry: data.assetProfile?.industry,

        lastTradedPrice: data.price?.regularMarketPrice,
        openPrice: data.price?.regularMarketOpen,
        closePrice: data.price?.regularMarketPreviousClose,
        priceChange: data.price?.regularMarketChange,
        intradayHigh: data.price?.regularMarketDayHigh,
        intradayLow: data.price?.regularMarketDayLow,
        fiftyTwoWeekHigh: data.summaryDetail?.fiftyTwoWeekHigh,
        fiftyTwoWeekLow: data.summaryDetail?.fiftyTwoWeekLow,

        peRatio: data.summaryDetail?.trailingPE,
        pegRatio: data.defaultKeyStatistics?.pegRatio,
        payoutRatio: data.summaryDetail?.payoutRatio,
        quickRatio: data.financialData?.quickRatio,
        currentRatio: data.financialData?.currentRatio,

        eps: data.defaultKeyStatistics?.trailingEps,
        beta: data.summaryDetail?.beta,
        bookValue: data.defaultKeyStatistics?.bookValue,
        priceToBook: data.defaultKeyStatistics?.priceToBook,

        marketCap: data.summaryDetail?.marketCap,
        dividendRate: data.summaryDetail?.dividendRate,
        returnOnAsset: data.financialData?.returnOnAssets,
        returnOnEquity: data.financialData?.returnOnEquity,
      },
    };
  } catch (error) {
    console.log("error in extract-stock-info");
    console.log(error);
    return { stockInfo: { error: "Tool Failed" } };
  }
}

export async function fetchPeersInfo(symbol: string) {
  try {
    const { data } = await nseClient.get(
      `/NextApi/apiClient/GetQuoteApi?functionName=getPeerComparisonData&symbol=${symbol}&type=S&quarter=2025-12&param=industry&index=`,
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
    return { peerInfo: { error: "Tool Failed" } };
  }
}

export async function fetchShareHoldingInfo(symbol: string) {
  try {
    const { data } = await nseClient.get(
      `/NextApi/apiClient/GetQuoteApi?functionName=getShareHoldingPatternCorp&symbol=${symbol}&type=W&noOfRecords=3`,
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
    return { shareHoldingInfo: { error: "Tool Failed" } };
  }
}

export async function fetchBalanceSheet(
  symbol: string,
  period1?: string,
  period2?: string,
) {
  try {
    const start = period1 || "2026-01-01";
    const end = period2 || new Date().toISOString().split("T")[0];
    const result = await yahooFinance.fundamentalsTimeSeries(`${symbol}.NS`, {
      period1: start,
      period2: end,
      type: "annual",
      module: "balance-sheet",
    });
    const dataWithSymbol = result.map((item) => ({ ...item, symbol }));
    // console.log(dataWithSymbol);
    return dataWithSymbol;
  } catch (error) {
    console.error("Error fetching balance sheet:", error);
    console.log(error);
    return {
      balanceSheet: { error: "Tool Failed" },
    };
  }
}

export async function fetchCashFlow(
  symbol: string,
  period1?: string,
  period2?: string,
) {
  try {
    const start = period1 || "2026-01-01";
    const end = period2 || new Date().toISOString().split("T")[0];
    const result = await yahooFinance.fundamentalsTimeSeries(`${symbol}.NS`, {
      period1: start,
      period2: end,
      type: "annual",
      module: "cash-flow",
    });
    const dateWithSymbol = result.map((item) => ({ ...item, symbol }));
    return dateWithSymbol;
  } catch (error) {
    console.error("Error cash flow tool:", error);
    console.log(error);
    return { cashFlowStatement: { error: "Tool Failed" } };
  }
}

export async function fetchIncomeStatement(
  symbol: string,
  period1?: string,
  period2?: string,
) {
  try {
    const start = period1 || "2026-01-01";
    const end = period2 || new Date().toISOString().split("T")[0];
    const result = await yahooFinance.fundamentalsTimeSeries(`${symbol}.NS`, {
      period1: start,
      period2: end,
      type: "annual",
      module: "financials",
    });
    const dateWithSymbol = result.map((item) => ({ ...item, symbol }));
    return dateWithSymbol;
  } catch (error) {
    console.error("Error income statement:", error);
    console.log(error);
    return { incomeStatement: { error: "Tool Failed" } };
  }
}

export async function fetchPriceHistory(symbol: string, startDate?: string) {
  try {
    const start = startDate || "2025-01-01";
    const response = await yahooFinance.chart(`${symbol}.NS`, {
      period1: start,
      interval: "1mo",
    });
    // console.log(response.quotes);
    return response.quotes;
  } catch (error) {
    console.log("error in fech_price_history");
    console.log(error);
    return "Tool Failed";
  }
}
