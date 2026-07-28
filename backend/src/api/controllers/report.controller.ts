import type { Request, Response } from "express";
import type { CustomRequest } from "../../middleware/auth.middleware";
import { reportSchemaBody } from "../../lib/zodSchema";
import { queryQueue } from "../../queue/queue";
import crypto from "crypto";
import { subscriber } from "../../lib/redis";

export const generateReport = async (req: Request, res: Response) => {
  try {
    const parsedBody = reportSchemaBody.safeParse(req.body);
    const { id } = req as CustomRequest;
    if (!parsedBody.success) {
      return res.json(400).json({
        message: "Validation failed",
        error: parsedBody.error.issues[0]?.message,
      });
    }

    console.log("query type is ", parsedBody.data.queryType, " id is ", id);
    // custom jobids
    await queryQueue.add(
      "user-queury",
      {
        userQuery: parsedBody.data.userQuery,
        userId: id,
        queryType: parsedBody.data.queryType,
      },
      {
        jobId: `report-${id}-${crypto.randomUUID()}`,
        attempts: 3,
        backoff: { type: "exponential", delay: 1000 },
      },
    );

    return res.status(200).json({
      message: "query is currently executing",
    });
  } catch (error) {
    console.log("error in generateReport");
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

const connectedClients = new Map<string, Response>();
subscriber.subscribe("agent-updates", (err) => {
  if (err) console.log("failed to subscribe");
});

subscriber.on("message", (channel, message) => {
  if (channel == "agent-updates") {
    const parsedMessage = JSON.parse(message);
    sendUpdateToClient(
      parsedMessage.userId,
      parsedMessage.type,
      parsedMessage.message,
    );
  }
});

export const streamResponse = async (req: Request, res: Response) => {
  try {
    const { id } = req as CustomRequest;
    connectedClients.set(id, res);
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();
    const heartbeat = setInterval(
      () => res.write("data: heartbeat\n\n"),
      25000,
    );
    res.on("close", () => {
      connectedClients.delete(id);
      clearInterval(heartbeat);
    });
  } catch (error) {
    console.log(error);
    console.log("error in stream response");
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

async function sendUpdateToClient(
  userId: string,
  type: string,
  message: string,
) {
  try {
    if (
      connectedClients.has(userId) &&
      connectedClients.get(userId) != undefined
    ) {
      connectedClients
        .get(userId)
        ?.write(`data: ${JSON.stringify({ userId, type, message })}\n\n`);
    }
  } catch (error) {
    console.log(error);
  }
}
