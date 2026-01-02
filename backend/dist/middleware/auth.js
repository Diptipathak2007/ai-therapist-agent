"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth = (req, res, next) => {
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
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        console.log("Auth middleware - token verified successfully:", decoded);
        req.user = decoded;
        next();
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        const jwtError = error; // Type assertion
        if (jwtError.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid authentication token' });
        }
        else if (jwtError.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token has expired' });
        }
        res.status(401).json({ message: 'Authentication failed' });
    }
};
exports.auth = auth;
//# sourceMappingURL=auth.js.map