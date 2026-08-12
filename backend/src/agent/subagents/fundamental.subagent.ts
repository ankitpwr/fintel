import {
  balanceSheetTool,
  calculatorTool,
  cashFlowStatementTool,
  incomeStatementTool,
  stockInfoTool,
} from "../tools/tools.registry";
import { createAgent, HumanMessage, ToolMessage } from "langchain";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { fundamentalSubagentPrompt } from "../prompts/prompt";

const model = new ChatGoogleGenerativeAI({
  model: "gemini-3.1-flash-lite",
  maxRetries: 2,
  apiKey: process.env.GOOGLE_API_KEY,
});

export async function fundamentalSubagent(
  task: string,
  symbol: string,
  comapanyName: string,
) {
  try {
    console.log("input for fundamental subagent  ", JSON.stringify(task));

    const subagent = createAgent({
      model,
      tools: [
        balanceSheetTool,
        cashFlowStatementTool,
        incomeStatementTool,
        stockInfoTool,
        calculatorTool,
      ],
    });
    const messages = [
      fundamentalSubagentPrompt,
      new HumanMessage(`
        company name: - ${JSON.stringify(comapanyName)}\n
        stock symbol:- ${JSON.stringify(symbol)}\n
        answer this task by using right tools:- \n  ${JSON.stringify(task)}\n
        today's date : - ${new Date().toISOString()}
        `),
    ];
    const response = await subagent.invoke(
      { messages: messages },
      { recursionLimit: 15 },
    );

    const toolres = [];
    for (const m of response.messages) {
      if (m._getType() === "tool") {
        toolres.push({
          tool: (m as ToolMessage).name ?? "unknown Tool",
          data: m.content as string,
        });
      }
    }

    return { success: true, data: toolres };
  } catch (error) {
    console.log("error in quantitative tool ", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "quantitative tool failed",
    };
  }
}
