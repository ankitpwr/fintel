import Redis from "ioredis";

const HOST = "localhost";

export const redisClient = new Redis({
  host: HOST,
  port: 6379,
});
