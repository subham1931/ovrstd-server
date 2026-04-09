import mongoose from "mongoose";
import bcrypt from 'bcryptjs'

const addressSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    isDefault: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        trim: true,
        lowercase: true,
        required: true,
        minlength: 3,
        maxlength: 30,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Invalid email format"]
    },
    phone: {
        type: String,
        unique: true,
        sparse: true,
        match: [/^[0-9]{10,15}$/, "Invalid phone number format"]
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters long"],
        select: false,
        trim: true,
    },
    gender:{
        type: String,
        enum: ["Male", "Female", "Other"],
        required: true,
    },
    profileImage: {
        type: String, 
        default: "/uploads/default_user.png",
    },
    address: [addressSchema],

    wishlist: [
        { type: mongoose.Schema.Types.ObjectId, ref: "Prodcut" }
    ],

    cart: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                require: true,
            },
            quantity: {
                type: Number,
                required: true,
                min: 1,
            },
        }
    ],
    orders: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order"
        },
    ],
    tier: {
        type: String,
        enum: ["free", "plus"],
        default: "free"
    },
    isActive: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
})

userSchema.methods.matchPassword = async function (ePassword) {
    return await bcrypt.compare(ePassword, this.password);
}

const User = mongoose.model("User", userSchema);
export default User;