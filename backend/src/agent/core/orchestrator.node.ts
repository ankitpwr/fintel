import { createAgent, AIMessage, HumanMessage, ToolMessage } from "langchain";
import { tools, type AppStateType } from "../agent";
import { ChatMistralAI } from "@langchain/mistralai";
import { orchestratorSystemPrompt } from "../utils/prompt";
import { calculateTokenUsage } from "../utils/tokenUsage";

const model = new ChatMistralAI({
  model: "mistral-medium-2508",
  apiKey: process.env.MISTRAL_TOKEN,
  temperature: 0.1,
  tags: ["nostream"],
  maxRetries: 1,
});

// const model = new ChatGoogleGenerativeAI({
//   model: "gemini-3.5-flash-lite", //gemini-3.5-flash-lite
//   maxRetries: 1,
//   temperature: 0.1,
//   apiKey: process.env.GOOGLE_API_KEY,
// });

export async function orchestrator(state: AppStateType) {
  try {
    // console.log("in supervisor state is  ", state);

    const agent = createAgent({
      model: model,
      tools: tools,
      systemPrompt: orchestratorSystemPrompt.content as string,
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

    let subagentTokens = 0;
    for (const m of result.messages) {
      if (m._getType() === "tool") {
        try {
          const parsed = JSON.parse((m as ToolMessage).content as string);
          if (typeof parsed?.totalTokenUsed === "number") {
            subagentTokens += parsed.totalTokenUsed;
          }
        } catch {}
      }
    }
    const tokenUsed = calculateTokenUsage(result.messages);

    // console.log("token used in orchestrator are ", tokenUsed);

    return {
      messages: result.messages,
      totalTokenUsed: tokenUsed + subagentTokens,
    };
  } catch (error) {
    console.log("error in llm_with_tools ", error);
    return { messages: [new AIMessage("I encountered an error")] };
  }
}
