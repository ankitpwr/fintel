import { LLMTestCase, SingleTurnParams } from "deepeval/test-case";
import { GEval, TaskCompletionMetric } from "deepeval/metrics";
import { dataset } from "./golden";
import { startAgent } from "../agent";
import { evaluate } from "deepeval";

import { OpenAIModel } from "deepeval/models";
const judge = new OpenAIModel({
  model: "gpt-5.4-mini",
  apiKey: process.env.OPENAI_TOKEN,
  temperature: 0,
});

//metrics
const correctnessMetric = new GEval({
  name: "Correctness",
  // Explicit steps instead of free-text `criteria` so the judge doesn't
  // silently regenerate strict, exact-match reasoning on every run.
  evaluationSteps: [
    "Identify the specific figure(s), ratio(s), or fact(s) the question is actually asking for.",
    "Extract the corresponding figure(s) from 'actual output' and compare them to 'expected output' by VALUE, not by formatting. Treat different units, scales, or notations that represent the same value as equivalent.",
    "Numeric answers within about 3% of the expected value count as correct.",
    "Do not penalize the response for including extra correct, relevant supporting detail that is not present in 'expected output'.",
    "If the question has multiple parts (e.g. two companies, two metrics), score proportionally to the fraction of parts answered correctly instead of failing the whole answer for one wrong or missing part.",
  ],

  evaluationParams: [
    SingleTurnParams.INPUT,
    SingleTurnParams.ACTUAL_OUTPUT,
    SingleTurnParams.EXPECTED_OUTPUT,
  ],
  model: judge,
  threshold: 0.5,
});

const taskCompletion = new TaskCompletionMetric({
  threshold: 0.7,
  model: judge,
});
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function startEvaluation() {
  const testCases = [];
  for (let i = 0; i < dataset.length; i++) {
    console.log("started at --> ", new Date().toLocaleTimeString());
    const testCase = dataset[i];
    if (!testCase) continue;

    const actualOutput = await startAgent(testCase["query"], "brief");
    testCases.push(
      new LLMTestCase({
        input: testCase["query"],
        expectedOutput: testCase["answer"],
        actualOutput: actualOutput?.finalResponse!,
      }),
    );

    console.log("finished at --> ", new Date().toLocaleTimeString());
    console.log(
      "-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------",
    );
    console.log("");
    await sleep(1000 * 60 * 1);
  }

  const metrics = [correctnessMetric, taskCompletion];
  await evaluate(testCases, metrics, { asyncConfig: { maxConcurrent: 2 } });
}

startEvaluation();
