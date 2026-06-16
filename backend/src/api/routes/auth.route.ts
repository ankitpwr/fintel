import express, { Router } from "express";
import { login, signup } from "../controllers/auth.controller";

export const authRouter = Router();

authRouter.get("/signup", signup);
authRouter.get("/login", login);
