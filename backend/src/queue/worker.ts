import { Worker, type Job } from "bullmq";

import { startAgent } from "../agent/agent";
import { prisma } from "../lib/prisma";
import { redisClient } from "../lib/redis";
import { marketSummaryQueue } from "./queue";

const QUEUE_NAMES = {
  userQuery: "user-query-queue",
  marketSummary: "market-summary-queue",
} as const;

const MARKET_SUMMARY_TTL_SECONDS = 6 * 60 * 60;
const MARKET_SUMMARY_CRON_MS = 5 * 60 * 60 * 1000;

type QueryType = "brief" | "detailed" | "market summary";

type UserQueryJobData = {
  userQuery: string;
  queryType: QueryType;
  userId?: string;
};

type MarketSummaryJobData = {
  userQuery: string;
  queryType: "market summary";
};

const log = {
  info: (message: string) => console.log(`[worker] ${message}`),
  error: (message: string, error?: unknown) =>
    console.error(`[worker] ${message}`, error ?? ""),
};

function formatJobReference(job?: Job) {
  return job ? `${job.name}#${job.id ?? "unknown"}` : "unknown job";
}

async function persistUserReport(
  response: Awaited<ReturnType<typeof startAgent>>,
) {
  if (!response) {
    throw new Error("Agent did not return a response for the queued query");
  }

  await prisma.report.create({
    data: {
      userQuery: response.userQuery,
      finalResponse: response.finalResponse,
      toolInvoked: response.toolsUsed,
      userId: response.userId,
      totalTokensUsed: response.totalTokenUsed,
    },
  });
}

async function processUserQueryJob(job: Job<UserQueryJobData>) {
  const { userQuery, queryType, userId = "admin" } = job.data;

  log.info(
    `Processing ${formatJobReference(job)} with queryType=${queryType} and userId=${userId}`,
  );

  const response = await startAgent(userQuery, queryType, userId);
  await persistUserReport(response);

  return response;
}

async function processMarketSummaryJob(job: Job<MarketSummaryJobData>) {
  const { userQuery, queryType } = job.data;
  const result = await startAgent(userQuery, queryType);
  const summary = result?.finalResponse ?? "";
  const payload = {
    generatedAt: new Date().toISOString(),
    summary,
  };

  await redisClient.set(
    "market-summary",
    JSON.stringify(payload),
    "EX",
    MARKET_SUMMARY_TTL_SECONDS,
  );

  return payload;
}

export async function startQueryWorker() {
  const queryWorker = new Worker<UserQueryJobData>(
    QUEUE_NAMES.userQuery,
    async (job) => {
      if (!job) {
        throw new Error("Received an empty job for user-query queue");
      }
      return processUserQueryJob(job);
    },
    {
      connection: redisClient as any,
      concurrency: 2,
    },
  );

  queryWorker.on("completed", (job) => {
    log.info(`Job ${formatJobReference(job)} completed successfully`);
  });

  queryWorker.on("failed", (job, err) => {
    log.error(`Job ${formatJobReference(job)} failed`, err);
  });

  queryWorker.on("error", (err) => {
    log.error("User query worker encountered an error", err);
  });

  return queryWorker;
}

export async function startMarketSummaryWorker() {
  const marketSummaryWorker = new Worker<MarketSummaryJobData>(
    QUEUE_NAMES.marketSummary,
    async (job) => {
      if (!job) {
        throw new Error("Received an empty job for market-summary queue");
      }

      return processMarketSummaryJob(job);
    },
    {
      connection: redisClient as any,
    },
  );

  marketSummaryWorker.on("completed", (job) => {
    log.info(`Job ${formatJobReference(job)} completed successfully`);
  });

  marketSummaryWorker.on("failed", (job, err) => {
    log.error(`Job ${formatJobReference(job)} failed`, err);
  });

  marketSummaryWorker.on("error", (err) => {
    log.error("Market summary worker encountered an error", err);
  });

  return marketSummaryWorker;
}

export async function initMarketSummaryScheduler() {
  await marketSummaryQueue.upsertJobScheduler(
    "market-summary",
    { every: MARKET_SUMMARY_CRON_MS },
    {
      name: "market-summary",
      data: {
        userQuery:
          "Summarize today's Indian stock market: NIFTY, Sensex, Bank Nifty movement, overall sentiment.",
        queryType: "market summary",
      },
      opts: {
        attempts: 3,
        backoff: { type: "exponential", delay: 1000 },
      },
    },
  );

  log.info("Market summary scheduler initialized successfully");
}

let workersStarted = false;

export async function startWorkers() {
  if (workersStarted) {
    log.info("Workers already started; skipping duplicate bootstrap");
    return;
  }

  workersStarted = true;

  await Promise.all([
    startQueryWorker(),
    startMarketSummaryWorker(),
    initMarketSummaryScheduler(),
  ]);

  log.info("All queue workers and scheduler started successfully");
}

if (import.meta.main) {
  void startWorkers();
}
