import type { Request, Response } from "express";
import { marketSummaryQueue } from "../../queue/queue";
import { redisClient } from "../../lib/redis";
import { nseClient } from "../../lib/nseClient";
import { yahooFinance } from "../../agent/tools/financial.tool";
import { indianTickers } from "../../lib/topTickers";

export const marketSummary = async (req: Request, res: Response) => {
  try {
    //check in redis
    const cachedSummary = await redisClient.get("market-summary");
    if (cachedSummary && JSON.parse(cachedSummary).summary) {
      return res.status(200).json({
        data: JSON.parse(cachedSummary),
      });
    }

    //put in queue
    await marketSummaryQueue.upsertJobScheduler(
      "market-summary",
      {
        every: 5 * 60 * 60 * 1000,
        immediately: true,
      },
      {
        data: {
          userQuery:
            "Summarize today's Indian stock market: NIFTY, Sensex, Bank Nifty movement, overall sentiment.",
        },
        opts: { attempts: 3, backoff: { type: "exponential", delay: 1000 } },
      },
    );

    return res.status(200).json({
      data: "working on it try again later",
    });
  } catch (error) {
    console.log("error in market summary");
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const topMovers = async (req: Request, res: Response) => {
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
      percentChange: stock.pchange,
      openingPrice: stock.openPrice,
    }));

    const data2 = looser.data.data.topLoosers.map((stock: any) => ({
      tickerSymbol: stock.symbol,
      currentPrice: stock.lastPrice,
      percentChange: stock.pchange,

      openingPrice: stock.openPrice,
    }));

    return res.status(200).json({
      data: { topGainers: data1.slice(0, 4), topLosers: data2.slice(0, 4) },
    });
  } catch (error) {
    console.log("error in market summary");
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const index = async (req: Request, res: Response) => {
  try {
    const response = await nseClient(
      "/NextApi/apiClient/indexTrackerApi?functionName=getIndexChart&&index=NIFTY%2050&flag=1D",
    );

    return res.status(200).json({
      data: response.data.data,
    });
  } catch (error) {
    console.log("error in index");
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const topIndices = async (req: Request, res: Response) => {
  try {
    const indices = [
      "^NSEI", // Nifty 50
      "^BSESN", // Sensex
      "^NSEBANK", // Bank Nifty
      "^CNXIT", // Nifty IT
      "^CNXAUTO", // Auto
      "^CNXPHARMA", // Pharma
      "^INDIAVIX", // India Volatility Index
      "^NSMIDCP", // Nifty Next 50
      "^CRSMID", // Nifty Midcap 100
      "^CNXSC", // Nifty Smallcap 100
      "^CRSLDX", // Nifty 500
      "^CNXFMCG", // Nifty FMCG
      "^CNXMETAL", // Nifty Metal
    ];

    const result = await Promise.all(
      indices.map((symbol) => yahooFinance.quote(symbol)),
    );
    console.log(result);
    const data = result
      .filter((index) => index.longName && index.longName != "")
      .map((index) => {
        return {
          name: index.longName,
          price: index.regularMarketPrice,
          change: index.regularMarketChangePercent,
        };
      });
    return res.status(200).json({
      data: data,
    });
  } catch (error) {
    console.log("error in index");
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const topTickers = async (req: Request, res: Response) => {
  try {
    const data = await yahooFinance.quote(indianTickers);

    const tickers = data.map((tick) => {
      return {
        name: tick.shortName,
        symbol: tick.symbol,
        marketcap: tick.marketCap,
        price: tick.regularMarketPrice,
        change: tick.regularMarketChangePercent,
        analystRating: tick.averageAnalystRating,
      };
    });
    return res.status(200).json({
      data: tickers,
    });
  } catch (error) {
    console.log("error in index");
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
