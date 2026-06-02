import { ChatGroq } from "@langchain/groq";
import { tools, type AppStateType } from "../worker/agent";
import { z } from "zod";
import { AIMessage, HumanMessage } from "langchain";
import {
  queryAnalyzerSystemPrompt,
  finalSummary as finalSummaryPrompt,
} from "../prompts/prompt";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { nseClient } from "../tools/financial.tool";

const querySchema = z.object({
  companyName: z.string().describe("company name extracted form user query"),
});
export async function analyzeQuery(state: AppStateType) {
  try {
    const model = new ChatGroq({
      model: "llama-3.3-70b-versatile",
      maxRetries: 2,
      temperature: 0,
      apiKey: process.env.GROQ_API_KEY,
    });

    const structuredQueryModel = model.withStructuredOutput(querySchema);

    const result = await structuredQueryModel.invoke([
      queryAnalyzerSystemPrompt,
      new HumanMessage(state.userQuery),
    ]);
    if (result.companyName == "none") return { companyName: "" };
    else return { companyName: result.companyName };
  } catch (error) {
    console.log("error in analyze-user-query");
    console.log(error);
  }
}

export async function fetchSymbol(state: AppStateType) {
  try {
    console.log("ib fetch symbol");
    const url =
      `NextApi/globalSearch/equity?symbol=` +
      encodeURIComponent(state.companyName);
    const { data } = await nseClient.get(url);
    console.log("data of fetch symbol is ", data["data"][0]["symbol"]);

    if (data["data"].length == 0) return { companySymbol: "" };
    return {
      symbol: data["data"][0]["symbol"],
      messages: [
        new HumanMessage(
          `userQuery: ${state.userQuery}\n companyName: ${state.companyName}\n symbol: ${state.symbol}`,
        ),
      ],
    };
  } catch (error) {
    console.log("error in extract-symbol");
    console.log(error);
    return { symbol: "" };
  }
}

export async function llmWithTools(state: AppStateType) {
  try {
    console.log("inside llm withh tools");

    const model = new ChatGroq({
      model: "openai/gpt-oss-120b",
      maxRetries: 2,
      temperature: 0,
      apiKey: process.env.GROQ_API_KEY,
    });

    const modelWithTools = model.bindTools(tools);

    const response = await modelWithTools.invoke(state.messages, {
      recursionLimit: 7,
    });
    console.log("in llm with tools  --> ", response);
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
    const response = await model.invoke([
      finalSummaryPrompt,
      ...state.messages,
      new HumanMessage(`
        User Query: - ${state.userQuery}\n 
        companyName:- ${state.companyName}`),
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
