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
  marketOverviewTool,
  priceHistoryTool,
  newsTool,
  corporateActionTool,
  topMoversTool,
  quantitativeSubagentTool,
  sentimentSubagentTool,
} from "./tools/tools.registry";
import { publisherClient } from "../lib/redis";
import { supervisor } from "./core/supervisior.node";
import { finalSummary } from "./core/report-generator.node";
import { queryAnalyzerSubagent } from "./core/query.node";

export const AppState = Annotation.Root({
  userQuery: Annotation<string>,
  relevent: Annotation<boolean>,
  userId: Annotation<string>,
  companyName: Annotation<string[]>,
  symbol: Annotation<string[]>,
  messages: Annotation<
    (AIMessage | HumanMessage | SystemMessage | ToolMessage)[]
  >({
    reducer: (current, update) => current.concat(update),
  }),
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
  marketOverviewTool,
  topMoversTool,
  newsTool,
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
  .addNode("tools", toolNode)
  .addNode("final_summary", finalSummary)
  .addEdge(START, "analyze_query")
  .addConditionalEdges("analyze_query", (state: AppStateType) => {
    if (!state.relevent) {
      return END;
    }
    return "supervisor";
  })
  .addConditionalEdges("supervisor", (state: AppStateType) => {
    const messages = state.messages as any;
    console.log(" message ", messages);

    const lastMessage = messages[messages.length - 1] as AIMessage;
    if (lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
      console.log("tools to call");
      return "tools";
    }
    console.log("no tools to call");
    return "final_summary";
  })
  .addEdge("tools", "supervisor")
  .addEdge("final_summary", END);

export async function startAgent(query: string, userId?: string) {
  try {
    console.log("query is ", query);
    const workflow = graph.compile();
    const result = await workflow.invoke(
      {
        userQuery: query,
        userId: userId || "",
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
// startAgent("compare the market cap of TCS in FY25 vs FY26");
