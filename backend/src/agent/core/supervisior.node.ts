import { ChatOpenAI } from "@langchain/openai";
import { tools, type AppStateType } from "../agent";
import { llmWithToolsSystemPrompt } from "../prompts/prompt";
import { AIMessage, HumanMessage } from "langchain";

export async function supervisor(state: AppStateType) {
  try {
    const model = new ChatOpenAI({
      model: "qwen/qwen3.5-397b-a17b",
      apiKey: process.env.NVIDIA_TOKEN,
      temperature: 0,
      configuration: {
        baseURL: "https://integrate.api.nvidia.com/v1",
      },
    });

    const modelWithTools = model.bindTools(tools);
    console.log("state is --> ", JSON.stringify(state));
    const messages = [
      llmWithToolsSystemPrompt,
      new HumanMessage(`${JSON.stringify(state)}`),
    ];
    const response = await modelWithTools.invoke(messages, {
      recursionLimit: 10,
    });
    return { messages: [response] };
  } catch (error) {
    console.log("error in llm_with_tools ", error);
    return {
      messages: [new AIMessage("I encountered an error")],
    };
  }
}
