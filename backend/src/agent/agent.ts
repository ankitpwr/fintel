import { Annotation, StateGraph, START, END } from "@langchain/langgraph";
// import { LangChainTracer } from "@langchain/core/tracers/tracer_langchain";

import {
  earningCallPdfSummaryTool,
  peersInfoTool,
  shareholdingInfoTool,
  topMoversTool,
  sentimentSubagentTool,
  topIndexPerformanceTool,
  fundamentalSubagentTool,
  technicalSubagentTool,
} from "./tools/tools.registry";
import { publisherClient } from "../lib/redis";
import { orchestrator } from "./core/orchestrator.node";
import { finalSummary } from "./core/report-generator.node";
import { queryAnalyzerSubagent } from "./core/query.node";
import type {
  AIMessage,
  HumanMessage,
  SystemMessage,
  ToolMessage,
} from "langchain";

export const AppState = Annotation.Root({
  userQuery: Annotation<string>,
  relevent: Annotation<boolean>,
  queryType: Annotation<"brief" | "detailed" | "market summary">,
  userId: Annotation<string>,
  companyName: Annotation<string[]>,
  symbol: Annotation<string[]>,
  messages: Annotation<
    (AIMessage | HumanMessage | SystemMessage | ToolMessage)[]
  >({
    reducer: (current, update) => current.concat(update),
  }),
  toolsUsed: Annotation<string[]>,
  totalTokenUsed: Annotation<number>({
    reducer: (current, update) => (current ?? 0) + (update ?? 0),
    default: () => 0,
  }),
  finalResponse: Annotation<string>,
});
export type AppStateType = typeof AppState.State;

export const tools = [
  fundamentalSubagentTool,
  technicalSubagentTool,
  peersInfoTool,
  shareholdingInfoTool,
  earningCallPdfSummaryTool,
  topIndexPerformanceTool,
  topMoversTool,
  sentimentSubagentTool,
];

const graph = new StateGraph(AppState);
// const tracer = new LangChainTracer();

graph
  .addNode("analyze_query", queryAnalyzerSubagent)
  .addNode("supervisor", orchestrator)
  .addNode("final_summary", finalSummary)
  .addEdge(START, "analyze_query")
  .addConditionalEdges("analyze_query", (state: AppStateType) =>
    state.relevent ? "supervisor" : END,
  )
  .addEdge("supervisor", "final_summary")
  .addEdge("final_summary", END);

export async function startAgent(
  query: string,
  queryType: "brief" | "detailed" | "market summary",
  userId: string = "admin",
) {
  try {
    const workflow = graph.compile();
    let finalText = "";
    let lastState: AppStateType | undefined;

    for await (const [mode, payload] of await workflow.stream(
      { userQuery: query, userId: userId || "", queryType },
      { streamMode: ["messages", "custom", "values"] },
    )) {
      if (mode === "custom") {
        await publisherClient.publish(
          `agent-updates`,
          JSON.stringify({
            userId,
            type: "step",
            message: (payload as any).status,
          }),
        );
      } else if (mode === "messages") {
        const [messageChunk, metadata] = payload as [any, any];
        if (metadata.langgraph_node !== "final_summary") continue;
        const token = messageChunk.content;
        if (!token) continue;
        finalText += token;
        await publisherClient.publish(
          `agent-updates`,
          JSON.stringify({ userId, type: "token", message: token }),
        );
      } else if (mode === "values") {
        lastState = payload as AppStateType;
      }
    }

    await publisherClient.publish(
      `agent-updates`,
      JSON.stringify({ userId, type: "done", message: finalText }),
    );

    return {
      userQuery: query,
      userId,
      queryType,
      finalResponse: lastState?.finalResponse || finalText || "",
      tokenUsed: lastState?.totalTokenUsed || 0,
      toolsUsed: lastState?.toolsUsed ?? [],
    };
  } catch (error) {
    console.log("error in init");
    console.log(error);
    return undefined;
  }
}

const res = await startAgent(
  "Across Aarti Industries and Navin Fluorine, which undertook the largest FY25 capex as percentage of operating cash flow at consolidated level, and give each proportion",
  "brief",
);

console.log(`The agent response  \n`, JSON.stringify(res));
