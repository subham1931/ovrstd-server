import User from "../models/userModel.js";
import jwt from 'jsonwebtoken';
import cloudinary from '../config/cloudinary.js';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

//register
export const registerUser = async (req, res) => {
    try {
        const { username, email, phone, password, gender } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "Username, email and password are required" });
        }

        const userExist = await User.findOne({ 
            $or: [
                { email },
                ...(phone ? [{ phone }] : [])
            ]
        });
        if (userExist) {
            return res.status(409).json({ message: "User with this email or phone already exists" });
        }

        let profileImage;
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "ecommerce_users",
            });
            profileImage = result.secure_url;
        }

        const user = await User.create({
            username,
            email,
            phone,
            password,
            gender,
            profileImage,
        });

        await user.save();

        res.status(201).json({
            message: "User registered successfully",
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                phone: user.phone,
                gender: user.gender,
                profileImage: user.profileImage,
                address: user.address,
                wishlist: user.wishlist,
                cart: user.cart,
                orders: user.orders,
                tier: user.tier,
                isActive: user.isActive,
                createdAt: user.createdAt,
            },
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error("Error in registerUser:", error);
        res.status(500).json({
            message: "Registration failed",
            error: error.message,
        });
    }
};

//login
export const loginUser = async (req, res) => {
    try {
        const { email, phone, password } = req.body;

        if ((!email && !phone) || !password) {
            return res.status(400).json({ message: "Email or phone, and password are required" });
        }

        const user = await User.findOne({
            $or: [
                ...(email ? [{ email }] : []),
                ...(phone ? [{ phone }] : [])
            ]
        }).select("+password");

        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        res.status(200).json({
            message: "Login successful",
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                phone: user.phone,
                gender: user.gender,
                profileImage: user.profileImage,
                address: user.address,
                wishlist: user.wishlist,
                cart: user.cart,
                orders: user.orders,
                tier: user.tier,
                isActive: user.isActive,
                createdAt: user.createdAt,
            },
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
//getAllUser
export const getAllUser = async (req, res) => {
    try {
        const users = await User.find().select("-password");

        if (!users || users.length == 0) {
            res.status(404).json({ message: "No user found" });
        }

        res.status(200).json({
            count: users.length,
            users,
        })
    } catch (error) {
        console.error("Error in getAllUsers:", error);
        res.status(500).json({ message: "Failed to fetch users", error: error.message });
    }
}
//getuserId
export const getUserById = async (req, res) => {
    try {
        const userId = req.params.id;

        // Validate MongoDB ObjectId format
        if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid user ID format" });
        }
        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({ message: "user not found" })
        }

        res.status(200).json({
            messgae: "user profile fetched sucessfully",
            user,
        });

    } catch (error) {
        console.error("Error in getUserById:", error);
        res.status(500).json({ message: "Failed to get user", error: error.message });
    }
}
// updateUserProfile
export const updateuser = async (req, res) => {
    try {
        const userId = req.user._id;
        const { username } = req.body;
        console.log(username);

        const updateData = {};

        if (username) {
            if (username.length < 3 || username.length > 30) {
                res.status(400).json({ message: "Username must be between 3 and 30 characters" })
            }
            updateData.username = username.trim().toLowerCase();
        }

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "ecommerce_users",
            });
            updateData.profileImage = result.secure_url;
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
            new: true,
            runValidators: true,
        }).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "Profile updated sucessfully",
            user: updateData,
        })
    } catch (error) {
        console.error("Error in updateUserProfile:", error);
        res.status(500).json({
            message: "Error updating profile",
            error: error.message,
        });
    }
}

//change password
export const changePassword = async (req, res) => {
    try {
        const userId = req.user._id;
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: "Both old and new password are required" });
        }

        const user = await User.findOne(userId).select("+password");
        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(oldPassword, newPassword);
        if (!isMatch) {
            return res.status(400).json({ message: "Old password is incorrect" });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: "Password updated successfully" })
    } catch (error) {
        res.status(500).json({ message: "Error changing password", error: error.message });
    }
}

// addAddress / updateAddress / deleteAddres
export const addAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const address = req.body;

        if (!address.fullName || !address.phone || !address.street || !address.city)
            return res.status(400).json({ message: "Missing address fields" });

        user.address.push(address);
        await user.save();

        res.status(201).json({ message: "Error added sucessfully", addAddress: user.address });
    } catch (error) {
        res.status(500).json({ message: "Error adding address", error: error.message });
    }
}

export const updateAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const { addressId } = req.params;
        const update = req.body;

        const address = user.address.id(addressId);
        if (!address)
            return res.status(404).json({ message: "Address not found" });

        Object.assign(address, update);
        await user.save();

        res.status(200).json({
            message: "Address updated successfully",
            address,
        });

    } catch (error) {
        res.status(500).json({ message: "Error updating address", error: error.message })
    }
}

export const deleteAddres = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const { addressId } = req.params;

        const address = user.address.id(addressId);
        if (!address)
            res.status(404).json({ message: "Address not found" });

        address.deleteOne();
        await user.save();

        res.status(200).json({ message: "Address deleted sucessfully" })
    } catch (error) {
        res.status(500).json({ message: "Error deleting address", error: error.message });
    }
}

// make a wishlist
export const toggleWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const { productId } = req.body;

        const index = user.wishlist.indexOf(productId);
        if (index == -1) {
            user.wishlist.push(productId);
            await user.save;
            return res.status(200).json({ message: "Product added to wishlist" });
        } else {
            user.wishlist.splice(index, 1);
            await user.save();
            return res.status(200).json({ message: "Product removed from wishlist" });
        }
    } catch (error) {
        res.status(500).json({ message: "Wishlist operation failed", error: error.message });
    }
}

// getCart / addToCart / removeFromCart / updateQuantity
export const addToCart = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const { productId, quantity } = req.body;

        const existing = user.cart.find(item => item.product.toString() == productId);
        if (existing) {
            existing.quantity += quantity;
        } else {
            user.cart.push({ product: productId, quantity });
        }

        await user.save();
        res.status(200).json({ message: "Item added to cart", cart: user.cart });
    } catch (error) {
        res.status(500).json({ message: "Error adding to cart", error: error.message });
    }
}

export const removeFromCart = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const { productId } = req.body;


        user.cart = user.cart.filter(item => item.product.toString() !== productId);
        await user.save();
        res.status(200).json({ message: "Item removed from cart", cart: user.cart });
    } catch (error) {
        res.status(500).json({ message: "Error removing to cart", error: error.message });
    }
}

// deactivateAccount
export const deactivateAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.isActive = false;
        await user.save();
    } catch (error) {
        res.status(500).json({ message: "Error deactivating account", error: error.message })
    }
}