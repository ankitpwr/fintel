import "dotenv/config";
import { yahooFinance } from "./financial.tool";
import { TavilySearch } from "@langchain/tavily";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { ChatGroq } from "@langchain/groq";
import { z } from "zod";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

import { HumanMessage } from "langchain";
import {
  chunkSystemPrompt,
  earningCallSummarySystemPrompt,
} from "../prompts/prompt";
import axios from "axios";
import { nseClient } from "../../lib/nseClient";

export async function fetchcorporateAction(symbol: string, startDate?: string) {
  try {
    const response = await yahooFinance.chart(`${symbol}.NS`, {
      period1: startDate || "2024-01-01",
      period2: new Date().toISOString().split("T")[0],
      events: "div|split|earn",
    });

    console.log("in corporate action tool ", response.events);
    return response.events;
  } catch (error) {
    console.log("error in fech_price_history");
    console.log(error);
    return "Tool Failed";
  }
}

export async function fetchLatestNews(searchQuery: string) {
  try {
    const tool = new TavilySearch({
      maxResults: 5,
      topic: "news",
      includeImages: false,
      searchDepth: "basic",
      tavilyApiKey: process.env.TAVILY_API_KEY,
    });

    const modelGeneratedToolCall = {
      args: { query: searchQuery },
      id: "1",
      name: tool.name,
      type: "tool_call" as const,
    };
    const toolMsg = await tool.invoke(modelGeneratedToolCall);
    console.log(toolMsg);
    return toolMsg;
  } catch (error) {
    console.log("error in search tool");
    console.log(error);
    return "Tool Failed";
  }
}

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

export async function fetchNews(keyword: string) {
  try {
    const response = await axios.get(
      `https://newsdata.io/api/1/market?apikey=pub_2136412a33cb4aac9cb6f127b80186f5&q=${keyword}&country=in&language=en`,
    );

    const data = response.data.results.map((n: any) => ({
      newTitle: n.title,
      description: n.description,
      publishDate: n.pubDate,
      link: n.link,
      sourceName: n.source_name,
    }));
    if (data.length > 0) {
      return { availableNews: data };
    }
    return { availableNews: "no available news" };
  } catch (error) {
    console.log("error in fetch news ", error);
    return { fetchNews: { error: "Tool Failed" } };
  }
}
