import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { authRouter } from "./routes/auth.route";
import { reportRouter } from "./routes/report.route";
import { marketRouter } from "./routes/market.route";
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: ["http://localhost:5173"] }));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/report", reportRouter);
app.use("/api/v1/market", marketRouter);
app.listen(3000, () => {
  console.log("up and running");
});
