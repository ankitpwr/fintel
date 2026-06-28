import { Worker } from "bullmq";
import { startAgent } from "../agent/agent";
import { redisClient } from "../lib/redis";

const worker = new Worker(
  "user-query-queue",
  async (job) => {
    console.log(
      `Worker picked up Job ${job.id} of type ${job.name} with job data as ${job.data}`,
    );
    await startAgent(job.data["userQuery"]);
  },
  { connection: redisClient as any },
);

worker.on("completed", (job) => {
  console.log(`${job.id} has completed!`);
});
worker.on("failed", (job, err) => {
  console.log(`${err.message}`);
});
