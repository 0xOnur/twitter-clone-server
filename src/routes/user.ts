import express from "express";
import multer from "multer";
import {
    LoginUser,
    LogoutUser,
    createUser,
    usernameIsAvailable,
    emailIsAvailable,
    usernameExist
} from "../controllers/userController";
import authMiddleware from "../middlewares/authMiddleware";

const userRoutes = express.Router();
const upload = multer({storage: multer.diskStorage({})});


userRoutes.post("/login", LoginUser);
userRoutes.post("/logout", LogoutUser);
userRoutes.post("/create-user", upload.single('avatar'), createUser);
userRoutes.get("/username-available/:username", usernameIsAvailable);
userRoutes.get("/email-available/:email", emailIsAvailable);
userRoutes.get("/username-exist/:username", usernameExist);

export default userRoutes;