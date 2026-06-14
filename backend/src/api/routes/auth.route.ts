import express, { Router } from "express";
import { googleSignup, login } from "../controllers/auth.controller";

const authRouter = Router();

authRouter.get("/signup", googleSignup);
authRouter.get("/login", login);
