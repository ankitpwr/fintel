import {
  calculatorTool,
  corporateActionTool,
  priceHistoryTool,
} from "../tools/tools.registry";
import { createAgent, HumanMessage, ToolMessage } from "langchain";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { technicalSubagentPrompt } from "../utils/prompt";
import { calculateTokenUsage } from "../utils/tokenUsage";

const model = new ChatGoogleGenerativeAI({
  model: "gemini-3.1-flash-lite",
  maxRetries: 2,
  apiKey: process.env.GOOGLE_API_KEY,
});

export async function technicalSubagent(
  task: string,
  symbol: string,
  comapanyName: string,
) {
  try {
    // console.log("input for technical subagent  ", JSON.stringify(task));

    const subagent = createAgent({
      model,
      tools: [priceHistoryTool, corporateActionTool, calculatorTool],
    });
    const messages = [
      technicalSubagentPrompt,
      new HumanMessage(`
        company name: - ${JSON.stringify(comapanyName)}\n
        stock symbol:- ${JSON.stringify(symbol)}
        answer this task by using right tools:- \n  ${JSON.stringify(task)}\n
        today's date: - ${new Date().toISOString()}
        `),
    ];
    const response = await subagent.invoke(
      { messages: messages },
      { recursionLimit: 8 },
    );

    const tokenUsed = calculateTokenUsage(response.messages);
    // console.log("token used in technical subagent are ", tokenUsed);

    const toolres = [];
    for (const m of response.messages) {
      if (m._getType() === "tool") {
        toolres.push({
          tool: (m as ToolMessage).name ?? "unknown Tool",
          data: m.content as string,
        });
      }
    }

    return { success: true, data: toolres, totalTokenUsed: tokenUsed };
  } catch (error) {
    console.log("error in technical Subagent tool ", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "technical subagent tool failed",
    };
  }
}
