import { Annotation, StateGraph, START, END } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { LangChainTracer } from "@langchain/core/tracers/tracer_langchain";

import {
  HumanMessage,
  SystemMessage,
  ToolMessage,
  type AIMessage,
} from "langchain";
import {
  balanceSheetTool,
  cashFlowStatementTool,
  earningCallPdfSummaryTool,
  incomeStatementTool,
  peersInfoTool,
  shareholdingInfoTool,
  stockInfoTool,
  priceHistoryTool,
  newsTool,
  corporateActionTool,
  topMoversTool,
  quantitativeSubagentTool,
  sentimentSubagentTool,
  topIndexPerformanceTool,
} from "./tools/tools.registry";
import { publisherClient } from "../lib/redis";
import { supervisor } from "./core/supervisior.node";
import { finalSummary } from "./core/report-generator.node";
import { queryAnalyzerSubagent } from "./core/query.node";

export const AppState = Annotation.Root({
  userQuery: Annotation<string>,
  relevent: Annotation<boolean>,
  queryType: Annotation<"brief" | "detailed">,
  userId: Annotation<string>,
  companyName: Annotation<string[]>,
  symbol: Annotation<string[]>,
  messages: Annotation<Record<string, string>>(),
  finalResponse: Annotation<string>,
});
export type AppStateType = typeof AppState.State;

export const tools = [
  stockInfoTool,
  peersInfoTool,
  shareholdingInfoTool,
  earningCallPdfSummaryTool,
  balanceSheetTool,
  cashFlowStatementTool,
  incomeStatementTool,
  priceHistoryTool,
  topIndexPerformanceTool,
  topMoversTool,
  corporateActionTool,
  quantitativeSubagentTool,
  sentimentSubagentTool,
];
const graph = new StateGraph(AppState);
const toolNode = new ToolNode(tools);
const tracer = new LangChainTracer();

graph
  .addNode("analyze_query", queryAnalyzerSubagent)
  .addNode("supervisor", supervisor)
  .addNode("final_summary", finalSummary)
  .addEdge(START, "analyze_query")
  .addConditionalEdges("analyze_query", (state: AppStateType) =>
    state.relevent ? "supervisor" : END,
  )
  .addEdge("supervisor", "final_summary")
  .addEdge("final_summary", END);

export async function startAgent(query: string, userId?: string) {
  try {
    console.log("query is ", query);
    const workflow = graph.compile();
    const result = await workflow.invoke(
      {
        userQuery: query,
        userId: userId || "",
        queryType: "brief",
      },
      { callbacks: [tracer] },
    );
    console.log(result);
    // await publisherClient.publish("agent-updates", JSON.stringify(result));

    return result.finalResponse;
  } catch (error) {
    console.log("error in init");
    console.log(error);
  }
}
startAgent("what was ROIC of TCI in FY25");
