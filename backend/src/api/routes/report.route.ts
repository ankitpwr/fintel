import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { generateReport } from "../controllers/report.controller";

export const reportRouter = Router();

reportRouter.post("/generate", generateReport);
