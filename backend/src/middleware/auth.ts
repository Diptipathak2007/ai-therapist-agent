import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

// Extend Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    console.log("Auth middleware - token received:", token ? "yes" : "no");
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not set in environment variables");
      return res.status(500).json({ message: 'Server configuration error' });
    }

    console.log("Auth middleware - verifying token with secret length:", process.env.JWT_SECRET.length);
    
    // Use the SAME JWT_SECRET as in your controllers
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Auth middleware - token verified successfully:", decoded);
    
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    const jwtError = error as Error; // Type assertion
    if (jwtError.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid authentication token' });
    } else if (jwtError.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    }
    
    res.status(401).json({ message: 'Authentication failed' });
  }
};