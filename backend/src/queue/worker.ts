import { Worker } from "bullmq";
import { startAgent } from "../agent/agent";
import { redisClient } from "../lib/redis";

const queryWorker = new Worker(
  "user-query-queue",
  async (job) => {
    console.log(
      `Worker picked up Job ${job.id} of type ${job.name} with job data as ${job.data}`,
    );
    await startAgent(job.data["userQuery"], job.data["userId"]);
  },
  { connection: redisClient as any, concurrency: 2 },
);

const marketSummaryWorker = new Worker(
  "market-summary-queue",
  async (job) => {
    const response = await startAgent(job.data["userQuery"]);

    //store in redis
    await redisClient.set(
      "market-summary",
      JSON.stringify({
        generatedAt: new Date(),
        summary: response,
      }),
    );

    return JSON.stringify({
      generatedAt: new Date(),
      summary: response,
    });
  },
  { connection: redisClient as any },
);

// Query Worker Event Listeners
queryWorker.on("completed", (job) => {
  console.log(`${job.id} has completed!`);
});
queryWorker.on("failed", (job, err) => {
  console.log(`${err.message}`);
});
