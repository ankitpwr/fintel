import "dotenv/config";
import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

export interface CustomPayload extends JwtPayload {
  email: string;
  id: string;
}

export interface CustomRequest extends Request {
  email: string;
  id: string;
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = req.cookies.token || "";
    if (!token || token == "") {
      return res.status(401).json({
        message: "Invalid user",
        error: "Unauthorized User, please login first",
      });
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET!) as CustomPayload;
    if (!decode || !decode.email || !decode.id) {
      return res.status(401).json({
        message: "Invalid user",
        error: "Unauthorized User, please login first",
      });
    }

    (req as CustomRequest).email = decode.email;
    (req as CustomRequest).id = decode.id;

    next();
  } catch (error) {
    console.log(error);
  }
}
