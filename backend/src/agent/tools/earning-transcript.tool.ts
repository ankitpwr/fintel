import "dotenv/config";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import type { AppStateType } from "../worker/agent";
import { nseClient } from "./financial.tool";
import { ChatGroq } from "@langchain/groq";
import { z } from "zod";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

import { HumanMessage } from "langchain";
import {
  chunkSystemPrompt,
  earningCallSummarySystemPrompt,
} from "../prompts/prompt";

const chunkSummarySchema = z.object({
  financial_figures: z
    .array(
      z
        .string()
        .describe(
          "neceassary details regarding Revenue, growth, margin, eps, pat and financial ratios. if nothing relevent just return 'nothing' ",
        ),
    )
    .optional(),
  deals: z
    .array(
      z
        .string()
        .describe(
          "details regarding new deals, investments, TVC etc.  if nothing relevent just return 'nothing' ",
        ),
    )
    .optional(),
  achievements: z
    .array(
      z
        .string()
        .describe(
          "new mega deals, achievements, breakthrough etc,  if nothing relevent just return 'nothing' ",
        ),
    )
    .optional(),
  guidance: z
    .array(
      z
        .string()
        .describe(
          "key management guidance and remark for future,  if nothing relevent just return 'nothing' ",
        ),
    )
    .optional(),
  risk: z
    .array(
      z
        .string()
        .describe(
          "major risks, concerns, headwinds explicitly mentioned.   if nothing relevent just return 'nothing'",
        ),
    )
    .optional(),
});

export const finalSummarySchema = z.object({
  financial_figures: z
    .array(
      z
        .string()
        .describe(
          "neceassary details regarding Revenue, growth, operational margin, eps, pat and other financial ratios.  if nothing relevent just return 'nothing'",
        ),
    )
    .describe("maximum 15 elements in array")
    .max(15)
    .optional(),
  deals: z
    .array(
      z
        .string()
        .describe(
          "details regarding new deals, investments, TVC etc.  if nothing relevent just return 'nothing'",
        ),
    )
    .describe("maximum 5 elements in array")
    .max(5)
    .optional(),
  achievements: z
    .array(
      z
        .string()
        .describe(
          "new mega deals, achievements, breakthrough etc.  if nothing relevent just return 'nothing'",
        ),
    )
    .describe("maximum 6 elements in array")
    .max(6)
    .optional(),
  guidance: z
    .array(
      z
        .string()
        .describe(
          "key management guidance and remark for future.  if nothing relevent just return 'nothing'",
        ),
    )
    .describe(
      "maximum 4 elements in array.  if nothing relevent just return 'nothing'",
    )
    .max(4)
    .optional(),
  risk: z
    .array(
      z
        .string()
        .describe(
          "major risks, concerns, headwinds explicitly mentioned.  if nothing relevent just return 'nothing'",
        ),
    )
    .describe("maximum 4 elements in array")
    .max(4)
    .optional(),
});

export async function fetchEarningCallPDF(symbol: string) {
  try {
    const { data } = await nseClient.get(
      `/corporate-announcements?index=equities&symbol=${symbol}&category=Transcript`,
    );

    let pdfURL = "";
    for (let i = 0; i < data.length; i++) {
      let obj = data[i];
      if (
        obj["desc"] ===
          "Analysts/Institutional Investor Meet/Con. Call Updates" &&
        (obj["attchmntText"] as String).includes(
          "informed the Exchange about Transcript",
        )
      ) {
        pdfURL = obj["attchmntFile"];
        break;
      }
    }

    return { earningCallTranscriptURL: pdfURL };
  } catch (error) {
    console.log("error in extract-earning-call-pdf");
    console.log(error);
  }
}

export async function earningCallPDFSummarizer(state: {
  url: string;
  companyName: string;
  industry: string;
}) {
  const pdfFile = state.url;
  const response = await nseClient.get(pdfFile, {
    responseType: "arraybuffer", // get raw binary bytes not json.
  });

  const blob = new Blob([response.data], { type: "application/pdf" }); //create blob object from array buffer
  const loader = new PDFLoader(blob);
  const docs = await loader.load();
  const fullText = docs.map((doc) => doc.pageContent).join("\n\n"); //extracts the pageContent from every single page and stitches them all together into one massive string.
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 15000,
    chunkOverlap: 500,
  });
  const chunks = await splitter.createDocuments([fullText]);

  const model = new ChatGoogleGenerativeAI({
    model: "gemini-3.1-flash-lite-preview",
    maxRetries: 2,
    apiKey: process.env.GOOGLE_API_KEY,
  });

  // map part
  let summaries = [];

  const smodel = model.withStructuredOutput(chunkSummarySchema);

  try {
    for (let i = 0; i < chunks.length; i++) {
      let chunk = chunks[i];
      if (chunk == null) continue;

      const response = await smodel.invoke([
        chunkSystemPrompt,
        new HumanMessage(
          `Company details: -  ${state.companyName} belongs to ${state.industry} \\n
           chunk number: ${i}\nchunk content:\n${chunk.pageContent}`,
        ),
      ]);

      summaries.push(response);
    }
  } catch (error) {
    console.log(error);
  }

  //reducer part
  const groqModel = new ChatGroq({
    model: "openai/gpt-oss-120b",
    maxRetries: 2,
    temperature: 0,
    apiKey: process.env.GROQ_API_KEY,
  });

  const groqStructuredMode = groqModel.withStructuredOutput(finalSummarySchema);
  const messages = [
    earningCallSummarySystemPrompt,
    new HumanMessage(
      `Company details:- ${state.companyName} belongs to ${state.industry} \\n
       chunk summaries are : - \n ${JSON.stringify(summaries, null, 2)}`,
    ),
  ];
  const result = await groqStructuredMode.invoke(messages);

  return { earningCallSummary: result };
}
