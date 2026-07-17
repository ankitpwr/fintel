import { nseClient } from "../../lib/nseClient";

export async function getSymbol(company: string) {
  try {
    const url =
      `NextApi/globalSearch/equity?symbol=` + encodeURIComponent(company);
    const { data } = await nseClient.get(url);

    console.log("inside getSymbol tool ", data["data"]);
    return data["data"];
  } catch (error) {
    return { getSymbol: "Failed to respond" };
  }
}
