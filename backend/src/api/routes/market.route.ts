import { Router } from "express";
import {
  currency,
  index,
  marketSummary,
  standoutTickers,
  topIndices,
  topMovers,
  topNews,
  topTickers,
} from "../controllers/market.controller";

export const marketRouter = Router();

marketRouter.get("/summary", marketSummary);
marketRouter.get("/movers", topMovers);
marketRouter.get("/indices", index);
marketRouter.get("/indices/top", topIndices);
marketRouter.get("/ticks/top", topTickers);
marketRouter.get("/currency", currency);
marketRouter.get("/news", topNews);
marketRouter.get("/ticks/standout/:symbol", standoutTickers);
