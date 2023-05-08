import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

// Extend the Request type and create a new type
export interface AuthenticatedRequest extends Request {
  user?: any; // Place your desired user type here
}

const authMiddleware = async (
  req: AuthenticatedRequest, // Use the new type
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid token" });
      }

      req.user = decoded;
      next();
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export default authMiddleware;
