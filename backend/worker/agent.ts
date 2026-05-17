import { Annotation, StateGraph, START, END } from "@langchain/langgraph";
import {
  extractPeersInfo,
  extractShareHoldingInfo,
  extractStockInfo,
} from "../tools/financial.tool";
import {
  earningCallPDFSummarizer,
  extractEarningCallPDF,
  finalSummarySchema,
} from "../tools/earningTranscript.tool";

interface StockInfo {
  symbol: string;
  companyName: string;
  industry: string;
  sector: string;
  basicIndustry: string;
  faceValue: string;
  lastPrice: number;
  open: number;
  close: number;
  vwap: number;
  change: number;
  pChange: number;
  dayHigh: number;
  dayLow: number;
  weekHigh52: number;
  weekLow52: number;
  weekHighDate: string;
  weekLowDate: string;
  sectorPE: number;
  symbolPE: number;
  primaryIndex: string;
}

interface PeersInfo {
  symbol: string;
  price: number;
  pe: number;
  eps: number;
  pat: number;
  totalIncome: number;
  marketCap: number;
  promoterHolding: number;
  dayChange: number;
}

export interface ShareHoldingInfo {
  date: string;
  promotorHolding: number;
  publicHolding: number;
}

export const AppState = Annotation.Root({
  userQuery: Annotation<string>,
  companyName: Annotation<string>,
  companySymbol: Annotation<string>,
  stockInfo: Annotation<StockInfo>,
  peerInfo: Annotation<PeersInfo[]>,
  shareHoldingInfo: Annotation<ShareHoldingInfo[]>,
  earningCallTranscriptURL: Annotation<string>,
  earningCallSummary: Annotation<typeof finalSummarySchema>,
  finalResponse: Annotation<string>,
});

export type AppStateType = typeof AppState.State;

const graph = new StateGraph(AppState);
graph
  .addNode("extract_stock_info", extractStockInfo)
  .addNode("extract_peers_info", extractPeersInfo)
  .addNode("extract_shareholding_info", extractShareHoldingInfo)
  .addNode("extract_earningcall_pdf", extractEarningCallPDF)
  .addNode("generate_earningcall_summary", earningCallPDFSummarizer)
  .addEdge(START, "extract_stock_info")
  .addEdge("extract_stock_info", "extract_peers_info")
  .addEdge("extract_peers_info", "extract_shareholding_info")
  .addEdge("extract_shareholding_info", "extract_earningcall_pdf")
  .addEdge("extract_earningcall_pdf", "generate_earningcall_summary")
  .addEdge("generate_earningcall_summary", END);

async function init() {
  const workflow = graph.compile();

  const result = await workflow.invoke({ companySymbol: "HDFCBANK" });

  console.log(result);
}
init();
