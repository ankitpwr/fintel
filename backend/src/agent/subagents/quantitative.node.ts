import { calculatorTool } from "../tools/tools.registry";
import { mathsExpertPrompt } from "../prompts/prompt";
import { createAgent, HumanMessage } from "langchain";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const model = new ChatGoogleGenerativeAI({
  model: "gemini-3.1-flash-lite",
  maxRetries: 2,
  apiKey: process.env.GOOGLE_API_KEY,
});

export async function quantitativeSubagent(queries: string[]) {
  try {
    console.log("input for quantitative subagent  ", JSON.stringify(queries));

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
    const response = await subagent.invoke(
      { messages: messages },
      { recursionLimit: 10 },
    );
    console.log("response by calculator tool ", response.messages.at(-1)?.text);
    return response.messages.at(-1)?.text;
  } catch (error) {
    console.log("error in quantitative tool ", error);
    return { quantitativeSubagent: { error: "quantitative Subagent failed" } };
  }
}
