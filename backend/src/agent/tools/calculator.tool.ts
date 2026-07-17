import { evaluate } from "mathjs";

export function calculator(exp: string) {
  try {
    const result = evaluate(exp);
    return result;
  } catch (error) {
    console.log("error in calculator ", error);
    return "error";
  }
}
