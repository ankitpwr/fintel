import { nseClient } from "../../lib/nseClient";

export async function getSymbol(company: string) {
  try {
    console.log("input to getSymbol tool ", company);

    const url =
      `NextApi/globalSearch/equity?symbol=` + encodeURIComponent(company);
    const { data } = await nseClient.get(url);

    const results = data["data"] ?? [];

    if (!Array.isArray(results) || results.length === 0) {
      return results;
    }

    const eqOnly = results.filter((r: any) => r.series === "EQ");
    const filtered = eqOnly.length > 0 ? eqOnly : results;

    console.log("filtered response from getSymbol tool", filtered);
    return filtered;
  } catch (error) {
    return { getSymbol: "Failed to respond" };
  }
}
