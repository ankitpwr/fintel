import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import {
  generateReport,
  streamResponse,
} from "../controllers/report.controller";
import { rateLimitMiddleware } from "../../middleware/rateLimit.middleware";

export const reportRouter = Router();

reportRouter.post(
  "/generate",
  authMiddleware,
  rateLimitMiddleware,
  generateReport,
);
reportRouter.get("/stream-update", authMiddleware, streamResponse);
