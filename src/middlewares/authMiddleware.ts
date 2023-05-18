import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

// Extend the Request type and create a new type
export interface AuthenticatedRequest extends Request {
  user?: IDecoded;
}

const authMiddleware = async (
  req: AuthenticatedRequest,
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
      req.user = decoded as IDecoded;
      next();
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export default authMiddleware;
