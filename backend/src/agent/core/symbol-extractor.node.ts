import { HumanMessage } from "langchain";
import type { AppStateType } from "../agent";
import { nseClient } from "../tools/financial.tool";

export async function fetchSymbol(state: AppStateType) {
  try {
    if (state.companyName.length == 0) {
      return {
        symbol: [],
        messages: [new HumanMessage(`userQuery: ${state.userQuery}`)],
      };
    }

    const symbols: string[] = [];
    for (let i = 0; i < state.companyName.length; i++) {
      const name = state.companyName[i];
      if (!name) continue;
      const url =
        `NextApi/globalSearch/equity?symbol=` + encodeURIComponent(name);
      const { data } = await nseClient.get(url);
      if (data["data"] == null || data["data"].length == 0) continue;
      symbols.push(data["data"][0]["symbol"]);
    }

    console.log("symbol are ", symbols);
    return {
      symbol: symbols,
      messages: [
        new HumanMessage(
          `userQuery: ${state.userQuery}\n  ` +
            `NSE Symbols to use for tool calls: ${symbols.join(", ")}\n` +
            `IMPORTANT: Use ONLY these exact symbols in all tool calls. Do not guess or use alternative symbols.`,
        ),
      ],
    };
  } catch (error) {
    console.log("error in extract-symbol");
    console.log(error);
    return {
      symbol: "",
      messages: [new HumanMessage(`userQuery: ${state.userQuery}}`)],
    };
  }
}
