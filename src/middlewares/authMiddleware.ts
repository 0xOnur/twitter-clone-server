import { IAuthenticateRequest } from "../types/IAuthenticateRequest";
import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const authMiddleware = async (
  req: IAuthenticateRequest,
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
