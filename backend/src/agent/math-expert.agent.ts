import { ChatOpenAI } from "@langchain/openai";
import { evaluate } from "mathjs";
import { calculatorTool } from "./tools/tools.registry";
import { mathsExpertPrompt } from "./prompts/prompt";
import { HumanMessage } from "langchain";

export async function mathsSubagent(queries: string[], rawData: object) {
  try {
    console.log(
      `queries `,
      JSON.stringify(queries),
      `  rawData `,
      JSON.stringify(rawData),
    );
    const model = new ChatOpenAI({
      model: "openai/gpt-oss-120b",
      apiKey: process.env.NVIDIA_TOKEN,
      temperature: 0,
      configuration: {
        baseURL: "https://integrate.api.nvidia.com/v1",
      },
    });
    const modelwithtools = model.bindTools([calculatorTool]);
    const messages = [
      mathsExpertPrompt,
      new HumanMessage(
        `Calculate the following metrics ${JSON.stringify(queries)}\\n raw data for these queries are ${JSON.stringify(rawData)}`,
      ),
    ];
    const response = await modelwithtools.invoke(messages);
    console.log("response by calculator tool ", response);
    return response;
  } catch (error) {
    console.log("error in calculator tool ", error);
    return { calculatorTool: { error: "Tool Failed" } };
  }
}
