import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import type { AppStateType } from "../agent";
import {
  finalSummaryBriefPrompt,
  finalSummaryDetailedPrompt,
} from "../prompts/prompt";
import { AIMessage, HumanMessage } from "langchain";

const LEAK_PATTERNS: RegExp[] = [
  /^(based on|according to|from) the (data|information|context|articles|news)( provided| available)?[,:]\s*/i,
  /^(i found|the data shows|the data indicates|it appears) that\s*/i,
  /^as of [^,]+,\s*/i,
];

function stripLeakage(text: string): string {
  let cleaned = text.trim();
  for (const pattern of LEAK_PATTERNS) {
    cleaned = cleaned.replace(pattern, "");
  }
  // Re-capitalize the first letter if the strip left a lowercase start.
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export async function finalSummary(state: AppStateType) {
  try {
    const isDetailed = state.queryType === "detailed";

    const model = new ChatGoogleGenerativeAI({
      model: "gemini-3.1-flash-lite",
      maxRetries: 2,
      temperature: 0.2,
      apiKey: process.env.GOOGLE_API_KEY,
    });

    const systemPrompt = isDetailed
      ? finalSummaryDetailedPrompt
      : finalSummaryBriefPrompt;

    const response = await model.invoke([
      systemPrompt,
      new HumanMessage(`
      Fetched Data Context:\n${JSON.stringify(state.messages)}
      \n\nUser Query: ${state.userQuery}
      Company: ${state.companyName}
  `),
    ]);

    const rawText =
      typeof response.content === "string"
        ? response.content
        : JSON.stringify(response.content);

    return { finalResponse: response.content };
  } catch (error) {
    console.log("erro in final-summary");
    console.log(error);
    return {
      messages: [new AIMessage("I encountered an error fetching that data.")],
    };
  }
}
