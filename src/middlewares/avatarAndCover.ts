import multer, { MulterError } from "multer";
import { RequestHandler } from "express";
import { Request as ExpressRequest } from "express";
import { useFileFilter } from "../hooks/useFileFilter";

export interface Request extends ExpressRequest {
  fileValidationError?: string;
}
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // Limit file size to 5MB
  },
  fileFilter: useFileFilter,
}).fields([
  { name: "avatar", maxCount: 1 },
  { name: "cover", maxCount: 1 },
  { name: "coverFile", maxCount: 1 },
]);

// Middleware for single image upload with size control
export const avatarAndCover: RequestHandler = (req: Request, res, next) => {
  upload(req, res, (err: any) => {
    if (err instanceof MulterError) {
      // A Multer error occurred when uploading.
      return res.status(400).json({ message: err.message });
    } else if (err) {
      // An unknown error occurred when uploading.
      return res.status(400).json({ message: err.message });
    } else if (req.fileValidationError) {
      // Check if file type error occurred and send error message
      return res.status(400).json({ message: req.fileValidationError });
    }
    // Everything went fine and continue with next middleware
    next();
  });
};
