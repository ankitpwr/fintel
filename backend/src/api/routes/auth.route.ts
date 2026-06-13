import express, { Router } from "express";
import { googleSignup } from "../controllers/auth.controller";

const authRouter = Router();

authRouter.get("/signup", googleSignup);
