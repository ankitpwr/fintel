import { nseClient } from "../../lib/apiClient";
import { yahooFinance } from "./financial.tool";

export async function fetchTopIndexPerformance() {
  const indices = [
    "^NSEI", // Nifty 50
    "^BSESN", // Sensex
    "^NSEBANK", // Bank Nifty
    "^CNXIT", // Nifty IT
    "^CNXAUTO", // Auto
    "^CNXPHARMA", // Pharma
    "^CRSMID", // Nifty Midcap 100
    "^CNXSC", // Nifty Smallcap 100
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
    return { sucess: true, topIndexData: data };
  } catch (error) {
    console.log("error in fetch_Top_Index_Performance");
    console.log(error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Top Index tool failed",
    };
  }
}

export async function fetchTopMovers() {
  try {
    const gainers = await nseClient(
      `/NextApi/apiClient?functionName=getMarketSnapshot&&type=G`,
    );
    const looser = await nseClient(
      `/NextApi/apiClient?functionName=getMarketSnapshot&&type=L`,
    );

    const data1 = gainers.data.data.topGainers.map((stock: any) => ({
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

    const data2 = looser.data.data.topLoosers.map((stock: any) => ({
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

    return { success: true, topGainers: data1, topLosers: data2 };
  } catch (error) {
    console.log("error in top_gainer_tool");
    console.log(error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Top mover tool failed",
    };
  }
}
