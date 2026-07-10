import { Router } from "express";
import {
  index,
  marketSummary,
  topIndices,
  topMovers,
  topTickers,
} from "../controllers/market.controller";

export const marketRouter = Router();

marketRouter.get("/summary", marketSummary);

marketRouter.get("/movers", topMovers);
marketRouter.get("/indices", index);
marketRouter.get("/indices/top", topIndices);
marketRouter.get("/ticks/top", topTickers);
