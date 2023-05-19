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
    followUser,
    UnFollowUser,
    getMediaOnlyTweets,
    getUserTweets,
    getUserReplies,
    getUserLikes,
} from "../controllers/userController";
import authMiddleware, { AuthenticatedRequest } from "../middlewares/authMiddleware";


// http://localhost:5000/user/
const userRoutes = express.Router();
const upload = multer({storage: multer.diskStorage({})});

userRoutes.post("/update-token", updateAccessToken)

userRoutes.post("/login", LoginUser);
userRoutes.post("/create-user", upload.single('avatar'), createUser);

userRoutes.put("/follow-user/:userId", authMiddleware, followUser);
userRoutes.put("/unfollow-user/:userId", authMiddleware, UnFollowUser);

userRoutes.get("/username-available/:username", usernameIsAvailable);
userRoutes.get("/email-available/:email", emailIsAvailable);

userRoutes.get("/username-exist/:username", usernameExist);

userRoutes.get("/get-user/:username", getUser);
userRoutes.get("/search-user/:username", searchUser);

userRoutes.get("/get-user-tweets/:username", getUserTweets);
userRoutes.get("/get-user-replies/:username", getUserReplies);
userRoutes.get("/get-user-likes/:username", getUserLikes);
userRoutes.get("/get-user-media-only-tweets/:username", getMediaOnlyTweets);



userRoutes.get("/me", authMiddleware, (req: AuthenticatedRequest, res) => {
    res.status(200).json(req.user);
});

export default userRoutes;