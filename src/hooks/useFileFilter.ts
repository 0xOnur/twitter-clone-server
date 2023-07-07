import multer from "multer";
import { Request as ExpressRequest } from "express";

export interface Request extends ExpressRequest {
    fileValidationError?: string;
}

export const useFileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb:  multer.FileFilterCallback
) => {
    if(
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/gif' ||
        file.mimetype === 'video/mp4'
    ){
        // Accept File
        cb(null, true)
    }else {
        // Reject File
        req.fileValidationError = 'Only .png, .jpg, .jpeg and .mp4 format allowed!';
        cb(null, false);
    }
};
