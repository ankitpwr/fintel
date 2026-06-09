import "dotenv/config";
import axios from "axios";
import YahooFinance from "yahoo-finance2";
import type { ShareHoldingInfo } from "../types/agent.types";
import { TavilySearch } from "@langchain/tavily";

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

console.log(process.env.TAVILY_API_KEY);

const yahooFinance = new YahooFinance({
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

export async function fetchBalanceSheet(symbol: string) {
  try {
    const result = await yahooFinance.fundamentalsTimeSeries(`${symbol}.NS`, {
      period1: "2024-01-01",
      period2: new Date().toISOString().split("T")[0],
      type: "annual",
      module: "balance-sheet",
    });
    const data = result[result.length - 1];

    if (data) {
      Object.assign(data, { symbol });
    }
    return data;
  } catch (error) {
    console.error("Error fetching balance sheet:", error);
    console.log(error);
    return {
      balanceSheet: { error: "Tool Failed" },
    };
  }
}

export async function fetchCashFlow(symbol: string) {
  try {
    const result = await yahooFinance.fundamentalsTimeSeries(`${symbol}.NS`, {
      period1: "2024-01-01",
      period2: new Date().toISOString().split("T")[0],
      type: "annual",
      module: "cash-flow",
    });
    const data = result[result.length - 1];

    if (data) {
      Object.assign(data, { symbol });
    }
    return data;
  } catch (error) {
    console.error("Error cash flow tool:", error);
    console.log(error);
    return { cashFlowStatement: { error: "Tool Failed" } };
  }
}

export async function fetchIncomeStatement(symbol: string) {
  try {
    const result = await yahooFinance.fundamentalsTimeSeries(`${symbol}.NS`, {
      period1: "2024-01-01",
      period2: new Date().toISOString().split("T")[0],
      type: "annual",
      module: "financials",
    });
    const data = result[result.length - 1];

    if (data) {
      Object.assign(data, { symbol });
    }
    return data;
  } catch (error) {
    console.error("Error income statement:", error);
    console.log(error);
    return { incomeStatement: { error: "Tool Failed" } };
  }
}

export async function fetchPriceHistory(symbol: string) {
  try {
    const response = await yahooFinance.chart(`${symbol}.NS`, {
      period1: "2025-01-01",
      interval: "1mo",
    });

    return response.quotes;
  } catch (error) {
    console.log("error in fech_price_history");
    console.log(error);
    return "Tool Failed";
  }
}

export async function fetchMarketOverview() {
  const indices = [
    "^NSEI", // Nifty 50
    "^BSESN", // Sensex
    "^NSEBANK", // Bank Nifty
    "^CNXIT", // Nifty IT
    "^CNXAUTO", // Auto
    "^CNXPHARMA", // Pharma
  ];
  try {
    const result = await Promise.all(
      indices.map((symbol) => yahooFinance.quote(symbol)),
    );
    const data = result.map((r) => ({
      symbol: r.symbol,

      name: r.shortName,

      price: r.regularMarketPrice,

      change: r.regularMarketChange,

      changePercent: r.regularMarketChangePercent,

      dayHigh: r.regularMarketDayHigh,

      dayLow: r.regularMarketDayLow,

      previousClose: r.regularMarketPreviousClose,

      updatedAt: r.regularMarketTime,

      fiftyTwoWeekHigh: r.fiftyTwoWeekHigh,

      fiftyTwoWeekLow: r.fiftyTwoWeekLow,
    }));
    return data;
  } catch (error) {
    console.log("error in fetch_market_overview");
    console.log(error);
    return "Tool Failed";
  }
}

export async function fetchTopGainers() {
  try {
    const gainers = await nseClient(
      `/NextApi/apiClient?functionName=getMarketSnapshot&&type=G`,
    );

    const data = gainers.data.data.topGainers.map((stock: any) => ({
      tickerSymbol: stock.symbol,
      currentPrice: stock.lastPrice,
      previousClosePrice: stock.previousClose,
      priceChange: stock.change,
      percentChange: stock.pchange,
      openingPrice: stock.openPrice,
      dayHighPrice: stock.highPrice,
      dayLowPrice: stock.lowPrice,
      corporateActionExDate: stock.caExDt,
    }));
    return data;
  } catch (error) {
    console.log("error in top_gainer_tool");
    console.log(error);
    return "Tool Failed";
  }
}

export async function fetchTopLosers() {
  try {
    const gainers = await nseClient(
      `/NextApi/apiClient?functionName=getMarketSnapshot&&type=L`,
    );

    const data = gainers.data.data.topLoosers.map((stock: any) => ({
      tickerSymbol: stock.symbol,
      currentPrice: stock.lastPrice,
      previousClosePrice: stock.previousClose,
      priceChange: stock.change,
      percentChange: stock.pchange,
      openingPrice: stock.openPrice,
      dayHighPrice: stock.highPrice,
      dayLowPrice: stock.lowPrice,
      corporateActionExDate: stock.caExDt,
    }));
    return data;
  } catch (error) {
    console.log("error in top_losers_tool");
    console.log(error);
    return "Tool Failed";
  }
}

export async function fetchLatestNews(searchQuery: string) {
  try {
    const tool = new TavilySearch({
      maxResults: 5,
      topic: "news",
      includeImages: false,
      searchDepth: "basic",
      tavilyApiKey: process.env.TAVILY_API_KEY,
    });

    const modelGeneratedToolCall = {
      args: { query: searchQuery },
      id: "1",
      name: tool.name,
      type: "tool_call" as const,
    };
    const toolMsg = await tool.invoke(modelGeneratedToolCall);
    console.log(toolMsg);
    return toolMsg;
  } catch (error) {
    console.log("error in top_losers_tool");
    console.log(error);
    return "Tool Failed";
  }
}
