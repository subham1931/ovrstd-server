import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./db/connection.js";
import cors from "cors";

// For __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

app.use(express.json());
// Serve the uploads folder statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
connectDB();
app.get("/", (req, res) => {
    res.send("Server is running");
})

import userRoutes from "./routes/userRoute.js";
app.use("/auth", userRoutes);

app.listen(3000,() => {
    console.log("Server is running on port 3000")
})