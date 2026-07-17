import { createAgent, AIMessage, HumanMessage, ToolMessage } from "langchain";
import { ChatOpenAI } from "@langchain/openai";
import { tools, type AppStateType } from "../agent";
import { llmWithToolsSystemPrompt } from "../prompts/prompt";
import { ChatMistralAI } from "@langchain/mistralai";

export async function supervisor(state: AppStateType) {
  try {
    const model = new ChatMistralAI({
      model: "mistral-medium-latest",
      apiKey: process.env.MISTRAL_TOKEN,
      temperature: 0.1,
    });

    const agent = createAgent({
      model: model,
      tools: tools,
      systemPrompt: llmWithToolsSystemPrompt.content as string,
    });
    const taskContext = new HumanMessage(
      [
        `User query: ${state.userQuery}`,
        `Query type: ${state.queryType}`,
        state.companyName?.length
          ? `Company name(s): ${state.companyName.join(", ")}`
          : null,
        state.symbol?.length
          ? `Resolved symbol(s): ${state.symbol.join(", ")}`
          : null,
      ]
        .filter(Boolean)
        .join("\n"),
    );

    const result = await agent.invoke(
      { messages: [taskContext] },
      { recursionLimit: 10 },
    );

    return { messages: result.messages };
  } catch (error) {
    console.log("error in llm_with_tools ", error);
    return { messages: [new AIMessage("I encountered an error")] };
  }
}
