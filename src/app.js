import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import routes from "./routes/index.js";
import morgan from "morgan";
import logger from "./utils/logger.js";
import { generalLimiter } from "./middlewares/rateLimit.middleware.js";
import swaggerUi from "swagger-ui-express";
import fs from "fs";

const swaggerDocument = JSON.parse(
  fs.readFileSync(new URL("./swagger.json", import.meta.url)),
);

dotenv.config();

const defaultOrigins = ["http://localhost:3000", "http://localhost:3001"];
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim())
  : defaultOrigins;

const app = express();
app.use(
  morgan("dev", {
    stream: { write: (message) => logger.info(message.trim()) },
  }),
);
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(generalLimiter);

app.use("/api", routes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/", (req, res) => {
  res.send("Clickfold backend is running!");
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  logger.error(err.stack || err.message);
  const statusCode = err.name === "MulterError" ? 400 : err.statusCode || 500;
  res
    .status(statusCode)
    .json({ success: false, message: err.message || "Internal Server Error" });
});

export default app;
