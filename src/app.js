import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import routes from "./routes/index.js";
import morgan from "morgan";
import logger from "./utils/logger.js";
dotenv.config();

connectDB();

const app = express();
app.use(
  morgan("dev", {
    stream: { write: (message) => logger.info(message.trim()) },
  }),
);
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://b8lnk.vercel.app",
    ],
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(bodyParser.json());

app.use("/api", routes);

app.get("/", (req, res) => {
  res.send("b8lnk backend is running!");
});
app.listen(process.env.PORT || 9000, () => {
  console.log(`Server is running on port ${process.env.PORT || 9000}`);
});
