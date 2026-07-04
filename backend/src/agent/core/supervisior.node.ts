import { ChatOpenAI } from "@langchain/openai";
import { tools, type AppStateType } from "../agent";
import { llmWithToolsSystemPrompt } from "../prompts/prompt";
import { AIMessage } from "langchain";

export async function supervisor(state: AppStateType) {
  try {
    const model = new ChatOpenAI({
      model: "z-ai/glm-5.2",
      apiKey: process.env.NVIDIA_TOKEN,
      temperature: 0,
      configuration: {
        baseURL: "https://integrate.api.nvidia.com/v1",
      },
    });

    const modelWithTools = model.bindTools(tools);
    const messages = [llmWithToolsSystemPrompt, ...state.messages];
    const response = await modelWithTools.invoke(messages, {
      recursionLimit: 10,
    });
    return { messages: [response] };
  } catch (error) {
    console.log("error in llm_with_tools ", error);
    return {
      messages: [new AIMessage("I encountered an error fetching that data.")],
    };
  }
}
