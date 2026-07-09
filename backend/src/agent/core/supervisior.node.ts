import { ChatOpenAI } from "@langchain/openai";
import { tools, type AppStateType } from "../agent";
import { llmWithToolsSystemPrompt } from "../prompts/prompt";
import { AIMessage, HumanMessage } from "langchain";
import { ChatMistralAI } from "@langchain/mistralai";
import { ChatGroq } from "@langchain/groq";

export async function supervisor(state: AppStateType) {
  try {
    const model = new ChatMistralAI({
      model: "mistral-large-2512",
      apiKey: process.env.MISTRAL_TOKEN,
      temperature: 0,
    });

    // const model = new ChatGroq({
    //   model: "llama-3.3-70b-versatile",
    //   maxRetries: 2,
    //   temperature: 0,
    //   apiKey: process.env.GROQ_API_KEY,
    // });

    const modelWithTools = model.bindTools(tools);
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
