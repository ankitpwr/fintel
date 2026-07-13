import jwt from "jsonwebtoken";
import type { Request, Response } from "express";
import { loginSchema, signupSchema } from "../../lib/zodSchema";
import { client } from "../../lib/google-client";
import { prisma } from "../../lib/prisma";

export const signup = async (req: Request, res: Response) => {
  try {
    const parsedBody = signupSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(401).json({
        error: parsedBody.error.issues[0]?.message,
      });
    }

    const code = parsedBody.data.authCode;
    const { tokens } = await client.getToken(code);

    if (!tokens.id_token) {
      return res.status(400).json({
        error: "Unable to singup",
      });
    }

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(400).json({
        error: "Failed to get payload",
      });
    }

    const { email, name, picture } = payload;

    if (!email || !name) {
      return res.status(400).json({
        error: "Failed to get Email and Name",
      });
    }

    const userExist = await prisma.user.findUnique({
      where: { email: email },
    });

    if (userExist) {
      return res.status(401).json({
        error: "User already exist",
      });
    }

    const user = await prisma.user.create({
      data: {
        name: name,
        email: email,
        picture: picture,
      },
    });

    const { id } = user;

    const token = jwt.sign({ id, email }, process.env.JWT_SECRET!, {
      expiresIn: "20d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      path: "/",
      maxAge: 1000 * 60 * 60 * 480,
    });

    return res.status(200).json({
      message: "Signup successful",
    });
  } catch (error) {
    console.log("singup endpoint error", error);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const parsedBody = loginSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(401).json({
        message: "Validation failed",
        error: parsedBody.error.issues[0]?.message,
      });
    }

    const { tokens } = await client.getToken(parsedBody.data.authCode);
    if (!tokens.id_token) {
      return res.status(400).json({
        message: "Login failed",
        error: "Unable to login",
      });
    }
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(400).json({
        message: "Login failed",
        error: "Failed to get Payload",
      });
    }

    const { email } = payload;

    const user = await prisma.user.findUnique({
      where: { email: email },
      select: { id: true },
    });

    if (!user) {
      return res.status(401).json({
        message: "Login failed",
        error: "Email already exist",
      });
    }

    const { id } = user;
    const token = jwt.sign({ id, email }, process.env.JWT_SECRET!, {
      expiresIn: "20d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      path: "/",
      maxAge: 1000 * 60 * 60 * 480,
    });

    return res.status(200).json({
      message: "Login successful",
    });
  } catch (error) {
    console.log("login endpoint error", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
