import jwt from "jsonwebtoken"
import { Request, Response, NextFunction } from "express";

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const accessToken = req.headers.authorization?.split(" ")[1];
        if (!accessToken) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        };
        
        jwt.verify(accessToken, process.env.JWT_SECRET!, (err) => {
            if (err) {
                res.status(401).json({ message: "Token is not valid" });
                return;
            }else {
                next();
            }
        })
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export default authMiddleware;