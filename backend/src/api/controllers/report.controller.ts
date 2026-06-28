import type { Request, Response } from "express";
import type { CustomRequest } from "../../middleware/auth.middleware";
import { z } from "zod";
import { reportSchemaBody } from "../../lib/zod-schema";
import { queryQueue } from "../../queue/queue";

export const generateReport = async (req: Request, res: Response) => {
  try {
    const parsedBody = reportSchemaBody.safeParse(req.body);
    if (!parsedBody.success) {
      return res.json(400).json({
        message: "Validation failed",
        error: parsedBody.error.issues[0]?.message,
      });
    }
    await queryQueue.add(
      "user-queury",
      {
        userQuery: parsedBody.data.userQuery,
      },
      { removeOnComplete: 100, removeOnFail: 500 },
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
