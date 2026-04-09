import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Product name is required"],
        trim: true,
        maxlength: [200, "Product name cannot exceed 200 characters"]
    },
    description: {
        type: String,
        required: [true, "Product description is required"],
        maxlength: [2000, "Description cannot exceed 2000 characters"]
    },
    price: {
        type: Number,
        required: [true, "Price is required"],
        min: [0, "Price cannot be negative"]
    },
    comparePrice: {
        type: Number,
        default: null
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: [true, "Category is required"]
    },
    images: [{
        type: String
    }],
    sizes: [{
        size: {
            type: String,
            required: true
        },
        stock: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        }
    }],
    totalStock: {
        type: Number,
        default: 0
    },
    colors: [{
        type: String
    }],
    sku: {
        type: String,
        unique: true,
        sparse: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    ratings: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0
        }
    },
    soldCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

productSchema.pre("save", function(next) {
    if (this.sizes && this.sizes.length > 0) {
        this.totalStock = this.sizes.reduce((total, size) => total + size.stock, 0);
    }
    next();
});

const Product = mongoose.model("Product", productSchema);
export default Product;
