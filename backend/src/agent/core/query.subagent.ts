import { ChatGroq } from "@langchain/groq";
import { createAgent, HumanMessage } from "langchain";
import { symbolTool } from "../tools/tools.registry";
import { queryAnalyzerSystemPrompt } from "../prompts/prompt";
import type { AppStateType } from "../agent";
import { z } from "zod";
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
    .describe("ticker symbols of all the companies"),
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

export async function queryAnalyzerSubagent(state: AppStateType) {
  try {
    const model = new ChatOpenAI({
      model: "nvidia/llama-3.3-nemotron-super-49b-v1",
      apiKey: process.env.NVIDIA_TOKEN,
      temperature: 0,
      configuration: {
        baseURL: "https://integrate.api.nvidia.com/v1",
      },
    });

    const subagent = createAgent({
      model,
      tools: [symbolTool],
      responseFormat: Answer,
    });

    const messages = [
      queryAnalyzerSystemPrompt,
      new HumanMessage(`user query: - ${state.userQuery}\\n`),
    ];

    const response = await subagent.invoke({ messages: messages });

    console.log(response.structuredResponse);

    if (response.structuredResponse.relevent) {
      return {
        symbol: response.structuredResponse.symbol,
        companyName: response.structuredResponse.symbol,
        relevent: response.structuredResponse.relevent,
      };
    }

    return {
      finalResponse: response.structuredResponse.error,
    };
  } catch (error) {
    console.log("error occured in query analyzer subagent", error);
    return { querySubagent: "subagent failed" };
  }
}

// querySubagent(
//   "Summarize today's Indian stock market: NIFTY, Sensex, Bank Nifty movement, overall sentiment.",
// );

// querySubagent("Compare the market cap of TCS and Infosys");
