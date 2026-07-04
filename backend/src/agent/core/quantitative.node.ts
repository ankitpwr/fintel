import { calculatorTool } from "../tools/tools.registry";
import { mathsExpertPrompt } from "../prompts/prompt";
import { createAgent, HumanMessage } from "langchain";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

export async function mathsSubagent(queries: string[]) {
  try {
    console.log(`---------------------queries `, JSON.stringify(queries));
    const model = new ChatGoogleGenerativeAI({
      model: "gemini-3.1-flash-lite",
      maxRetries: 2,
      apiKey: process.env.GOOGLE_API_KEY,
    });

    const subagent = createAgent({
      model,
      tools: [calculatorTool],
    });
    const messages = [
      mathsExpertPrompt,
      new HumanMessage(
        `Calculate the following metrics ${JSON.stringify(queries)}\\n`,
      ),
    ];
    const response = await subagent.invoke({ messages: messages });
    console.log("response by calculator tool ", response.messages.at(-1)?.text);
    return response.messages.at(-1)?.text;
  } catch (error) {
    console.log("error in calculator tool ", error);
    return { calculatorTool: { error: "Tool Failed" } };
  }
}
