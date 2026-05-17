import { ChatGroq } from "@langchain/groq";
import type { AppStateType } from "../worker/agent";
import { z } from "zod";
import { HumanMessage } from "langchain";
import { queryAnalyzerSystemPrompt } from "../prompts/summary.prompt";

const querySchema = z.object({
  comapanyName: z.string().describe("company name extracted form user query"),
});
export async function analyzeQuery(state: AppStateType) {
  try {
    const model = new ChatGroq({
      model: "llama-3.3-70b-versatile",
      maxRetries: 2,
      temperature: 0,
      apiKey: process.env.GROQ_API_KEY,
    });

    const structuredQueryModel = model.withStructuredOutput(querySchema);

    const result = await structuredQueryModel.invoke([
      queryAnalyzerSystemPrompt,
      new HumanMessage(state.userQuery),
    ]);
    if (result.comapanyName == "none") return { companyName: "" };
    else return { companyName: result.comapanyName };
  } catch (error) {
    console.log("erro in analyze-user-query");
    console.log(error);
    return { companyName: "" };
  }
}
