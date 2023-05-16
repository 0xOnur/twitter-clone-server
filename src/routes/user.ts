import express from "express";
import multer from "multer";
import {
    updateAccessToken,
    LoginUser,
    createUser,
    usernameIsAvailable,
    emailIsAvailable,
    usernameExist,
    getUser,
    searchUser,
} from "../controllers/userController";
import authMiddleware, { AuthenticatedRequest } from "../middlewares/authMiddleware";

const userRoutes = express.Router();
const upload = multer({storage: multer.diskStorage({})});

userRoutes.post("/update-token", updateAccessToken)

userRoutes.post("/login", LoginUser);
userRoutes.post("/create-user", upload.single('avatar'), createUser);

userRoutes.get("/username-available/:username", usernameIsAvailable);
userRoutes.get("/email-available/:email", emailIsAvailable);

userRoutes.get("/username-exist/:username", usernameExist);

userRoutes.get("/get-user/:username", getUser);
userRoutes.get("/search-user/:username", searchUser);



userRoutes.get("/me", authMiddleware, (req: AuthenticatedRequest, res) => {
    res.status(200).json(req.user);
});

export default userRoutes;