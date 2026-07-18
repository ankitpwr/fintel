import type { Request, Response } from "express";
import { marketSummaryQueue } from "../../queue/queue";
import { redisClient } from "../../lib/redis";
import { nseClient } from "../../lib/nseClient";
import { yahooFinance } from "../../agent/tools/financial.tool";
import { indianTickers } from "../../lib/topTickers";
import axios from "axios";
import { standOutTickerSchema } from "../../lib/zodSchema";

export const marketSummary = async (req: Request, res: Response) => {
  try {
    const cachedSummary = await redisClient.get("market-summary");
    if (cachedSummary && JSON.parse(cachedSummary).summary) {
      return res.status(200).json({ data: JSON.parse(cachedSummary) });
    }
    return res.status(200).json({ data: "working on it try again later" });
  } catch (error) {
    console.log("error in market summary", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const topMovers = async (req: Request, res: Response) => {
  try {
    const cachedTopGainers = await redisClient.get("top-movers-gainers");
    const cachedTopLosers = await redisClient.get("top-movers-losers");

    if (cachedTopGainers && cachedTopLosers) {
      return res.status(200).json({
        topGainers: JSON.parse(cachedTopGainers).slice(0, 4),
        topLosers: JSON.parse(cachedTopLosers).slice(0, 4),
      });
    }

    const gainers = await nseClient(
      `/NextApi/apiClient?functionName=getMarketSnapshot&&type=G`,
    );
    const loser = await nseClient(
      `/NextApi/apiClient?functionName=getMarketSnapshot&&type=L`,
    );

    const data1 = gainers.data.data.topGainers.map((stock: any) => ({
      tickerSymbol: stock.symbol,
      currentPrice: stock.lastPrice,
      percentChange: stock.pchange,
      openingPrice: stock.openPrice,
    }));

    const data2 = loser.data.data.topLoosers.map((stock: any) => ({
      tickerSymbol: stock.symbol,
      currentPrice: stock.lastPrice,
      percentChange: stock.pchange,
      openingPrice: stock.openPrice,
    }));

    await redisClient.set(
      "top-movers-gainers",
      JSON.stringify(data1),
      "EX",
      1800,
    );
    await redisClient.set(
      "top-movers-loser",
      JSON.stringify(data2),
      "EX",
      1800,
    );
    return res.status(200).json({
      data: { topGainers: data1.slice(0, 4), topLosers: data2.slice(0, 4) },
    });
  } catch (error) {
    console.log("error in market summary");
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

//ignore
export const index = async (req: Request, res: Response) => {
  try {
    const response = await nseClient(
      "/NextApi/apiClient/indexTrackerApi?functionName=getIndexChart&&index=NIFTY%2050&flag=1D",
    );

    return res.status(200).json({
      data: response.data.data,
    });
  } catch (error) {
    console.log("error in index");
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const topIndices = async (req: Request, res: Response) => {
  try {
    const cachedTopIndices = await redisClient.get("top-indices");

    if (cachedTopIndices) {
      return res.status(200).json({
        data: JSON.parse(cachedTopIndices),
      });
    }
    const indices = [
      "^NSEI", // Nifty 50
      "^BSESN", // Sensex
      "^NSEBANK", // Bank Nifty
      "^CNXIT", // Nifty IT
      "^CNXAUTO", // Auto
      "^CNXPHARMA", // Pharma
      "^INDIAVIX", // India Volatility Index
      "^NSMIDCP", // Nifty Next 50
      "^CRSMID", // Nifty Midcap 100
      "^CNXSC", // Nifty Smallcap 100
      "^CRSLDX", // Nifty 500
      "^CNXFMCG", // Nifty FMCG
      "^CNXMETAL", // Nifty Metal
    ];

    const result = await Promise.all(
      indices.map((symbol) => yahooFinance.quote(symbol)),
    );
    const data = result
      .filter((index) => index.longName && index.longName != "")
      .map((index) => {
        return {
          name: index.longName,
          price: index.regularMarketPrice,
          change: index.regularMarketChangePercent,
        };
      });

    await redisClient.set("top-indices", JSON.stringify(data), "EX", 900);
    return res.status(200).json({
      data: data,
    });
  } catch (error) {
    console.log("error in top index");
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const topTickers = async (req: Request, res: Response) => {
  try {
    const cachedTopTIckers = await redisClient.get("top-tickers");
    if (cachedTopTIckers) {
      return res.status(200).json({
        data: JSON.parse(cachedTopTIckers),
      });
    }
    const data = await yahooFinance.quote(indianTickers);
    const tickers = data.map((tick) => {
      return {
        name: tick.shortName,
        symbol: tick.symbol,
        marketcap: tick.marketCap,
        price: tick.regularMarketPrice,
        change: tick.regularMarketChangePercent,
        analystRating: tick.averageAnalystRating,
      };
    });

    await redisClient.set("top-tickers", JSON.stringify(tickers), "EX", 3600);
    return res.status(200).json({
      data: tickers,
    });
  } catch (error) {
    console.log("error in top ticks");
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const currency = async (req: Request, res: Response) => {
  try {
    const cachedCurrency = await redisClient.get("currency");
    if (cachedCurrency) {
      return res.status(200).json({
        data: JSON.parse(cachedCurrency),
      });
    }
    const response = await nseClient.get(
      `/NextApi/apiClient?functionName=getReferenceRates&&type=null&&flag=CUR`,
    );

    await redisClient.set(
      "currency",
      JSON.stringify(response.data.data),
      "EX",
      1800,
    );
    return res.status(200).json({
      data: response.data.data,
    });
  } catch (error) {
    console.log("error in top ticks");
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const topNews = async (req: Request, res: Response) => {
  try {
    const cachedNews = await redisClient.get("top-news");
    if (cachedNews) {
      return res.status(200).json({
        data: JSON.parse(cachedNews),
      });
    }
    const response = await axios.get(
      `https://newsdata.io/api/1/market?apikey=${process.env.NEWS_TOKEN}&q=nifty50&country=in&language=en`,
    );

    const data = response.data.results.map((n: any) => ({
      newTitle: n.title,
      link: n.link,
      image: n.image_url,
      sourceName: n.source_name,
      sourceIcon: n.source_icon,
    }));

    await redisClient.set("top-news", JSON.stringify(data), "EX", 21600);

    return res.status(200).json({
      data: data,
    });
  } catch (error) {
    console.log("error in top ticks");
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const standoutTickers = async (req: Request, res: Response) => {
  try {
    const cachedStandoutTickers = await redisClient.get("standout-tickers");

    if (cachedStandoutTickers) {
      return res.status(200).json({
        data: JSON.parse(cachedStandoutTickers),
      });
    }
    const parsedData = standOutTickerSchema.safeParse(req.params);
    if (!parsedData.success) {
      return res.json(400).json({
        error: parsedData.error.issues[0]?.message,
      });
    }
    const [price, metric] = await Promise.all([
      yahooFinance.chart(`${parsedData.data.symbol}.NS`, {
        period1: "2026-07-10",
        interval: "2m",
      }),
      yahooFinance.quoteSummary(`${parsedData.data.symbol}.NS`, {
        modules: ["summaryDetail", "summaryProfile"],
      }),
    ]);

    const data = {
      name: price.meta?.longName,
      marketCap: metric.summaryDetail?.marketCap,
      currentPrice: metric.price?.regularMarketPrice,
      pe: metric.summaryDetail?.trailingPE,
      high: metric.summaryDetail?.dayLow,
      low: metric.summaryDetail?.dayHigh,
      change: metric.price?.regularMarketChangePercent,
      price: price.quotes.map((p) => {
        return {
          date: p.date,
          price: p.close,
        };
      }),
    };

    await redisClient.set("standout-tickers", JSON.stringify(data), "EX", 30);
    return res.status(200).json({
      data: data,
    });
  } catch (error) {
    console.log("error in standout ticks");
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
