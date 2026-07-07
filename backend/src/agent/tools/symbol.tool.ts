import { nseClient } from "./financial.tool";

export async function getSymbol(company: string) {
  try {
    const url =
      `NextApi/globalSearch/equity?symbol=` + encodeURIComponent(company);
    const { data } = await nseClient.get(url);
    return data["data"];
  } catch (error) {
    return { getSymbol: "Failed to respond" };
  }
}
