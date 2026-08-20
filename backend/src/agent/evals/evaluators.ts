import { LLMTestCase, SingleTurnParams } from "deepeval/test-case";
import { GEval, TaskCompletionMetric } from "deepeval/metrics";
import { dataset } from "./dataset/golden";
import { startAgent } from "../agent";
import { DeepEvalOpenAICompatibleModel } from "deepeval/models";
import { evaluate } from "deepeval";

const judge = new DeepEvalOpenAICompatibleModel({
  model: "mistralai/mistral-nemotron",
  apiKey: process.env.NVIDIA_TOKEN,
  baseURL: "https://integrate.api.nvidia.com/v1",
  temperature: 0.1,
});

const correctnessMetric = new GEval({
  name: "Correctness",
  criteria:
    "Determine whether the actual output is factually correct based on the expected output.",
  // NOTE: you can only provide either criteria or evaluationSteps, and not both

  evaluationParams: [
    SingleTurnParams.INPUT,
    SingleTurnParams.ACTUAL_OUTPUT,
    SingleTurnParams.EXPECTED_OUTPUT,
  ],
  model: judge,
});

const output = ` Arvind Fashions achieved a gross margin of approximately **60.35%** for FY25.
*   **Total Revenue:** ₹46,176.10 million
*   **Gross Profit:** ₹22,790.00 million
*   **Cost of Revenue:** ₹23,386.10 million`;

const testCases = [];
for (let i = 0; i < dataset.length; i++) {
  const testCase = dataset[i];
  if (!testCase) continue;

  // const actualOutput = await startAgent(testCase["query"], "brief");
  testCases.push(
    new LLMTestCase({
      input: testCase["query"],
      expectedOutput: testCase["answer"],
      actualOutput: output,
    }),
  );
}

const taskCompletion = new TaskCompletionMetric({
  threshold: 0.7,
  model: judge,
});

const metrics = [correctnessMetric, taskCompletion];

await evaluate(testCases, metrics, { asyncConfig: { maxConcurrent: 3 } });
