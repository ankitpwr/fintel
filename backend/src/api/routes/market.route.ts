import { Router } from "express";
import { marketSummary } from "../controllers/market.controller";

export const marketRouter = Router();

marketRouter.get("/summary", marketSummary);
