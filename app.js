import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./db/connection.js";
import cors from "cors";
import userRoutes from "./routes/userRoute.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

connectDB();

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "API is healthy" });
});

app.use("/auth", userRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});