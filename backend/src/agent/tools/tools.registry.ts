import { tool } from "@langchain/core/tools";

import { z } from "zod";

import { calculator } from "./calculator.tool";
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
  fetchNews,
} from "./sentiment.tools";
import { fetchTopIndexPerformance, fetchTopMovers } from "./market.tools";
import { quantitativeSubagent } from "../subagents/quantitative.node";
import { sentimentSubagent } from "../subagents/sentiment.subagent";
import { type LangGraphRunnableConfig } from "@langchain/langgraph";

export const stockInfoTool = tool(
  async ({ symbol }: { symbol: string }, config: LangGraphRunnableConfig) => {
    try {
      config.writer?.({
        status: `Analyzing key ratios and intraday metrics for ${symbol}...`,
      });
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
  async ({ symbol }: { symbol: string }, config: LangGraphRunnableConfig) => {
    try {
      config.writer?.({
        status: `Identifying industry peers and competitors for ${symbol}...`,
      });
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
  async ({ symbol }: { symbol: string }, config: LangGraphRunnableConfig) => {
    try {
      config.writer?.({
        status: `Analyzing promoter and institutional ownership for ${symbol}...`,
      });
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
  async (
    {
      symbol,
      comapanyName,
      industry,
    }: {
      symbol: string;
      comapanyName: string;
      industry: string;
    },
    config: LangGraphRunnableConfig,
  ) => {
    try {
      config.writer?.({
        status: `Reading and summarizing the latest earnings call transcript for ${symbol}...`,
      });
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
  async (
    {
      symbol,
      period1,
      period2,
    }: {
      symbol: string;
      period1?: string;
      period2?: string;
    },
    config: LangGraphRunnableConfig,
  ) => {
    try {
      config.writer?.({
        status: `Retrieving balance sheet statements for ${symbol}...`,
      });
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
      "Get the balance sheet financial statement for a company stock symbol. If the user asks for a specific year, provide the start and end dates for that year else provide nothing. ensure that there must be altest 1 year gap between start and end dates",
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
  async (
    {
      symbol,
      period1,
      period2,
    }: {
      symbol: string;
      period1?: string;
      period2?: string;
    },
    config: LangGraphRunnableConfig,
  ) => {
    try {
      config.writer?.({
        status: `Analyzing cash flow statements for ${symbol}...`,
      });
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
      "Get the cash flow financial statement for a company stock symbol. If the user asks for a specific year, provide the start and end dates for that year else provide nothing. ensure that there must be altest 1 year gap between start and end dates",
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
  async (
    {
      symbol,
      period1,
      period2,
    }: {
      symbol: string;
      period1?: string;
      period2?: string;
    },
    config: LangGraphRunnableConfig,
  ) => {
    try {
      config.writer?.({
        status: `Retrieving Income statements for ${symbol}...`,
      });
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
      "Get the income financial statement for a company stock symbol. If the user asks for a specific year, provide the start and end dates for that year else provide nothing. ensure that there must be altest 1 year gap between start and end dates",
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
  async (
    {
      symbol,
      startDate,
    }: {
      symbol: string;
      startDate: string;
    },
    config,
  ) => {
    try {
      // config.writer?.({
      //   status: `Fetching price trends and historical market data for ${symbol}...`,
      // });
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

export const topIndexPerformanceTool = tool(
  async (config: LangGraphRunnableConfig) => {
    try {
      config.writer?.({
        status: `Analyzing current market sentiment across NIFTY 50, SENSEX, and sectoral indices...`,
      });
      const data = await fetchTopIndexPerformance();
      return JSON.stringify(data);
    } catch (error) {
      console.log("error in top index performance tool ", error);
      return `Tool failed: ${error instanceof Error ? error.message : "unknown error"}`;
    }
  },
  {
    name: "top_indices_performance",
    description:
      "Returns TODAY's performance for ALL major Indian indices such as NIFTY 50, SENSEX and other sectoral indices",
    schema: z
      .object({})
      .describe("This tool takes no parameters. call with an empty object."),
  },
);

export const topMoversTool = tool(
  async (config: LangGraphRunnableConfig) => {
    try {
      config.writer?.({
        status: `Scanning the market for today's top gainers and losers...`,
      });
      const data = await fetchTopMovers();
      return JSON.stringify(data);
    } catch (error) {
      console.log("error in top gainer tool ", error);
      return `Tool failed: ${error instanceof Error ? error.message : "unknown error"}`;
    }
  },
  {
    name: "fetch_top_movers",
    description:
      "Use this tool to get top gaining and top losing stocks across the market",
    schema: z
      .object({})
      .describe("This tool takes no parameters call with an empty object."),
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
      "Get the latest news articles about a stock, company, market or financial event",
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
  async (
    { expression }: { expression: string },
    config: LangGraphRunnableConfig,
  ) => {
    try {
      config.writer?.({
        status: `Calculating...`,
      });
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

export const newsAggregatorTool = tool(
  async ({ keyword }: { keyword: string }, config: LangGraphRunnableConfig) => {
    try {
      config.writer?.({
        status: `Searching for latest market news related to "${keyword}"...`,
      });
      const data = await fetchNews(keyword);
      return JSON.stringify(data);
    } catch (error) {
      console.log("error in news tool ", error);
      return `Tool failed: ${error instanceof Error ? error.message : "unknown error"}`;
    }
  },
  {
    name: "new_aggregator_tool",
    description:
      "Use this tools to fetch latest news about stock, company, market performance",
    schema: z.object({
      keyword: z.string()
        .describe(`keyword for which tool need to serach news for.
          example 1:- "Reliance"
          example 2:- "Tata steel",
          example 3: - "Nifty 50",
          example 4: - "National stock Exchange India"`),
    }),
  },
);

export const symbolTool = tool(
  async ({ company }: { company: string }, config: LangGraphRunnableConfig) => {
    try {
      config.writer?.({
        status: `Looking for ticker symbol for ${company}...`,
      });
      const data = await fetchNews(company);
      return JSON.stringify(data);
    } catch (error) {
      console.log("error in symbol tool ", error);
      return `Tool failed: ${error instanceof Error ? error.message : "unknown error"}`;
    }
  },
  {
    name: "symbol_extractor_tool",
    description: "Return the possible ticker symbol for a company",
    schema: z.object({
      company: z.string().describe(`name of the company
          example - "Reliance Industries", "Tata steel", "HDFC", "Infosys"`),
    }),
  },
);

export const quantitativeSubagentTool = tool(
  async (
    { queries }: { queries: string[] },
    config: LangGraphRunnableConfig,
  ) => {
    try {
      config.writer?.({
        status: `Calculating financial metrics...`,
      });
      const data = await quantitativeSubagent(queries);
      return JSON.stringify(data);
    } catch (error) {
      console.log("error in math expert tool ", error);
      return `Tool failed: ${error instanceof Error ? error.message : "unknown error"}`;
    }
  },
  {
    name: "quantitative_subagent_tool",
    description:
      "Use this subagent as tool to calculate and find the missing financial metric by providing raw data for it.",
    schema: z.object({
      queries: z
        .array(
          z
            .string()
            .describe("a single fianancial missing metric with raw input data"),
        )
        .max(3)
        .describe(
          `Array containing atmost 3 missing financial metric with input raw data values for finding that metric.`,
        ),
    }),
  },
);

export const sentimentSubagentTool = tool(
  async ({ query }: { query: string }, config: LangGraphRunnableConfig) => {
    try {
      config.writer?.({
        status: `Analyzing recent news flow and overall sentiment for ${query}...`,
      });
      const data = await sentimentSubagent(query);
      return JSON.stringify(data);
    } catch (error) {
      console.log("error in sentiment tool ", error);
      return `Tool failed: ${error instanceof Error ? error.message : "unknown error"}`;
    }
  },
  {
    name: "sentiment_subagent_tool",
    description:
      "Use this subagent as tool to get the sentiment and latest news summary on stock, company or market overviews and performace.",
    schema: z.object({
      query: z.string().describe(`company name, sector or stock name.
        example: - 'Tata motors', 'Reliance', 'NIFTY50','National stock Exchange India', `),
    }),
  },
);
