import { ChatGroq } from "@langchain/groq";
import { createAgent, HumanMessage } from "langchain";
import { symbolTool } from "../tools/tools.registry";
import { queryAnalyzerSystemPrompt } from "../prompts/prompt";
import type { AppStateType } from "../agent";
import { z } from "zod";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { sumTokensFromMessages } from "../tokenUsage";
import { ChatMistralAI } from "@langchain/mistralai";
import { ChatOpenAI } from "@langchain/openai";

const Answer = z.object({
  relevent: z
    .boolean()
    .describe("True if user query is relevent otherwise False"),
  companies: z
    .array(z.string())
    .optional()
    .describe("name of all companies metioned in user query"),
  symbol: z
    .array(z.string())
    .optional()
    .describe("ticker symbols of all the companies that fectched from tool"),
  optimizedQuery: z
    .string()
    .describe(
      "optimized user query. if no Optimization is done return the original user query",
    ),
  error: z
    .string()
    .optional()
    .describe(
      "brief Gracefull error message only if user query is not relevent",
    ),
});

const model = new ChatOpenAI({
  model: "gpt-5.4-mini",
  maxRetries: 2,
  temperature: 0,
  apiKey: process.env.OPENAI_TOKEN,
});

export async function queryAnalyzerSubagent(state: AppStateType) {
  try {
    // console.log("in query analyzer subagent state is ", JSON.stringify(state));
    const subagent = createAgent({
      model,
      tools: [symbolTool],
      responseFormat: Answer,
      systemPrompt: queryAnalyzerSystemPrompt,
    });

    const messages = [new HumanMessage(`user query: - ${state.userQuery}\\n`)];

    const response = await subagent.invoke({ messages: messages });

    const tokenUsed = sumTokensFromMessages(response.messages);
    // console.log("token used in query-node are ", tokenUsed);

    if (response.structuredResponse.relevent) {
      return {
        symbol: response.structuredResponse.symbol,
        companyName: response.structuredResponse.companies,
        relevent: response.structuredResponse.relevent,
        totalTokenUsed: tokenUsed,
      };
    }

    return {
      finalResponse: response.structuredResponse.error,
      totalTokenUsed: tokenUsed,
    };
  } catch (error) {
    console.log("error occured in query analyzer subagent", error);
    return { querySubagent: "subagent failed" };
  }
}
