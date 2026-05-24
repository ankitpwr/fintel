import { Annotation, StateGraph, START, END } from "@langchain/langgraph";
import {
  extractBalanceSheet,
  extractCashFlow,
  extractIncomeStatement,
  extractPeersInfo,
  extractShareHoldingInfo,
  extractStockInfo,
  extractSymbol,
} from "../tools/financial.tool";
import {
  earningCallPDFSummarizer,
  extractEarningCallPDF,
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

export const AppState = Annotation.Root({
  userQuery: Annotation<string>,
  companyName: Annotation<string>,
  companySymbol: Annotation<string>,
  stockInfo: Annotation<StockInfo>,
  peerInfo: Annotation<PeersInfo[]>,
  shareHoldingInfo: Annotation<ShareHoldingInfo[]>,
  earningCallTranscriptURL: Annotation<string>,
  earningCallSummary: Annotation<typeof finalSummarySchema>,
  balanceSheet: Annotation<BalanceSheet>,
  incomeStatement: Annotation<IncomeStatement>,
  cashFlowStatement: Annotation<CashFlow>,
  finalResponse: Annotation<string>,
});

export type AppStateType = typeof AppState.State;

const graph = new StateGraph(AppState);
graph
  .addNode("analyze_query", analyzeQuery)
  .addNode("extract_symbol", extractSymbol)
  .addNode("extract_stock_info", extractStockInfo)
  .addNode("extract_peers_info", extractPeersInfo)
  .addNode("extract_shareholding_info", extractShareHoldingInfo)
  .addNode("extract_earningcall_pdf", extractEarningCallPDF)
  .addNode("final_summary", finalSummary)
  .addNode("generate_earningcall_summary", earningCallPDFSummarizer)
  .addNode("extract_balance_sheet", extractBalanceSheet)
  .addNode("extract_income_statement", extractIncomeStatement)
  .addNode("extract_cash_flow", extractCashFlow)
  .addEdge(START, "analyze_query")
  .addConditionalEdges("analyze_query", (state: AppStateType) => {
    if (state.companyName == "" || state.companyName == "none") return END;
    else return "extract_symbol";
  })
  .addConditionalEdges("extract_symbol", (state: AppStateType) => {
    if (state.companySymbol == "" || state.companyName == "none") return END;
    else return "extract_stock_info";
  })
  .addEdge("extract_stock_info", "extract_peers_info")
  .addEdge("extract_peers_info", "extract_shareholding_info")
  .addEdge("extract_shareholding_info", "extract_earningcall_pdf")
  .addEdge("extract_earningcall_pdf", "generate_earningcall_summary")
  .addEdge("generate_earningcall_summary", "final_summary")
  .addEdge("final_summary", "extract_balance_sheet")
  .addEdge("extract_balance_sheet", "extract_income_statement")
  .addEdge("extract_income_statement", "extract_cash_flow")
  .addEdge("extract_cash_flow", END);

async function init() {
  const workflow = graph.compile();
  const result = await workflow.invoke({
    userQuery:
      "tell me how hdfc stokcs are doing? are there fundamentals good?",
  });
  console.log(result);
}
init();
