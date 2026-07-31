import { evaluate } from "mathjs";

export function calculator(exp: string) {
  try {
    console.log("input to calculator tool is   ", exp);
    const result = evaluate(exp);
    return { success: true, calculatedData: result };
  } catch (error) {
    console.log("error in calculator ", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Calculator tool failed",
    };
  }
}
