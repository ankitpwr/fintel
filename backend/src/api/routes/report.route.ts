import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import {
  generateReport,
  historicChat,
  historicChats,
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
reportRouter.get("/historic-chats", authMiddleware, historicChats);
reportRouter.get("/historic-chats/:chatId", authMiddleware, historicChat);
