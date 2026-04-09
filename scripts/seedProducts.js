import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../db/connection.js";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

const products = [
    {
        name: "Akatsuki Cloud Oversized Tee",
        description: "Premium oversized t-shirt featuring the iconic Akatsuki cloud design from Naruto. Perfect for anime lovers who want to show their style. Made with 100% cotton for maximum comfort.",
        price: 799,
        comparePrice: 1299,
        category: "Anime Collection",
        image: "t1p_nobg.png",
        sizes: [
            { size: "S", stock: 15 },
            { size: "M", stock: 25 },
            { size: "L", stock: 30 },
            { size: "XL", stock: 20 },
            { size: "XXL", stock: 10 }
        ],
        colors: ["Black"],
        isFeatured: true
    },
    {
        name: "Life Is Mix Tape Vintage Tee",
        description: "Retro-inspired oversized t-shirt with a vintage cassette tape design. Perfect for music lovers and 80s enthusiasts. Premium cotton blend for a comfortable fit.",
        price: 699,
        comparePrice: 1199,
        category: "Vintage",
        image: "t2_nobg.png",
        sizes: [
            { size: "S", stock: 20 },
            { size: "M", stock: 30 },
            { size: "L", stock: 25 },
            { size: "XL", stock: 15 },
            { size: "XXL", stock: 10 }
        ],
        colors: ["Black"],
        isFeatured: true
    },
    {
        name: "Tupac Thug Life Portrait Tee",
        description: "Pay tribute to the legend with this Tupac Shakur portrait oversized t-shirt. Features stunning gold typography and detailed artwork. A must-have for hip-hop fans.",
        price: 899,
        comparePrice: 1499,
        category: "Graphic Tees",
        image: "t3_nobg.png",
        sizes: [
            { size: "S", stock: 12 },
            { size: "M", stock: 22 },
            { size: "L", stock: 28 },
            { size: "XL", stock: 18 },
            { size: "XXL", stock: 8 }
        ],
        colors: ["Black"],
        isFeatured: true
    },
    {
        name: "Thug Life Gothic Text Tee",
        description: "Minimalist oversized t-shirt featuring 'Thug Life' in elegant gold gothic typography. Clean design that makes a bold statement. Premium quality cotton.",
        price: 649,
        comparePrice: 999,
        category: "Typography",
        image: "t4_nobg.png",
        sizes: [
            { size: "S", stock: 18 },
            { size: "M", stock: 28 },
            { size: "L", stock: 35 },
            { size: "XL", stock: 22 },
            { size: "XXL", stock: 12 }
        ],
        colors: ["Black"],
        isFeatured: false
    },
    {
        name: "UNREAL Graffiti Oversized Tee",
        description: "Urban streetwear at its finest. Bold graffiti-style 'UNREAL' text design. Perfect for those who want to stand out. Made with premium cotton for all-day comfort.",
        price: 599,
        comparePrice: 899,
        category: "Streetwear",
        image: "t5_nobg.png",
        sizes: [
            { size: "S", stock: 25 },
            { size: "M", stock: 35 },
            { size: "L", stock: 40 },
            { size: "XL", stock: 25 },
            { size: "XXL", stock: 15 }
        ],
        colors: ["Black"],
        isFeatured: false
    },
    {
        name: "Japanese Dragon Oversized Tee",
        description: "Stunning traditional Japanese dragon artwork on premium oversized t-shirt. Red and gold colors on black fabric create a striking contrast. Perfect for streetwear enthusiasts.",
        price: 849,
        comparePrice: 1399,
        category: "Graphic Tees",
        image: "tshirt_dragon.png",
        sizes: [
            { size: "S", stock: 14 },
            { size: "M", stock: 24 },
            { size: "L", stock: 30 },
            { size: "XL", stock: 20 },
            { size: "XXL", stock: 10 }
        ],
        colors: ["Black"],
        isFeatured: true
    },
    {
        name: "Abstract Wave Minimalist Tee",
        description: "Elegant minimalist design featuring flowing abstract waves. Japanese-inspired aesthetic perfect for a clean, sophisticated look. Premium cotton construction.",
        price: 549,
        comparePrice: 799,
        category: "Abstract Art",
        image: "tshirt_wave.png",
        sizes: [
            { size: "S", stock: 20 },
            { size: "M", stock: 30 },
            { size: "L", stock: 35 },
            { size: "XL", stock: 25 },
            { size: "XXL", stock: 12 }
        ],
        colors: ["Black"],
        isFeatured: false
    },
    {
        name: "Skull & Roses Gothic Tee",
        description: "Dark aesthetic oversized t-shirt featuring a detailed skull surrounded by roses. Gothic streetwear design that makes a statement. Premium quality fabric.",
        price: 749,
        comparePrice: 1199,
        category: "Graphic Tees",
        image: "tshirt_skull.png",
        sizes: [
            { size: "S", stock: 16 },
            { size: "M", stock: 26 },
            { size: "L", stock: 32 },
            { size: "XL", stock: 20 },
            { size: "XXL", stock: 10 }
        ],
        colors: ["Black"],
        isFeatured: true
    },
    {
        name: "CHAOS Neon Graffiti Tee",
        description: "Bold neon green and pink graffiti design oversized t-shirt. Urban streetwear that demands attention. Perfect for making a statement. Premium cotton blend.",
        price: 799,
        comparePrice: 1299,
        category: "Streetwear",
        image: "tshirt_chaos.png",
        sizes: [
            { size: "S", stock: 18 },
            { size: "M", stock: 28 },
            { size: "L", stock: 34 },
            { size: "XL", stock: 22 },
            { size: "XXL", stock: 12 }
        ],
        colors: ["Black"],
        isFeatured: true
    },
    {
        name: "Vaporwave Sunset Oversized Tee",
        description: "80s retro vaporwave aesthetic oversized t-shirt. Features stunning sunset gradient with palm trees and Japanese text. Perfect for synthwave and retrowave fans.",
        price: 699,
        comparePrice: 1099,
        category: "Vintage",
        image: "tshirt_sunset.png",
        sizes: [
            { size: "S", stock: 22 },
            { size: "M", stock: 32 },
            { size: "L", stock: 38 },
            { size: "XL", stock: 24 },
            { size: "XXL", stock: 14 }
        ],
        colors: ["Black"],
        isFeatured: true
    }
];

const seedProducts = async () => {
    try {
        await connectDB();
        
        const db = mongoose.connection.db;
        const productsCollection = db.collection("products");
        const categoriesCollection = db.collection("categories");
        
        // Get categories
        const categories = await categoriesCollection.find({}).toArray();
        const categoryMap = {};
        categories.forEach(cat => {
            categoryMap[cat.name] = cat._id;
        });
        
        console.log("📦 Found categories:", Object.keys(categoryMap).join(", "));
        
        // Clear existing products
        await productsCollection.deleteMany({});
        console.log("🗑️  Cleared existing products\n");
        
        for (const product of products) {
            console.log(`📦 Creating product: ${product.name}...`);
            
            // Use local image URL
            const imageUrl = `${BASE_URL}/public/products/${product.image}`;
            
            // Calculate total stock
            const totalStock = product.sizes.reduce((sum, s) => sum + s.stock, 0);
            
            // Find category ID
            const categoryId = categoryMap[product.category];
            if (!categoryId) {
                console.log(`   ⚠️  Category not found: ${product.category}, skipping...`);
                continue;
            }
            
            // Create product
            await productsCollection.insertOne({
                name: product.name,
                description: product.description,
                price: product.price,
                comparePrice: product.comparePrice,
                category: categoryId,
                images: [imageUrl],
                sizes: product.sizes,
                totalStock,
                colors: product.colors,
                isActive: true,
                isFeatured: product.isFeatured,
                ratings: { average: 0, count: 0 },
                soldCount: Math.floor(Math.random() * 50) + 10,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            
            console.log(`   ✅ Created with image: ${imageUrl}\n`);
        }
        
        const count = await productsCollection.countDocuments();
        console.log(`\n🎉 Successfully seeded ${count} products!`);
        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error.message);
        process.exit(1);
    }
};

seedProducts();
