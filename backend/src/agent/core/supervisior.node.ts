import { createAgent, AIMessage, HumanMessage, ToolMessage } from "langchain";
import { ChatOpenAI } from "@langchain/openai";
import { tools, type AppStateType } from "../agent";
import { llmWithToolsSystemPrompt } from "../prompts/prompt";

export async function supervisor(state: AppStateType) {
  try {
    const model = new ChatOpenAI({
      model: "minimaxai/minimax-m2.7",
      apiKey: process.env.NVIDIA_TOKEN,
      temperature: 0.1,
      configuration: { baseURL: "https://integrate.api.nvidia.com/v1" },
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

    // Always carry forward the real history — never reset it.
    const result = await agent.invoke(
      { messages: [taskContext] },
      { recursionLimit: 10 },
    );

    const toolResults: Record<string, string> = {};
    for (const m of result.messages) {
      if (m._getType() === "tool") {
        toolResults[(m as ToolMessage).name ?? m.tool_call_id] =
          m.content as string;
      }
    }

    return { messages: toolResults };
  } catch (error) {
    console.log("error in llm_with_tools ", error);
    return { messages: [new AIMessage("I encountered an error")] };
  }
}
