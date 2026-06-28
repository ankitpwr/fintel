import { Queue } from "bullmq";

import { redisClient } from "../lib/redis";
export const queryQueue = new Queue("user-query-queue", {
  connection: redisClient,
});
