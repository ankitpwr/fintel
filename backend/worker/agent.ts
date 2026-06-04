import { Annotation, StateGraph, START, END } from "@langchain/langgraph";
import { analyzeQuery, fetchSymbol, finalSummary, llmWithTools } from "./node";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import {
  HumanMessage,
  SystemMessage,
  ToolMessage,
  type AIMessage,
} from "langchain";
import {
  balanceSheetTool,
  cashFlowStatementTool,
  earningCallPdfSummary,
  incomeStatementTool,
  peersInfoTool,
  shareholdingInfoTool,
  stockInfoTool,
  marketOverviewTool,
  priceHistoryTool,
  topGainersTool,
  topLosersTool,
} from "./tools.registry";

export const AppState = Annotation.Root({
  userQuery: Annotation<string>,
  companyName: Annotation<string>,
  symbol: Annotation<string>,
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
  earningCallPdfSummary,
  balanceSheetTool,
  cashFlowStatementTool,
  incomeStatementTool,
  priceHistoryTool,
  marketOverviewTool,
  topGainersTool,
  topLosersTool,
];
const graph = new StateGraph(AppState);
const toolNode = new ToolNode(tools);
graph
  .addNode("analyze_query", analyzeQuery)
  .addNode("fetch_symbol", fetchSymbol)
  .addNode("llm_with_tools", llmWithTools)
  .addNode("tools", toolNode)
  .addNode("final_summary", finalSummary)
  .addEdge(START, "analyze_query")
  .addEdge("analyze_query", "llm_with_tools")
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

async function init() {
  try {
    const workflow = graph.compile();
    const result = await workflow.invoke({
      userQuery: "tell me the highlight of todays  stock market ",
    });
    console.log(result);
  } catch (error) {
    console.log("error in init");
    console.log(error);
  }
}
init();
