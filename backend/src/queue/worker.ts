import { Worker } from "bullmq";
import { startAgent } from "../agent/agent";
import { redisClient } from "../lib/redis";
import { marketSummaryQueue } from "./queue";
const queryWorker = new Worker(
  "user-query-queue",
  async (job) => {
    console.log(
      `Worker picked up Job ${job.id} of type ${job.name} with job data as ${job.data}`,
    );
    await startAgent(
      job.data["userQuery"],
      job.data["queryType"],
      job.data["userId"],
    );
  },
  { connection: redisClient as any, concurrency: 2 },
);

const marketSummaryWorker = new Worker(
  "market-summary-queue",
  async (job) => {
    const response = await startAgent(
      job.data["userQuery"],
      job.data["queryType"],
    );

    //store in redis
    await redisClient.set(
      "market-summary",
      JSON.stringify({
        generatedAt: new Date(),
        summary: response,
      }),
      "EX",
      6 * 60 * 60 * 1000,
    );

    return JSON.stringify({
      generatedAt: new Date(),
      summary: response,
    });
  },
  { connection: redisClient as any },
);

export async function initMarketSummaryScheduler() {
  await marketSummaryQueue.upsertJobScheduler(
    "market-summary",
    { every: 5 * 60 * 60 * 1000 },
    {
      data: {
        userQuery:
          "Summarize today's Indian stock market: NIFTY, Sensex, Bank Nifty movement, overall sentiment.",
        queryType: "brief",
      },
      opts: { attempts: 3, backoff: { type: "exponential", delay: 1000 } },
    },
  );
}
initMarketSummaryScheduler().then(() => console.log("scheduler initialized"));

queryWorker.on("completed", (job) => {
  console.log(`${job.id} has completed!`);
});
queryWorker.on("failed", (job, err) => {
  console.log(`${err.message}`);
});

marketSummaryWorker.on("completed", (job) => {
  console.log("job completed!");
});
marketSummaryWorker.on("failed", (job, err) => {
  console.log("job failed!");
});
