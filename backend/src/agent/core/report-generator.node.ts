import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import type { AppStateType } from "../agent";
import {
  finalSummaryBriefPrompt,
  finalSummaryDetailedPrompt,
  finalSummaryMarketOverviewPrompt,
} from "../prompts/prompt";
import { AIMessage, HumanMessage, ToolMessage } from "langchain";
import { ChatMistralAI } from "@langchain/mistralai";
// mistral - large - 2512;
const model = new ChatGoogleGenerativeAI({
  model: "gemini-3.1-flash-lite", //gemini-3.5-flash-lite
  maxRetries: 2,
  temperature: 0.1,
  apiKey: process.env.GOOGLE_API_KEY,
});

// const model = new ChatMistralAI({
//   model: "mistral-large-2512",
//   apiKey: process.env.MISTRAL_TOKEN,
//   temperature: 0.1,
// });

export async function finalSummary(state: AppStateType) {
  try {
    const isDetailed = state.queryType === "detailed";
    const systemPrompt = isDetailed
      ? finalSummaryDetailedPrompt
      : state.queryType == "brief"
        ? finalSummaryBriefPrompt
        : finalSummaryMarketOverviewPrompt;

    const toolres = [];
    for (const m of state.messages) {
      if (m._getType() === "tool") {
        toolres.push({
          tool: (m as ToolMessage).name ?? "unknown Tool",
          data: m.content as string,
        });
      }
    }
    const toolsUsed = toolres.map((val) => val.tool);

    console.log("tools used are\n   ", JSON.stringify(toolsUsed));

    const stream = await model.stream([
      systemPrompt,
      new HumanMessage(`
      Fetched Data Context:\n${JSON.stringify(toolres)}\n
      User Query: ${state.userQuery}\n
      Company: ${state.companyName} \n
      query type: ${state.queryType}
  `),
    ]);

    let finalText = "";
    for await (const chunk of stream) {
      const piece =
        typeof chunk.content === "string"
          ? chunk.content
          : Array.isArray(chunk.content)
            ? chunk.content.map((c: any) => c.text ?? "").join("")
            : "";
      finalText += piece;
    }

    console.log("final response by final summary is  ", finalText);

    return {
      finalResponse: finalText,
      toolsUsed,
    };
  } catch (error) {
    console.log("error in final-summary");
    console.log(error);
    return {
      messages: [new AIMessage("I encountered an error fetching that data.")],
      finalResponse: "I encountered an error fetching that data.",
    };
  }
}
