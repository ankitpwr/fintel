import { tool } from "@langchain/core/tools";

import { z } from "zod";

import { calculator } from "./calculator.tool";
import { mathsSubagent } from "../core/quantitative.node";
import {
  fetchBalanceSheet,
  fetchCashFlow,
  fetchIncomeStatement,
  fetchPeersInfo,
  fetchPriceHistory,
  fetchShareHoldingInfo,
  fetchStockInfo,
} from "./financial.tool";
import {
  earningCallPDFSummarizer,
  fetchcorporateAction,
  fetchEarningCallPDF,
  fetchLatestNews,
} from "./sentiment.tools";
import { fetchMarketOverview, fetchTopMovers } from "./market.tools";

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

export const earningCallPdfSummaryTool = tool(
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
  async ({
    symbol,
    period1,
    period2,
  }: {
    symbol: string;
    period1?: string;
    period2?: string;
  }) => {
    try {
      const data = await fetchBalanceSheet(symbol, period1, period2);
      return JSON.stringify(data);
    } catch (error) {
      console.log("error in balance sheet tool ", error);
      return `Tool failed: ${error instanceof Error ? error.message : "unknown error"}`;
    }
  },
  {
    name: "fetch_balance_sheet",
    description:
      "Get the balance sheet financial statement for a company stock symbol. If the user asks for a specific year, provide the start and end dates for that year else provide nothing.",
    schema: z.object({
      symbol: z.string().describe("The stock ticker symbol, e.g. RELIANCE"),
      period1: z
        .string()
        .optional()
        .describe("Start date in YYYY-MM-DD format (e.g., '2025-01-01')."),
      period2: z
        .string()
        .optional()
        .describe("End date in YYYY-MM-DD format (e.g., '2026-04-01')"),
    }),
  },
);

export const cashFlowStatementTool = tool(
  async ({
    symbol,
    period1,
    period2,
  }: {
    symbol: string;
    period1?: string;
    period2?: string;
  }) => {
    try {
      const data = await fetchCashFlow(symbol, period1, period2);
      return JSON.stringify(data);
    } catch (error) {
      console.log("error in cash flow tool ", error);
      return `Tool failed: ${error instanceof Error ? error.message : "unknown error"}`;
    }
  },
  {
    name: "fetch_cash_flow_statement",
    description:
      "Get the cash flow financial statement for a company stock symbol. If the user asks for a specific year, provide the start and end dates for that year else provide nothing.",
    schema: z.object({
      symbol: z.string().describe("The stock ticker symbol, e.g. RELIANCE"),
      period1: z
        .string()
        .optional()
        .describe("Start date in YYYY-MM-DD format (e.g., '2025-01-01')."),
      period2: z
        .string()
        .optional()
        .describe("End date in YYYY-MM-DD format (e.g., '2026-04-01')"),
    }),
  },
);

export const incomeStatementTool = tool(
  async ({
    symbol,
    period1,
    period2,
  }: {
    symbol: string;
    period1?: string;
    period2?: string;
  }) => {
    try {
      const data = await fetchIncomeStatement(symbol, period1, period2);
      return JSON.stringify(data);
    } catch (error) {
      console.log("error in income statement tool ", error);
      return `Tool failed: ${error instanceof Error ? error.message : "unknown error"}`;
    }
  },
  {
    name: "fetch_income_statement",
    description:
      "Get the income financial statement for a company stock symbol. If the user asks for a specific year, provide the start and end dates for that year else provide nothing.",
    schema: z.object({
      symbol: z.string().describe("The stock ticker symbol, e.g. RELIANCE"),
      period1: z
        .string()
        .optional()
        .describe("Start date in YYYY-MM-DD format (e.g., '2025-01-01')."),
      period2: z
        .string()
        .optional()
        .describe("End date in YYYY-MM-DD format (e.g., '2026-04-01')"),
    }),
  },
);

export const priceHistoryTool = tool(
  async ({ symbol, startDate }: { symbol: string; startDate: string }) => {
    try {
      const data = await fetchPriceHistory(symbol, startDate);
      return JSON.stringify(data);
    } catch (error) {
      console.log("error in income statement tool ", error);
      return `Tool failed: ${error instanceof Error ? error.message : "unknown error"}`;
    }
  },
  {
    name: "fetch_price_history",
    description:
      "Get the historic price for a company stock symbol. If the user asks for a specific year, provide the start and end dates for that year else provide nothing.",
    schema: z.object({
      symbol: z.string().describe("The stock ticker symbol, e.g. RELIANCE"),
      startDate: z
        .string()
        .optional()
        .describe("Start date in YYYY-MM-DD format (e.g., '2025-01-01')."),
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

export const topMoversTool = tool(
  async () => {
    try {
      const data = await fetchTopMovers();
      return JSON.stringify(data);
    } catch (error) {
      console.log("error in top gainer tool ", error);
      return `Tool failed: ${error instanceof Error ? error.message : "unknown error"}`;
    }
  },
  {
    name: "fetch_top_gainers",
    description: "Get today's top gaining and lossing stocks in market",
  },
);

export const newsTool = tool(
  async ({ searchQuery }: { searchQuery: string }) => {
    try {
      const data = await fetchLatestNews(searchQuery);
      return JSON.stringify(data);
    } catch (error) {
      console.log("error in top looser tool ", error);
      return `Tool failed: ${error instanceof Error ? error.message : "unknown error"}`;
    }
  },
  {
    name: "fetch_latest_news",
    description:
      "Get the latest news articles about a stock, company, or market event",
    schema: z.object({
      searchQuery: z
        .string()
        .describe("A highly specific search query for the news engine"),
    }),
  },
);

export const corporateActionTool = tool(
  async ({ symbol, startDate }: { symbol: string; startDate: string }) => {
    try {
      const data = await fetchcorporateAction(symbol, startDate);
      return JSON.stringify(data);
    } catch (error) {
      console.log("error in corporate action tool ", error);
      return `Tool failed: ${error instanceof Error ? error.message : "unknown error"}`;
    }
  },
  {
    name: "fetch_corporate_action",
    description:
      "Get the latest corporate actions such as historical dividends, stock splits, and earnings dates for a specific NSE stock. If the user asks for a specific year, provide the start date else provide nothing.",
    schema: z.object({
      symbol: z.string().describe("The stock ticker symbol, e.g. RELIANCE"),
      startDate: z
        .string()
        .optional()
        .describe("Start date in YYYY-MM-DD format (e.g., '2025-01-01')."),
    }),
  },
);

export const calculatorTool = tool(
  async ({ expression }: { expression: string }) => {
    try {
      const data = await calculator(expression);
      return JSON.stringify(data);
    } catch (error) {
      console.log("error in calculator tool ", error);
      return `Tool failed: ${error instanceof Error ? error.message : "unknown error"}`;
    }
  },
  {
    name: "calculator",
    description:
      "Use this tool to evaluate complex mathematical expressions, decimals, and matrices etc.",
    schema: z.object({
      expression: z.string().describe(`The math expression to evaluate.
          Example of expression: - 
          a. "2^3 * 4.5",
          b. "2 + 3 * sqrt(4) / 2",
          c. "cos(45 deg)",
          d. "sqrt(3^2 + 4^2)"
          e. "derivative('x^3 + 2x^2 + 5', 'x')"
          
          `),
    }),
  },
);

export const mathExpertTool = tool(
  async ({ queries }: { queries: string[] }) => {
    try {
      const data = await mathsSubagent(queries);
      return JSON.stringify(data);
    } catch (error) {
      console.log("error in math expert tool ", error);
      return `Tool failed: ${error instanceof Error ? error.message : "unknown error"}`;
    }
  },
  {
    name: "math_expert_tool",
    description:
      "Use this tool to calculate and find the missing financial metric.",
    schema: z.object({
      queries: z
        .array(z.string())
        .describe(
          `Array containing one of more missing financial metric with input raw data values for finding that metric. no mathamatics formula for metric is required`,
        ),
    }),
  },
);
