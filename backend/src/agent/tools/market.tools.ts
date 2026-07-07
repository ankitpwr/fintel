import { nseClient, yahooFinance } from "./financial.tool";

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

    console.log(data1);
    console.log(data2);
    return { topGainers: data1, topLosers: data2 };
  } catch (error) {
    console.log("error in top_gainer_tool");
    console.log(error);
    return "Tool Failed";
  }
}
