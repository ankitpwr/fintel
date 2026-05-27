import { Annotation, StateGraph, START, END } from "@langchain/langgraph";
import { fetchSymbol } from "../tools/financial.tool";
import { analyzeQuery, llmWithTools } from "./node";
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
];
const graph = new StateGraph(AppState);
const toolNode = new ToolNode(tools);
graph
  .addNode("analyze_query", analyzeQuery)
  .addNode("fetch_symbol", fetchSymbol)
  .addNode("llm_with_tools", llmWithTools)
  .addNode("tools", toolNode)
  .addEdge(START, "analyze_query")
  .addConditionalEdges("analyze_query", (state: AppStateType) => {
    if (state.companyName == "" || state.companyName == "none") {
      return END;
    } else return "fetch_symbol";
  })
  .addConditionalEdges("fetch_symbol", (state: AppStateType) => {
    if (state.symbol == "" || state.companyName == "none") {
      return END;
    } else {
      return "llm_with_tools";
    }
  })
  .addConditionalEdges("llm_with_tools", (state: AppStateType) => {
    const messages = state.messages as any;
    console.log(" message ", messages);

    const lastMessage = messages[messages.length - 1] as AIMessage;
    if (lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
      console.log("tools to call");
      return "tools";
    }
    console.log("no tools to call");
    return END;
  })
  .addEdge("tools", "llm_with_tools");

async function init() {
  try {
    const workflow = graph.compile();
    const result = await workflow.invoke({
      userQuery: "How financially healthy is Reliance",
    });
    console.log(result);
  } catch (error) {
    console.log("error in init");
    console.log(error);
  }
}
init();
