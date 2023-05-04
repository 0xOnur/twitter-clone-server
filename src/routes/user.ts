import express from "express";
import multer from "multer";
import {
    createUser,
    usernameIsAvailable,
    emailIsAvailable
} from "../controllers/userController";

const userRoutes = express.Router();
const upload = multer({storage: multer.diskStorage({})});

userRoutes.post("/create-user", upload.single('avatar'), createUser);
userRoutes.get("/check-username/:username", usernameIsAvailable);
userRoutes.get("/check-email/:email", emailIsAvailable);

export default userRoutes;