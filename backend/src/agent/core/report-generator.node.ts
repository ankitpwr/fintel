import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import type { AppStateType } from "../agent";
import { finalSummaryPrompt } from "../prompts/prompt";
import { AIMessage, HumanMessage } from "langchain";

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
