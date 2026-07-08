import type { Request, Response } from "express";
import { marketSummaryQueue } from "../../queue/queue";
import { redisClient } from "../../lib/redis";
import { json } from "zod";

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
        every: 60 * 60 * 1000,
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
    console.log(error);
    console.log("error in market summary");
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
