import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../db/connection.js";

const categories = [
    { name: "Graphic Tees", description: "Bold graphic prints and artwork designs", isActive: true },
    { name: "Solid Colors", description: "Plain solid color oversized t-shirts", isActive: true },
    { name: "Anime Collection", description: "Anime inspired oversized t-shirts", isActive: true },
    { name: "Streetwear", description: "Urban streetwear style designs", isActive: true },
    { name: "Vintage", description: "Retro and vintage aesthetic prints", isActive: true },
    { name: "Typography", description: "Text and quote based designs", isActive: true },
    { name: "Abstract Art", description: "Abstract and artistic prints", isActive: true },
    { name: "Limited Edition", description: "Exclusive limited edition drops", isActive: true },
    { name: "New Arrivals", description: "Latest additions to the collection", isActive: true },
    { name: "Best Sellers", description: "Customer favorite oversized tees", isActive: true },
];

const seedCategories = async () => {
    try {
        await connectDB();
        
        const db = mongoose.connection.db;
        const categoriesCollection = db.collection("categories");
        
        // Clear existing categories
        await categoriesCollection.deleteMany({});
        console.log("🗑️  Cleared existing categories\n");
        
        for (const category of categories) {
            await categoriesCollection.insertOne({
                ...category,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            console.log(`✅ Created: ${category.name}`);
        }
        
        console.log("\n🎉 Categories seeding completed!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error.message);
        process.exit(1);
    }
};

seedCategories();
