import express, { Router } from "express";
import {
  login,
  logout,
  signup,
  userDetails,
} from "../controllers/auth.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

export const authRouter = Router();

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.get("/me", authMiddleware, userDetails);
authRouter.post("/logout", authMiddleware, logout);
