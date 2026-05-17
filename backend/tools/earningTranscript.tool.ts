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
  finalSummarySystemPrompt,
} from "../prompts/summary.prompt";

const chunkSummarySchema = z.object({
  financial_figures: z
    .array(
      z
        .string()
        .describe(
          "neceassary details regarding Revenue, growth, margin, eps, pat and financial ratios",
        ),
    )
    .optional(),
  deals: z
    .array(
      z.string().describe("details regarding new deals, investments, TVC etc"),
    )
    .optional(),
  achievements: z
    .array(
      z.string().describe("new mega deals, achievements, breakthrough etc"),
    )
    .optional(),
  guidance: z
    .array(z.string().describe("key management guidance and remark for future"))
    .optional(),
  risk: z
    .array(
      z
        .string()
        .describe("major risks, concerns, headwinds explicitly mentioned"),
    )
    .optional(),
});

export const finalSummarySchema = z.object({
  financial_figures: z
    .array(
      z
        .string()
        .describe(
          "neceassary details regarding Revenue, growth, operational margin, eps, pat and other financial ratios",
        ),
    )
    .max(15)
    .optional(),
  deals: z
    .array(
      z.string().describe("details regarding new deals, investments, TVC etc"),
    )
    .max(5)
    .optional(),
  achievements: z
    .array(
      z.string().describe("new mega deals, achievements, breakthrough etc"),
    )
    .max(6)
    .optional(),
  guidance: z
    .array(z.string().describe("key management guidance and remark for future"))
    .max(4)
    .optional(),
  risk: z
    .array(
      z
        .string()
        .describe("major risks, concerns, headwinds explicitly mentioned"),
    )
    .max(4)
    .optional(),
});

export async function extractEarningCallPDF(state: AppStateType) {
  try {
    const { data } = await nseClient.get(
      `/corporate-announcements?index=equities&symbol=${state.companySymbol}&category=Transcript`,
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

export async function earningCallPDFSummarizer(state: any) {
  const pdfFile = state.earningCallTranscriptURL;
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
    model: "llama-3.3-70b-versatile",
    maxRetries: 2,
    temperature: 0,
    apiKey: process.env.GROQ_API_KEY,
  });

  const groqStructuredMode = groqModel.withStructuredOutput(finalSummarySchema);
  const messages = [
    finalSummarySystemPrompt,
    new HumanMessage(
      `Company details:- ${state.companyName} belongs to ${state.industry} \\n
       chunk summaries are : - \n ${JSON.stringify(summaries, null, 2)}`,
    ),
  ];
  const result = await groqStructuredMode.invoke(messages);

  return { earningCallSummary: result };
}
