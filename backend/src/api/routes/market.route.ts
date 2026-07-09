import { Router } from "express";
import { marketSummary, topMovers } from "../controllers/market.controller";

export const marketRouter = Router();

marketRouter.get("/summary", marketSummary);

marketRouter.get("/top-movers", topMovers);
