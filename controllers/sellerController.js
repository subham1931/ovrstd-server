import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";
import Category from "../models/categoryModel.js";
import cloudinary from "../config/cloudinary.js";

// Dashboard Stats
export const getDashboardStats = async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();
        const activeProducts = await Product.countDocuments({ isActive: true });
        const lowStockProducts = await Product.countDocuments({ totalStock: { $lte: 10, $gt: 0 } });
        const outOfStockProducts = await Product.countDocuments({ totalStock: 0 });

        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: "pending" });
        const processingOrders = await Order.countDocuments({ status: "processing" });
        const shippedOrders = await Order.countDocuments({ status: "shipped" });
        const deliveredOrders = await Order.countDocuments({ status: "delivered" });
        const cancelledOrders = await Order.countDocuments({ status: "cancelled" });

        const revenueResult = await Order.aggregate([
            { $match: { status: { $nin: ["cancelled", "returned"] } } },
            { $group: { _id: null, total: { $sum: "$total" } } }
        ]);
        const totalRevenue = revenueResult[0]?.total || 0;

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayOrders = await Order.countDocuments({ createdAt: { $gte: todayStart } });
        const todayRevenueResult = await Order.aggregate([
            { $match: { createdAt: { $gte: todayStart }, status: { $nin: ["cancelled", "returned"] } } },
            { $group: { _id: null, total: { $sum: "$total" } } }
        ]);
        const todayRevenue = todayRevenueResult[0]?.total || 0;

        const totalCategories = await Category.countDocuments();

        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("user", "username email");

        const topProducts = await Product.find({ isActive: true })
            .sort({ soldCount: -1 })
            .limit(5)
            .select("name images price soldCount totalStock");

        res.status(200).json({
            message: "Dashboard stats fetched successfully",
            stats: {
                products: {
                    total: totalProducts,
                    active: activeProducts,
                    lowStock: lowStockProducts,
                    outOfStock: outOfStockProducts
                },
                orders: {
                    total: totalOrders,
                    pending: pendingOrders,
                    processing: processingOrders,
                    shipped: shippedOrders,
                    delivered: deliveredOrders,
                    cancelled: cancelledOrders,
                    today: todayOrders
                },
                revenue: {
                    total: totalRevenue,
                    today: todayRevenue
                },
                categories: totalCategories,
                recentOrders,
                topProducts
            }
        });
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        res.status(500).json({ message: "Failed to fetch dashboard stats", error: error.message });
    }
};

// Category CRUD
export const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        
        let image = null;
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "ecommerce_categories"
            });
            image = result.secure_url;
        }

        const category = await Category.create({ name, description, image });
        res.status(201).json({ message: "Category created successfully", category });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "Category with this name already exists" });
        }
        res.status(500).json({ message: "Failed to create category", error: error.message });
    }
};

export const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });
        res.status(200).json({ message: "Categories fetched successfully", categories });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch categories", error: error.message });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, isActive } = req.body;

        const updateData = { name, description, isActive };

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "ecommerce_categories"
            });
            updateData.image = result.secure_url;
        }

        const category = await Category.findByIdAndUpdate(id, updateData, { new: true });
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.status(200).json({ message: "Category updated successfully", category });
    } catch (error) {
        res.status(500).json({ message: "Failed to update category", error: error.message });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const productsInCategory = await Product.countDocuments({ category: id });
        
        if (productsInCategory > 0) {
            return res.status(400).json({ 
                message: `Cannot delete category with ${productsInCategory} products. Move or delete products first.` 
            });
        }

        const category = await Category.findByIdAndDelete(id);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete category", error: error.message });
    }
};

// Product CRUD
export const createProduct = async (req, res) => {
    try {
        const { name, description, price, comparePrice, category, sizes, colors, sku, isFeatured } = req.body;

        let images = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: "ecommerce_products"
                });
                images.push(result.secure_url);
            }
        }

        const parsedSizes = typeof sizes === "string" ? JSON.parse(sizes) : sizes;
        const parsedColors = typeof colors === "string" ? JSON.parse(colors) : colors;

        const product = await Product.create({
            name,
            description,
            price,
            comparePrice,
            category,
            images,
            sizes: parsedSizes || [],
            colors: parsedColors || [],
            sku,
            isFeatured: isFeatured === "true" || isFeatured === true
        });

        res.status(201).json({ message: "Product created successfully", product });
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ message: "Failed to create product", error: error.message });
    }
};

export const getAllProducts = async (req, res) => {
    try {
        const { category, search, status, page = 1, limit = 20 } = req.query;
        
        const query = {};
        if (category) query.category = category;
        if (status === "active") query.isActive = true;
        if (status === "inactive") query.isActive = false;
        if (status === "outofstock") query.totalStock = 0;
        if (status === "lowstock") query.totalStock = { $lte: 10, $gt: 0 };
        if (search) query.name = { $regex: search, $options: "i" };

        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const products = await Product.find(query)
            .populate("category", "name")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Product.countDocuments(query);

        res.status(200).json({ 
            message: "Products fetched successfully", 
            products,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch products", error: error.message });
    }
};

export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate("category", "name");
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json({ message: "Product fetched successfully", product });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch product", error: error.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, comparePrice, category, sizes, colors, sku, isActive, isFeatured } = req.body;

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (name) product.name = name;
        if (description) product.description = description;
        if (price) product.price = price;
        if (comparePrice !== undefined) product.comparePrice = comparePrice;
        if (category) product.category = category;
        if (sku) product.sku = sku;
        if (isActive !== undefined) product.isActive = isActive === "true" || isActive === true;
        if (isFeatured !== undefined) product.isFeatured = isFeatured === "true" || isFeatured === true;

        if (sizes) {
            product.sizes = typeof sizes === "string" ? JSON.parse(sizes) : sizes;
        }
        if (colors) {
            product.colors = typeof colors === "string" ? JSON.parse(colors) : colors;
        }

        if (req.files && req.files.length > 0) {
            const newImages = [];
            for (const file of req.files) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: "ecommerce_products"
                });
                newImages.push(result.secure_url);
            }
            product.images = [...product.images, ...newImages];
        }

        await product.save();
        res.status(200).json({ message: "Product updated successfully", product });
    } catch (error) {
        res.status(500).json({ message: "Failed to update product", error: error.message });
    }
};

export const updateStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { sizes } = req.body;

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        product.sizes = sizes;
        await product.save();

        res.status(200).json({ message: "Stock updated successfully", product });
    } catch (error) {
        res.status(500).json({ message: "Failed to update stock", error: error.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete product", error: error.message });
    }
};

export const deleteProductImage = async (req, res) => {
    try {
        const { id } = req.params;
        const { imageUrl } = req.body;

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        product.images = product.images.filter(img => img !== imageUrl);
        await product.save();

        res.status(200).json({ message: "Image deleted successfully", product });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete image", error: error.message });
    }
};

// Order Management
export const getAllOrders = async (req, res) => {
    try {
        const { status, search, page = 1, limit = 20, startDate, endDate } = req.query;

        const query = {};
        if (status && status !== "all") query.status = status;
        if (search) {
            query.$or = [
                { orderNumber: { $regex: search, $options: "i" } },
                { "shippingAddress.fullName": { $regex: search, $options: "i" } },
                { "shippingAddress.phone": { $regex: search, $options: "i" } }
            ];
        }
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const orders = await Order.find(query)
            .populate("user", "username email phone")
            .populate("items.product", "name images")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Order.countDocuments(query);

        res.status(200).json({
            message: "Orders fetched successfully",
            orders,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch orders", error: error.message });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("user", "username email phone")
            .populate("items.product", "name images");

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({ message: "Order fetched successfully", order });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch order", error: error.message });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, trackingNumber, estimatedDelivery, notes } = req.body;

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (status) order.status = status;
        if (trackingNumber) order.trackingNumber = trackingNumber;
        if (estimatedDelivery) order.estimatedDelivery = estimatedDelivery;
        if (notes) order.notes = notes;

        if (status === "delivered") {
            order.deliveredAt = new Date();
            if (order.paymentMethod === "cod") {
                order.paymentStatus = "paid";
            }
        }

        await order.save();
        res.status(200).json({ message: "Order status updated successfully", order });
    } catch (error) {
        res.status(500).json({ message: "Failed to update order status", error: error.message });
    }
};

// Seller Auth
export const sellerLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const User = (await import("../models/userModel.js")).default;
        const jwt = (await import("jsonwebtoken")).default;

        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        if (user.role !== "seller" && user.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Seller account required." });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Login failed", error: error.message });
    }
};
