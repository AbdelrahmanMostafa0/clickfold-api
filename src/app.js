import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import routes from "./routes/index.js";

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

app.use(cors({}));
app.use(cookieParser());
app.use(bodyParser.json());

app.use("/api", routes);

app.get("/", (req, res) => {
  res.send("b8lnk backend is running!");
});
app.listen(9000, () => {
  console.log("Server is running on port 9000");
});
