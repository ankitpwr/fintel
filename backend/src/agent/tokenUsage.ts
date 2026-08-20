import { AIMessage } from "langchain";

export function sumTokensFromMessages(messages: any[]): number {
  return messages.reduce((total, msg) => {
    if (msg instanceof AIMessage && msg.usage_metadata?.total_tokens) {
      return total + msg.usage_metadata.total_tokens;
    }
    return total;
  }, 0);
}
