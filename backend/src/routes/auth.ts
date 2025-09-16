import { Router } from "express";
import { register, login, logout } from "../controllers/authController";
import { auth } from "../middleware/auth";

const router = Router();

// POST /auth/register
router.post("/register", register);

// POST /auth/login
router.post("/login", login);

// POST /auth/logout
router.post("/logout", auth, logout);

// GET /auth/me
// GET /auth/me  
router.get("/me", auth, (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    
    res.json({
      success: true,
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

export default router;