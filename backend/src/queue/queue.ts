import { Queue } from "bullmq";

import { redisClient } from "../lib/redis";
export const queryQueue = new Queue("user-query-queue", {
  connection: redisClient as any,
  defaultJobOptions: { removeOnComplete: 100, removeOnFail: 400 },
});

export const marketSummaryQueue = new Queue("market-summary-queue", {
  connection: redisClient as any,
  defaultJobOptions: { removeOnComplete: 20, removeOnFail: 20 },
});
