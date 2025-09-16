import { Request, Response } from "express";
import { User } from "../models/User";
import { Session } from "../models/Session";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req: Request, res: Response) => {
  try {
    console.log("Register request received:", req.body);
    
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required." });
    }

    // Check if user exists
    console.log("Checking if user exists:", email);
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User already exists:", email);
      return res.status(409).json({ message: "Email already in use." });
    }

    // Hash password
    console.log("Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    console.log("Creating new user...");
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    console.log("User created successfully:", user._id);

    // Check JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not set in environment variables");
      return res.status(500).json({ message: "Server configuration error" });
    }

    // Generate JWT token - NO FALLBACK
    console.log("Generating JWT with secret length:", process.env.JWT_SECRET.length);
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email 
      },
      process.env.JWT_SECRET, // No fallback - use only env variable
      { expiresIn: "24h" }
    );

    // Create session
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const session = new Session({
      userId: user._id,
      token,
      expiresAt,
      deviceInfo: req.headers["user-agent"],
    });
    await session.save();
    console.log("Session created for new user");

    // Respond with user data AND token
    res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
      message: "User registered successfully.",
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    console.log("Login request received:", req.body);
    
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    // Find user
    console.log("Finding user:", email);
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found:", email);
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Verify password
    console.log("Verifying password...");
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log("Invalid password for user:", email);
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Check JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not set in environment variables");
      return res.status(500).json({ message: "Server configuration error" });
    }

    // Generate JWT token - NO FALLBACK
    console.log("Generating JWT with secret length:", process.env.JWT_SECRET.length);
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email 
      },
      process.env.JWT_SECRET, // No fallback - use only env variable
      { expiresIn: "24h" }
    );

    // Create session
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const session = new Session({
      userId: user._id,
      token,
      expiresAt,
      deviceInfo: req.headers["user-agent"],
    });
    await session.save();
    console.log("Login successful for user:", user._id);

    // Respond with user data and token
    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (token) {
      await Session.deleteOne({ token });
      console.log("Session deleted for token");
    }
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};