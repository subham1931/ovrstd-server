import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectDB from "../db/connection.js";

const createSeller = async () => {
    try {
        await connectDB();
        
        const db = mongoose.connection.db;
        const usersCollection = db.collection("users");
        
        // Drop old mobile index if it exists
        try {
            await usersCollection.dropIndex("mobile_1");
            console.log("Dropped old mobile index");
        } catch (e) {
            // Index might not exist, ignore
        }
        
        const existingUser = await usersCollection.findOne({ email: "subham019650@gmail.com" });
        
        if (existingUser) {
            await usersCollection.updateOne(
                { email: "subham019650@gmail.com" },
                { $set: { role: "seller" } }
            );
            console.log("✅ User updated to seller role:", existingUser.email);
        } else {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash("Subham@19", salt);
            
            await usersCollection.insertOne({
                username: "subham_seller",
                email: "subham019650@gmail.com",
                password: hashedPassword,
                gender: "Male",
                role: "seller",
                isActive: true,
                tier: "free",
                address: [],
                wishlist: [],
                cart: [],
                orders: [],
                createdAt: new Date(),
                updatedAt: new Date()
            });
            console.log("✅ Seller account created: subham019650@gmail.com");
        }
        
        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error.message);
        process.exit(1);
    }
};

createSeller();
