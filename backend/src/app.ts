import express from "express";
import cors from "cors";
import env from "./config/env";
import router from "./routes";

const app = express();

app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());

app.use("/api", router);

export default app;
