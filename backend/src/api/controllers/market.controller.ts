import type { Request, Response } from "express";
import { marketSummaryQueue } from "../../queue/queue";
import { redisClient } from "../../lib/redis";
import { nseClient } from "../../lib/nseClient";

export const marketSummary = async (req: Request, res: Response) => {
  try {
    //check in redis
    const cachedSummary = await redisClient.get("market-summary");
    if (cachedSummary) {
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
