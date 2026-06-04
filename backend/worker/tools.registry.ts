import { tool } from "@langchain/core/tools";
import {
  fetchBalanceSheet,
  fetchCashFlow,
  fetchIncomeStatement,
  fetchMarketOverview,
  fetchPeersInfo,
  fetchPriceHistory,
  fetchShareHoldingInfo,
  fetchStockInfo,
  fetchTopGainers,
  fetchTopLosers,
} from "../tools/financial.tool";
import { symbol, z } from "zod";
import {
  earningCallPDFSummarizer,
  fetchEarningCallPDF,
} from "../tools/earningTranscript.tool";

export const stockInfoTool = tool(
  async ({ symbol }: { symbol: string }) => {
    try {
      const data = await fetchStockInfo(symbol);
      return JSON.stringify(data?.stockInfo);
    } catch (error) {
      console.log("error in stock info tool ", error);
      return `Tool failed: ${error instanceof Error ? error.message : "unknown error"}`;
    }
  },
  {
    name: "fetch_stock_information",
    description:
      "Get the information such as intraday data, 52-week high/low, marketCap and other important ratio like peg, eps, beta etc for a company stock symbol",
    schema: z.object({
      symbol: z.string().describe("The stock ticker symbol, e.g. RELIANCE"),
    }),
  },
);

export const peersInfoTool = tool(
  async ({ symbol }: { symbol: string }) => {
    try {
      const data = await fetchPeersInfo(symbol);
      return JSON.stringify(data?.peerInfo);
    } catch (error) {
      console.log("error in peers info tool ", error);
      return `Tool failed: ${error instanceof Error ? error.message : "unknown error"}`;
    }
  },
  {
    name: "fetch_stocks_peers_information",
    description:
      "Get the information of peers and compititor for a company stock symbol",
    schema: z.object({
      symbol: z.string().describe("The stock ticker symbol, e.g. RELIANCE"),
    }),
  },
);

export const shareholdingInfoTool = tool(
  async ({ symbol }: { symbol: string }) => {
    try {
      const data = await fetchShareHoldingInfo(symbol);
      return JSON.stringify(data?.shareHoldingInfo);
    } catch (error) {
      console.log("error in shareholding info tool ", error);
      return `Tool failed: ${error instanceof Error ? error.message : "unknown error"}`;
    }
  },
  {
    name: "fetch_stocks_shareholding_information",
    description:
      "Get the information of shareholding patterns for a company stock symbol",
    schema: z.object({
      symbol: z.string().describe("The stock ticker symbol, e.g. RELIANCE"),
    }),
  },
);

export const earningCallPdfSummary = tool(
  async ({
    symbol,
    comapanyName,
    industry,
  }: {
    symbol: string;
    comapanyName: string;
    industry: string;
  }) => {
    try {
      const response = await fetchEarningCallPDF(symbol);
      if (response?.earningCallTranscriptURL && comapanyName && industry) {
        const data = await earningCallPDFSummarizer({
          url: response.earningCallTranscriptURL,
          companyName: comapanyName,
          industry: industry,
        });

        return JSON.stringify(data.earningCallSummary);
      } else {
        return "Some fields are missing. tools require symbol, companyName and industry";
      }
    } catch (error) {
      console.log("error in shareholding info tool ", error);
      return `Tool failed: ${error instanceof Error ? error.message : "unknown error"}`;
    }
  },
  {
    name: "fetch_earning_call_summary",
    description:
      "Get the earning call summary which include financial figures, new deals, achievements, guidance from executives and potential risks for a company stock symbol",
    schema: z.object({
      symbol: z.string().describe("The stock ticker symbol, e.g. RELIANCE"),
      comapanyName: z.string().describe("name of the company"),
      industry: z.string().describe("industry belong to the company"),
    }),
  },
);

export const balanceSheetTool = tool(
  async ({ symbol }: { symbol: string }) => {
    try {
      const data = await fetchBalanceSheet(symbol);
      return JSON.stringify(data?.balanceSheet);
    } catch (error) {
      console.log("error in balance sheet tool ", error);
      return `Tool failed: ${error instanceof Error ? error.message : "unknown error"}`;
    }
  },
  {
    name: "fetch_balance_sheet",
    description:
      "Get the balance sheet financial statement for a company stock symbol",
    schema: z.object({
      symbol: z.string().describe("The stock ticker symbol, e.g. RELIANCE"),
    }),
  },
);

export const cashFlowStatementTool = tool(
  async ({ symbol }: { symbol: string }) => {
    try {
      const data = await fetchCashFlow(symbol);
      return JSON.stringify(data?.cashFlowStatement);
    } catch (error) {
      console.log("error in cash flow tool ", error);
      return `Tool failed: ${error instanceof Error ? error.message : "unknown error"}`;
    }
  },
  {
    name: "fetch_cash_flow_statement",
    description:
      "Get the cash flow financial statement for a company stock symbol",
    schema: z.object({
      symbol: z.string().describe("The stock ticker symbol, e.g. RELIANCE"),
    }),
  },
);

export const incomeStatementTool = tool(
  async ({ symbol }: { symbol: string }) => {
    try {
      const data = await fetchIncomeStatement(symbol);
      return JSON.stringify(data?.incomeStatement);
    } catch (error) {
      console.log("error in income statement tool ", error);
      return `Tool failed: ${error instanceof Error ? error.message : "unknown error"}`;
    }
  },
  {
    name: "fetch_income_statement",
    description:
      "Get the income financial statement for a company stock symbol",
    schema: z.object({
      symbol: z.string().describe("The stock ticker symbol, e.g. RELIANCE"),
    }),
  },
);

export const priceHistoryTool = tool(
  async ({ symbol }: { symbol: string }) => {
    try {
      const data = await fetchPriceHistory(symbol);
      return JSON.stringify(data);
    } catch (error) {
      console.log("error in income statement tool ", error);
      return `Tool failed: ${error instanceof Error ? error.message : "unknown error"}`;
    }
  },
  {
    name: "fetch_price_history",
    description: "Get the historic price for a company stock symbol",
    schema: z.object({
      symbol: z.string().describe("The stock ticker symbol, e.g. RELIANCE"),
    }),
  },
);

export const marketOverviewTool = tool(
  async () => {
    try {
      const data = await fetchMarketOverview();
      return JSON.stringify(data);
    } catch (error) {
      console.log("error in income statement tool ", error);
      return `Tool failed: ${error instanceof Error ? error.message : "unknown error"}`;
    }
  },
  {
    name: "fetch_market_overview",
    description:
      "Get overall Indian market performance, index movement, NIFTY, Sensex, Bank Nifty, market sentiment, market overview or today's market condition.",
  },
);

export const topGainersTool = tool(
  async () => {
    try {
      const data = await fetchTopGainers();
      return JSON.stringify(data);
    } catch (error) {
      console.log("error in top gainer tool ", error);
      return `Tool failed: ${error instanceof Error ? error.message : "unknown error"}`;
    }
  },
  {
    name: "fetch_top_gainers",
    description: "Get today's highest gaining stocks in market",
  },
);

export const topLosersTool = tool(
  async () => {
    try {
      const data = await fetchTopLosers();
      return JSON.stringify(data);
    } catch (error) {
      console.log("error in top looser tool ", error);
      return `Tool failed: ${error instanceof Error ? error.message : "unknown error"}`;
    }
  },
  {
    name: "fetch_top_gainers",
    description: "Get today's biggest declining stocks in market",
  },
);
