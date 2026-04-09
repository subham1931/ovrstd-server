import express from 'express'
import upload from '../middleware/uploadMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';
import { addAddress, addToCart, changePassword, deactivateAccount, deleteAddres, getAllUser, getProfile, getUserById, loginUser, registerUser, removeFromCart, toggleWishlist, updateAddress, updateuser } from '../controllers/userController.js';

const router = express.Router();

router.post("/register", upload.single("profileImage"), registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getProfile);
router.get("/getAllUser", getAllUser);
router.get("/:id", protect, getUserById);

//update-user-credencials
router.put("/updateProfile", protect, upload.single("profileImage"), updateuser);
router.put("/changePassword", protect, changePassword);

//address routes
router.post("/address", protect, addAddress);
router.put("/address/:addressId", protect, updateAddress);
router.delete("/address/:addressId", protect, deleteAddres);

//wishlist-product
router.post("/wishlist",protect,toggleWishlist);

//cart 
router.post("/cart",protect,addToCart)
router.post("/cart/:productId",protect,removeFromCart)

// Deactivate
router.put("/deactivate", protect, deactivateAccount);

export default router;