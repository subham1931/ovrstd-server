import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./db/connection.js";
import cors from "cors";
import userRoutes from "./routes/userRoute.js";
import sellerRoutes from "./routes/sellerRoute.js";
import Category from "./models/categoryModel.js";
import { protect } from "./middleware/authMiddleware.js";
import { getCart } from "./controllers/userController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/public", express.static(path.join(__dirname, "public")));

connectDB();

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["*"];

app.use(
  cors({
    origin(origin, callback) {
      // allow all if *
      if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS blocked"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "noloader",
    ],
    credentials: true,
  })
);

app.options(/.*/, cors());

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "API is healthy" });
});

// Register before /auth router so GET /auth/cart cannot be captured by router.get("/:id") on older or misordered builds.
app.get("/auth/cart", protect, getCart);

app.use("/auth", userRoutes);
app.use("/seller", sellerRoutes);

// Public API endpoints
app.get("/api/categories", async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch categories" });
  }
});

function uploadErrorMessage(err) {
  if (err?.message) return err.message;
  if (typeof err?.error === "string") return err.error;
  if (err?.error?.message) return err.error.message;
  try {
    return JSON.stringify(err?.error ?? err);
  } catch {
    return "Upload failed";
  }
}

app.use((err, req, res, next) => {
  console.error(err);
  const status =
    typeof err.http_code === "number"
      ? err.http_code
      : typeof err.status === "number"
        ? err.status
        : typeof err.statusCode === "number"
          ? err.statusCode
          : 500;
  res.status(status).json({ message: uploadErrorMessage(err) });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});