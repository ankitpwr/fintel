import {
  Annotation,
  StateGraph,
  START,
  END,
  type Messages,
} from "@langchain/langgraph";
import { tool } from "@langchain/core/tools";
import { MessagesAnnotation } from "@langchain/langgraph";

import {
  fetchBalanceSheet,
  fetchCashFlow,
  fetchIncomeStatement,
  fetchPeersInfo,
  fetchShareHoldingInfo,
  fetchStockInfo,
  fetchSymbol,
} from "../tools/financial.tool";
import {
  earningCallPDFSummarizer,
  fetchEarningCallPDF,
  finalSummarySchema,
} from "../tools/earningTranscript.tool";
import type {
  BalanceSheet,
  CashFlow,
  IncomeStatement,
  PeersInfo,
  ShareHoldingInfo,
  StockInfo,
} from "../types/agent.types";
import { analyzeQuery, finalSummary } from "../tools/analyzeQuery.tool";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import {
  balanceSheetTool,
  cashFlowStatementTool,
  earningCallPdfSummary,
  incomeStatementTool,
  peersInfoTool,
  shareholdingInfoTool,
  stockInfoTool,
} from "./tools.registry";
import { HumanMessage, SystemMessage, type AIMessage } from "langchain";

// export const AppState = Annotation.Root({
//   userQuery: Annotation<string>,
//   companyName: Annotation<string>,
//   companySymbol: Annotation<string>,
//   stockInfo: Annotation<StockInfo>,
//   peerInfo: Annotation<PeersInfo[]>,
//   shareHoldingInfo: Annotation<ShareHoldingInfo[]>,
//   earningCallTranscriptURL: Annotation<string>,
//   earningCallSummary: Annotation<typeof finalSummarySchema>,
//   balanceSheet: Annotation<BalanceSheet>,
//   incomeStatement: Annotation<IncomeStatement>,
//   cashFlowStatement: Annotation<CashFlow>,
//   finalResponse: Annotation<string>,
// });

// export type AppStateType = typeof AppState.State;

export const AppState = Annotation.Root({
  userQuery: Annotation<string>,
  companyName: Annotation<string>,
  symbol: Annotation<string>,
  messages: Annotation<
    (typeof AIMessage | typeof HumanMessage | typeof SystemMessage)[]
  >,
});
export type AppStateType = typeof AppState.State;

export const tools = [
  stockInfoTool,
  peersInfoTool,
  shareholdingInfoTool,
  earningCallPdfSummary,
  balanceSheetTool,
  cashFlowStatementTool,
  incomeStatementTool,
];
const graph = new StateGraph(AppState);
graph
  .addNode("analyze_query", analyzeQuery)
  .addNode("fetch_symbol", fetchSymbol)
  .addNode("fetch_stock_info", fetchStockInfo)
  .addNode("fetch_peers_info", fetchPeersInfo)
  .addNode("fetch_shareholding_info", fetchShareHoldingInfo)
  .addNode("fetch_earningcall_pdf", fetchEarningCallPDF)
  .addNode("final_summary", finalSummary)
  .addNode("generate_earningcall_summary", earningCallPDFSummarizer)
  .addNode("fetch_balance_sheet", fetchBalanceSheet)
  .addNode("fetch_income_statement", fetchIncomeStatement)
  .addNode("fetch_cash_flow", fetchCashFlow)
  .addEdge(START, "analyze_query")
  .addConditionalEdges("analyze_query", (state: AppStateType) => {
    if (state.companyName == "" || state.companyName == "none") return END;
    else return "extract_symbol";
  })
  .addConditionalEdges("fetch_symbol", (state: AppStateType) => {
    if (state.symbol == "" || state.companyName == "none") return END;
    else return "extract_stock_info";
  })
  .addEdge("fetch_stock_info", "fetch_peers_info")
  .addEdge("fetch_peers_info", "fetch_shareholding_info")
  .addEdge("fetch_shareholding_info", "fetch_earningcall_pdf")
  .addEdge("fetch_earningcall_pdf", "generate_earningcall_summary")
  .addEdge("generate_earningcall_summary", "final_summary")
  .addEdge("final_summary", "fetch_balance_sheet")
  .addEdge("fetch_balance_sheet", "fetch_income_statement")
  .addEdge("fetch_income_statement", "fetch_cash_flow")
  .addEdge("fetch_cash_flow", END);

async function init() {
  const workflow = graph.compile();
  const result = await workflow.invoke({
    userQuery: "at what price should i start investing on hdfc bank?",
  });
  console.log(result);
}
init();
