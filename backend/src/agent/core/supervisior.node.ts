import { createAgent, AIMessage, HumanMessage, ToolMessage } from "langchain";
import { ChatOpenAI } from "@langchain/openai";
import { tools, type AppStateType } from "../agent";
import { llmWithToolsSystemPrompt } from "../prompts/prompt";
import { ChatMistralAI } from "@langchain/mistralai";

const model = new ChatMistralAI({
  model: "mistral-medium-latest",
  apiKey: process.env.MISTRAL_TOKEN,
  temperature: 0.1,
});

export async function supervisor(state: AppStateType) {
  try {
    console.log("in supervisor state is  ", state);

    const agent = createAgent({
      model: model,
      tools: tools,
      systemPrompt: llmWithToolsSystemPrompt.content as string,
    });
    const symbolMap =
      state.companyName?.map((name, i) => ({
        company: name,
        symbol: state.symbol?.[i],
      })) ?? [];

    const taskContext = new HumanMessage(
      [
        `User query: ${state.userQuery}`,
        `Query type: ${state.queryType}`,
        symbolMap.length
          ? `Resolved company-to-symbol mapping (AUTHORITATIVE — use these exact symbol values, do not substitute your own knowledge of ticker symbols):\n` +
            symbolMap
              .map((m) => `- "${m.company}" → symbol: "${m.symbol}"`)
              .join("\n")
          : null,
      ]
        .filter(Boolean)
        .join("\n\n"),
    );

    const result = await agent.invoke(
      { messages: [taskContext] },
      { recursionLimit: 15 },
    );

    return { messages: result.messages };
  } catch (error) {
    console.log("error in llm_with_tools ", error);
    return { messages: [new AIMessage("I encountered an error")] };
  }
}
