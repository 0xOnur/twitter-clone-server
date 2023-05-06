import express from "express";
import multer from "multer";
import {
    LogoutUser,
    createUser,
    usernameIsAvailable,
    emailIsAvailable
} from "../controllers/userController";
import authMiddleware from "../middlewares/authMiddleware";

const userRoutes = express.Router();
const upload = multer({storage: multer.diskStorage({})});

userRoutes.post("/create-user", upload.single('avatar'), createUser);
userRoutes.post("/logout", LogoutUser);
userRoutes.get("/check-username/:username", usernameIsAvailable);
userRoutes.get("/check-email/:email", emailIsAvailable);

export default userRoutes;