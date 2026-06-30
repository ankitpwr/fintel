import Redis from "ioredis";

const HOST = "localhost";

export const redisClient = new Redis({
  host: HOST,
  port: 6379,
  maxRetriesPerRequest: null,
});

export const publisherClient = new Redis({
  host: HOST,
  port: 6379,
});

export const subscriber = new Redis({
  host: HOST,
  port: 6379,
});
