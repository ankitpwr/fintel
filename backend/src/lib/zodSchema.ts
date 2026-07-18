import { z } from "zod";

export const signupSchema = z.object({
  authCode: z.string({ message: "Invalid auth code" }),
});

export const loginSchema = z.object({
  authCode: z.string({ message: "Invalid auth code" }),
});

export const reportSchemaBody = z.object({
  userQuery: z.string({ message: "Invalid query" }),
  queryType: z.enum(["brief", "detailed"]),
});

export const standOutTickerSchema = z.object({
  symbol: z.string({ message: "Ticker symbol is no present" }),
});
