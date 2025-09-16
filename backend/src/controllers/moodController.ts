import { Request, Response } from "express";
import { Mood } from "../models/Mood";

export const createMood = async (req: Request, res: Response) => {
  try {
    console.log("=== MOOD CREATION DEBUG ===");
    console.log("Received mood submission:", req.body);
    console.log("User from auth middleware:", req.user);
    console.log("User ID available as:", {
      "req.user.userId": req.user?.userId,
      "req.user._id": req.user?._id,
      "req.user.id": req.user?.id
    });

    const { score, note } = req.body;

    // Validate score
    if (score === undefined || score === null) {
      console.log("❌ Score is missing");
      return res.status(400).json({ message: "Score is required" });
    }

    if (typeof score !== 'number' || score < 0 || score > 100) {
      console.log("❌ Invalid score:", score);
      return res.status(400).json({ message: "Invalid mood score" });
    }

    // Get userId from the correct property
    const userId = req.user?.userId || req.user?._id;
    
    if (!userId) {
      console.log("❌ No user ID found in token");
      return res.status(401).json({ message: "User not authenticated" });
    }

    console.log("✅ Creating mood with userId:", userId);

    const newMood = new Mood({
      userId: userId,  // ✅ Fixed: Use the correct property
      score,
      note: note || undefined,
    });

    console.log("Mood object before save:", newMood.toObject());

    const savedMood = await newMood.save();
    console.log("✅ Mood saved successfully:", {
      id: savedMood._id,
      userId: savedMood.userId,
      score: savedMood.score,
      timestamp: savedMood.timestamp
    });

    res.status(201).json({ 
      success: true, 
      data: savedMood,
      message: "Mood saved successfully"
    });

  } catch (error) {
    console.error("❌ Error saving mood:", error);
    
    // Provide more detailed error information
    let errorMessage = "Failed to save mood";
    
    if ((error as any).name === 'ValidationError') {
      const validationErrors = Object.values((error as any).errors).map((err: any) => err.message);
      errorMessage = `Validation error: ${validationErrors.join(', ')}`;
    } else if ((error as any).code === 11000) {
      errorMessage = "Duplicate entry error";
    } else if ((error as any).message) {
      errorMessage = (error as any).message;
    }
    
    res.status(500).json({ 
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? (error as any).message : undefined
    });
  }
};

// Add a test function to debug the user data
export const testMoodEndpoint = async (req: Request, res: Response) => {
  try {
    console.log("=== MOOD TEST ENDPOINT ===");
    console.log("User data:", req.user);
    
    res.json({
      message: "Mood test endpoint working",
      user: req.user,
      availableProperties: Object.keys(req.user || {}),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Test endpoint error:", error);
    res.status(500).json({ message: "Test failed", error: (error as any).message });
  }
};