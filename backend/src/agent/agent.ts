import { Annotation, StateGraph, START, END } from "@langchain/langgraph";
import { analyzeQuery, fetchSymbol, finalSummary, supervisor } from "./node";
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
  calculatorTool,
  mathExpertTool,
} from "./tools/tools.registry";
import { publisherClient } from "../lib/redis";

export const AppState = Annotation.Root({
  userQuery: Annotation<string>,
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
  mathExpertTool,
];
const graph = new StateGraph(AppState);
const toolNode = new ToolNode(tools);
const tracer = new LangChainTracer();

graph
  .addNode("analyze_query", analyzeQuery)
  .addNode("fetch_symbol", fetchSymbol)
  .addNode("llm_with_tools", supervisor)
  .addNode("tools", toolNode)
  .addNode("final_summary", finalSummary)
  .addEdge(START, "analyze_query")
  .addEdge("analyze_query", "fetch_symbol")
  .addEdge("fetch_symbol", "llm_with_tools")
  .addConditionalEdges("llm_with_tools", (state: AppStateType) => {
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
  .addEdge("tools", "llm_with_tools")
  .addEdge("final_summary", END);

export async function startAgent(query: string, userId: string) {
  try {
    console.log("query is ", query);
    const workflow = graph.compile();
    const result = await workflow.invoke(
      {
        userQuery: query,
        userId: userId,
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

startAgent("what is CAGR of HDFC Bank", "adfhakldfjlk");
