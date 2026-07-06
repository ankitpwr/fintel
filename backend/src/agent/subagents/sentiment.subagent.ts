import { ChatGroq } from "@langchain/groq";
import { createAgent, HumanMessage } from "langchain";
import { newsAggregatorTool } from "../tools/tools.registry";
import { sentimentExpertPrompt } from "../prompts/prompt";

export async function sentimentSubagent(query: string) {
  try {
    const model = new ChatGroq({
      model: "llama-3.3-70b-versatile",
      maxRetries: 2,
      temperature: 0,
      apiKey: process.env.GROQ_API_KEY,
    });

    const subagent = createAgent({
      model,
      tools: [newsAggregatorTool],
    });
    const messages = [
      sentimentExpertPrompt,
      new HumanMessage(`${JSON.stringify(query)}\\n`),
    ];
    const response = await subagent.invoke({ messages });

    console.log("response message is ", response.messages);
    return response.messages.at(-1)?.text;
  } catch (error) {
    console.log("error occured ", error);
    return { sentimentSubagentResponse: "subagent failed" };
  }
}
