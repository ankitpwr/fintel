import type { Request, Response } from "express";
import type { CustomRequest } from "../../middleware/auth.middleware";
import { z } from "zod";
import { reportSchemaBody } from "../../lib/zod-schema";
import { startAgent } from "../../worker/agent";

export const generateReport = async (req: Request, res: Response) => {
  try {
    const parsedBody = reportSchemaBody.safeParse(req.body);
    if (!parsedBody.success) {
      return res.json(400).json({
        message: "Validation failed",
        error: parsedBody.error.issues[0]?.message,
      });
    }
    const response = await startAgent(parsedBody.data.userQuery);
    return res.status(400).json({
      data: response,
    });
  } catch (error) {
    console.log("error in generateReport");
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
