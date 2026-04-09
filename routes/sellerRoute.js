import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import {
    getDashboardStats,
    createCategory,
    getAllCategories,
    updateCategory,
    deleteCategory,
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    updateStock,
    deleteProduct,
    deleteProductImage,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    sellerLogin
} from "../controllers/sellerController.js";

const router = express.Router();

// Seller middleware to check role
const sellerOnly = async (req, res, next) => {
    if (req.user.role !== "seller" && req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied. Seller privileges required." });
    }
    next();
};

// Auth
router.post("/login", sellerLogin);

// Dashboard
router.get("/dashboard", protect, sellerOnly, getDashboardStats);

// Categories
router.get("/categories", protect, sellerOnly, getAllCategories);
router.post("/categories", protect, sellerOnly, upload.single("image"), createCategory);
router.put("/categories/:id", protect, sellerOnly, upload.single("image"), updateCategory);
router.delete("/categories/:id", protect, sellerOnly, deleteCategory);

// Products
router.get("/products", protect, sellerOnly, getAllProducts);
router.get("/products/:id", protect, sellerOnly, getProductById);
router.post("/products", protect, sellerOnly, upload.array("images", 10), createProduct);
router.put("/products/:id", protect, sellerOnly, upload.array("images", 10), updateProduct);
router.put("/products/:id/stock", protect, sellerOnly, updateStock);
router.delete("/products/:id", protect, sellerOnly, deleteProduct);
router.delete("/products/:id/image", protect, sellerOnly, deleteProductImage);

// Orders
router.get("/orders", protect, sellerOnly, getAllOrders);
router.get("/orders/:id", protect, sellerOnly, getOrderById);
router.put("/orders/:id/status", protect, sellerOnly, updateOrderStatus);

export default router;
