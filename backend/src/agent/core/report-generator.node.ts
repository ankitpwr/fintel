import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import type { AppStateType } from "../agent";
import {
  finalSummaryBriefPrompt,
  finalSummaryDetailedPrompt,
} from "../prompts/prompt";
import { AIMessage, HumanMessage, ToolMessage } from "langchain";
import { stat } from "fs";

export async function finalSummary(state: AppStateType) {
  try {
    const isDetailed = state.queryType === "detailed";

    const model = new ChatGoogleGenerativeAI({
      model: "gemini-3.1-flash-lite",
      maxRetries: 2,
      temperature: 0.2,
      apiKey: process.env.GOOGLE_API_KEY,
    });

    console.log(
      "State in finalSummary is ",
      `userquery: ${state.userQuery} \n query Type: ${state.queryType}`,
    );

    const systemPrompt = isDetailed
      ? finalSummaryDetailedPrompt
      : finalSummaryBriefPrompt;
    const toolResults: Record<string, string> = {};
    for (const m of state.messages) {
      if (m._getType() === "tool") {
        toolResults[(m as ToolMessage).name ?? m.tool_call_id] =
          m.content as string;
      }
    }

    console.log(
      "tool response in finalSummary node  ",
      JSON.stringify(toolResults),
    );

    const response = await model.invoke([
      systemPrompt,
      new HumanMessage(`
      Fetched Data Context:\n${JSON.stringify(toolResults)}\n\n
      User Query: ${state.userQuery}
      Company: ${state.companyName} \n\n
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
