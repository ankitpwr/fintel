import { ChatGroq } from "@langchain/groq";
import type { AppStateType } from "../worker/agent";
import { z } from "zod";
import { HumanMessage } from "langchain";
import {
  queryAnalyzerSystemPrompt,
  finalSummary as finalSummaryPrompt,
} from "../prompts/summary.prompt";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const querySchema = z.object({
  comapanyName: z.string().describe("company name extracted form user query"),
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
    if (result.comapanyName == "none") return { companyName: "" };
    else return { companyName: result.comapanyName };
  } catch (error) {
    console.log("error in analyze-user-query");
    console.log(error);
  }
}

export async function finalSummary(state: AppStateType) {
  try {
    const model = new ChatGoogleGenerativeAI({
      model: "gemma-4-31b-it",
      maxRetries: 2,
      apiKey: process.env.GOOGLE_API_KEY,
    });

    const response = await model.invoke([
      finalSummaryPrompt,
      new HumanMessage(`
        User Query: - ${state.userQuery}\n 
        companyName:- ${state.companyName}
        stock_Information: - ${JSON.stringify(state.stockInfo)}\n 
        Peers_Information: - ${JSON.stringify(state.peerInfo)} \n
        share_Holding_Information: - ${JSON.stringify(state.shareHoldingInfo)}
        earning_call_Summary: - ${JSON.stringify(state.earningCallSummary)}
        
        `),
    ]);

    return { finalResponse: response.content };
  } catch (error) {
    console.log("erro in final-summary");
    console.log(error);
  }
}
