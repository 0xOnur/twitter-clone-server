import express from "express";
import multer from "multer";
import {
  updateAccessToken,
  LoginUser,
  createUser,
  updateUser,
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
import authMiddleware, {
  AuthenticatedRequest,
} from "../middlewares/authMiddleware";

// http://localhost:5000/user/
const userRoutes = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

userRoutes.post("/update-token", updateAccessToken);

userRoutes.post("/login", LoginUser);
userRoutes.post("/create-user", upload.single("avatar"), createUser);

// update user with cover and avatar images
userRoutes.put(
  "/update-user/",
  authMiddleware,
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  updateUser
);

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
