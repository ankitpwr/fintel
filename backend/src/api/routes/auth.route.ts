import express, { Router } from "express";
import { login, signup, userDetails } from "../controllers/auth.controller";

export const authRouter = Router();

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.get("/me", userDetails);
