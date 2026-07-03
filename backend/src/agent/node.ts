import { ChatGroq } from "@langchain/groq";
import { tools, type AppStateType } from "./agent";
import { z } from "zod";
import { AIMessage, HumanMessage } from "langchain";
import {
  queryAnalyzerSystemPrompt,
  finalSummaryPrompt,
  llmWithToolsSystemPrompt,
} from "./prompts/prompt";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { nseClient } from "./tools/financial.tool";

const querySchema = z.object({
  companyName: z
    .array(z.string())
    .describe("companies name extracted form user query"),
});
export async function analyzeQuery(state: AppStateType) {
  try {
    const model = new ChatGroq({
      model: "llama-3.1-8b-instant",
      maxRetries: 2,
      temperature: 0,
      apiKey: process.env.GROQ_API_KEY,
    });
    const structuredQueryModel = model.withStructuredOutput(querySchema);
    const result = await structuredQueryModel.invoke([
      queryAnalyzerSystemPrompt,
      new HumanMessage(state.userQuery),
    ]);
    return { companyName: result.companyName };
  } catch (error) {
    console.log("error in analyze-user-query");
    console.log(error);
  }
}

export async function fetchSymbol(state: AppStateType) {
  try {
    if (state.companyName.length == 0) {
      return {
        symbol: [],
        messages: [new HumanMessage(`userQuery: ${state.userQuery}`)],
      };
    }

    const symbols: string[] = [];
    for (let i = 0; i < state.companyName.length; i++) {
      const name = state.companyName[i];
      if (!name) continue;
      const url =
        `NextApi/globalSearch/equity?symbol=` + encodeURIComponent(name);
      const { data } = await nseClient.get(url);
      if (data["data"] == null || data["data"].length == 0) continue;
      symbols.push(data["data"][0]["symbol"]);
    }

    console.log("symbol are ", symbols);
    return {
      symbol: symbols,
      messages: [
        new HumanMessage(
          `userQuery: ${state.userQuery}\n  ` +
            `NSE Symbols to use for tool calls: ${symbols.join(", ")}\n` +
            `IMPORTANT: Use ONLY these exact symbols in all tool calls. Do not guess or use alternative symbols.`,
        ),
      ],
    };
  } catch (error) {
    console.log("error in extract-symbol");
    console.log(error);
    return {
      symbol: "",
      messages: [new HumanMessage(`userQuery: ${state.userQuery}}`)],
    };
  }
}

export async function supervisor(state: AppStateType) {
  try {
    const model = new ChatGroq({
      model: "llama-3.3-70b-versatile",
      maxRetries: 2,
      temperature: 0,
      apiKey: process.env.GROQ_API_KEY,
    });

    const modelWithTools = model.bindTools(tools);
    const messages = [llmWithToolsSystemPrompt, ...state.messages];
    const response = await modelWithTools.invoke(messages, {
      recursionLimit: 10,
    });
    return { messages: [response] };
  } catch (error) {
    console.log("error in llm_with_tools ", error);
    return {
      messages: [new AIMessage("I encountered an error fetching that data.")],
    };
  }
}

export async function finalSummary(state: AppStateType) {
  try {
    const model = new ChatGoogleGenerativeAI({
      model: "gemini-3.1-flash-lite",
      maxRetries: 2,
      apiKey: process.env.GOOGLE_API_KEY,
    });
    const toolContext = state.messages
      .filter((m) => m._getType() === "tool")
      .map((m) => m.content)
      .join("\n\n---\n\n");

    const response = await model.invoke([
      finalSummaryPrompt,
      new HumanMessage(`
      Fetched Data Context:\n${toolContext}
      \n\nUser Query: ${state.userQuery}
      Company: ${state.companyName}
  `),
    ]);

    return { finalResponse: response.content };
  } catch (error) {
    console.log("erro in final-summary");
    console.log(error);
    return {
      messages: [new AIMessage("I encountered an error fetching that data.")],
    };
  }
}
