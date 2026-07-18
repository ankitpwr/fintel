import { Annotation, StateGraph, START, END } from "@langchain/langgraph";
import { LangChainTracer } from "@langchain/core/tracers/tracer_langchain";

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
import type {
  AIMessage,
  HumanMessage,
  SystemMessage,
  ToolMessage,
} from "langchain";
import { start } from "node:repl";

export const AppState = Annotation.Root({
  userQuery: Annotation<string>,
  relevent: Annotation<boolean>,
  queryType: Annotation<"brief" | "detailed">,
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
  topIndexPerformanceTool,
  topMoversTool,
  corporateActionTool,
  quantitativeSubagentTool,
  sentimentSubagentTool,
];
const graph = new StateGraph(AppState);
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

export async function startAgent(
  query: string,
  userId?: string,
  queryType: "brief" | "detailed" = "brief",
) {
  try {
    console.log("query is ", query);
    const workflow = graph.compile();
    let finalText = "";
    for await (const [mode, payload] of await workflow.stream(
      { userQuery: query, userId: userId || "", queryType },
      { streamMode: ["messages", "custom"] },
    )) {
      if (mode == "custom") {
        await publisherClient.publish(
          `agent-updates`,
          JSON.stringify({
            userId: userId,
            type: "step",
            message: payload.status,
          }),
        );
      } else if (mode == "messages") {
        const [messageChunk, metadata] = payload as [any, any];
        if (metadata.langgraph_node !== "final_summary") continue;
        const token = messageChunk.content;
        if (!token) continue;
        finalText += token;
        await publisherClient.publish(
          `agent-updates`,
          JSON.stringify({ userId: userId, type: "token", message: token }),
        );
      }
    }

    await publisherClient.publish(
      `agent-updates`,
      JSON.stringify({
        userId: userId,
        type: "done",
        message: finalText,
      }),
    );
    return finalText;
  } catch (error) {
    console.log("error in init");
    console.log(error);
  }
}

// startAgent(
//   "analyze the HDFC bank fundamental, and sentiment and is it right time to invest on it?",
//   "werwere2232",
//   "detailed",
// );
