import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import type { AppStateType } from "../agent";
import {
  finalSummaryBriefPrompt,
  finalSummaryDetailedPrompt,
} from "../prompts/prompt";
import { AIMessage, HumanMessage, ToolMessage } from "langchain";

const model = new ChatGoogleGenerativeAI({
  model: "gemini-3.5-flash-lite",
  maxRetries: 2,
  temperature: 0.1,
  apiKey: process.env.GOOGLE_API_KEY,
});

export async function finalSummary(state: AppStateType) {
  try {
    const isDetailed = state.queryType === "detailed";

    console.log(
      "State in finalSummary is ",
      `userquery: ${state.userQuery} \n query Type: ${state.queryType}`,
    );

    const systemPrompt = isDetailed
      ? finalSummaryDetailedPrompt
      : finalSummaryBriefPrompt;
    const toolResults: Record<string, string> = {};
    const toolres = [];
    for (const m of state.messages) {
      if (m._getType() === "tool") {
        toolres.push({
          tool: (m as ToolMessage).name ?? "unknown Tool",
          data: m.content as string,
        });
      }
    }

    console.log(
      "tool response in finalSummary node  ",
      JSON.stringify(toolres),
    );

    const response = await model.invoke([
      systemPrompt,
      new HumanMessage(`
      Fetched Data Context:\n${JSON.stringify(toolres)}\n
      User Query: ${state.userQuery}\n
      Company: ${state.companyName} \n
      query type: ${state.queryType}
  `),
    ]);

    const contentItem = response.content?.[1];
    let finalText = "";
    if (typeof contentItem === "string") {
      finalText = contentItem;
    } else if (contentItem && typeof contentItem === "object") {
      finalText = (contentItem as any).text ?? JSON.stringify(contentItem);
    }

    return { finalResponse: response.content };
  } catch (error) {
    console.log("error in final-summary");
    console.log(error);
    return {
      messages: [new AIMessage("I encountered an error fetching that data.")],
    };
  }
}
