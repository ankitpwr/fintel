import "dotenv/config";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import type { AppStateType } from "../worker/agent";
import { nseClient } from "./financial.tool";
import { ChatGroq } from "@langchain/groq";
import { z } from "zod";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

import { AIMessage, HumanMessage, SystemMessage } from "langchain";

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
        console.log("get-earningCall-data :  -", obj["attchmntFile"]);
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

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
    chunkSize: 6000,
    chunkOverlap: 400,
  });

  const optimizedChunks = await splitter.createDocuments([fullText]);

  const model = new ChatGroq({
    model: "llama-3.3-70b-versatile",
    maxRetries: 0,
    apiKey: process.env.GROQ_API_KEY,
  });

  const summarySchema = z.object({
    summary: z.string().describe("summary of the given text"),
  });

  const structuredMapModel = model.withStructuredOutput(summarySchema);

  let summaries: string[] = [];

  for (let i = 0; i < optimizedChunks.length; i++) {
    const chunk = optimizedChunks[i];
    if (chunk == null || chunk == undefined) return;
    const messages: Array<SystemMessage | HumanMessage | AIMessage> = [
      new SystemMessage(
        `You are analyzing an earnings call transcript for ${state.companyName}.
Extract ONLY: revenue figures, margins, EPS, deal wins, guidance, and other key strategic insights.
Be concise — 4 sentences max. Do not include greetings, filler, or repetition.`,
      ),

      new HumanMessage(
        `Chunk ${i + 1} of ${optimizedChunks.length}:\n\n${chunk.pageContent}`,
      ),
    ];
    const response = await structuredMapModel.invoke(messages);
    summaries.push(response.summary);
    await delay(4000);
  }

  const finalSummarySchema = z.object({
    revenue: z.string().describe("details on Revenue figures, growth rates"),
    margins: z
      .string()
      .describe("details around Operating margin and net margin "),
    deals: z.string().describe("details around new Deal wins, TCV"),
    guidance: z.string().describe("Forward-looking statements and FY guidance"),
    strategy: z
      .string()
      .describe("details around new strategy, investments and plans "),
    risks: z
      .string()
      .describe(
        "details around risks, shorcoming, headwinds, cautionary notes mentioned",
      ),
  });

  const structuredReduceModel = model.withStructuredOutput(finalSummarySchema);

  const finalSummary = await structuredReduceModel.invoke([
    new SystemMessage(
      `You are synthesizing chunk summaries from a ${state.companyName} earnings call into a structured financial summary.
Consolidate without repetition. Prioritize hard numbers over qualitative statements.`,
    ),
    new HumanMessage(
      `Here are ${summaries.length} chunk summaries. Synthesize them into a structured summary:\n\n` +
        summaries.map((s, i) => `[Chunk ${i + 1}]: ${s}`).join("\n\n"),
    ),
  ]);

  console.log(finalSummary);
  //   return { earningCallSummary: summaries };
}

earningCallPDFSummarizer({
  earningCallTranscriptURL:
    "https://nsearchives.nseindia.com/corporate/TCS_CORPCS_14042026200132_SEInt14042026_signed.pdf",

  companyName: "Tata consultancy Services",
});
