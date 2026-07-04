import { z } from "zod";
import type { AppStateType } from "../agent";
import { ChatGroq } from "@langchain/groq";
import { queryAnalyzerSystemPrompt } from "../prompts/prompt";
import { HumanMessage } from "langchain";

const querySchema = z.object({
  companyName: z
    .array(z.string())
    .describe("companies name extracted form user query"),
});
export async function analyzeQuery(state: AppStateType) {
  try {
    const model = new ChatGroq({
      model: "llama-3.1-8b-instant",
      maxRetries: 2,
      temperature: 0,
      apiKey: process.env.GROQ_API_KEY,
    });
    const structuredQueryModel = model.withStructuredOutput(querySchema);
    const result = await structuredQueryModel.invoke([
      queryAnalyzerSystemPrompt,
      new HumanMessage(state.userQuery),
    ]);
    return { companyName: result.companyName };
  } catch (error) {
    console.log("error in analyze-user-query");
    console.log(error);
  }
}
