import authMiddleware from "../middlewares/authMiddleware";
import express from "express";
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
  getUserFollowings,
  getUserFollowers,
  whoToFollow,
  getUserFollowingTweets,
  getUserBookmarks,
} from "../controllers/userController";
import { imageUploadMiddleware } from "../middlewares/imageUploadMiddleware";

// http://localhost:5000/user/
const userRoutes = express.Router();
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

userRoutes.post("/update-token", updateAccessToken);

userRoutes.post("/login", LoginUser);
userRoutes.post("/create-user", imageUploadMiddleware, createUser);

// update user with cover and avatar images
userRoutes.put(
  "/update-user/",
  authMiddleware,
  imageUploadMiddleware,
  updateUser
);

userRoutes.put("/follow-user/:userId", authMiddleware, followUser);
userRoutes.put("/unfollow-user/:userId", authMiddleware, UnFollowUser);

userRoutes.get("/username-available/:username", usernameIsAvailable);
userRoutes.get("/email-available/:email", emailIsAvailable);

userRoutes.get("/username-exist/:username", usernameExist);

userRoutes.get("/get-user/:username", getUser);
userRoutes.get("/search-user/:username", searchUser);
userRoutes.get("/who-to-follow", whoToFollow);

userRoutes.get("/get-user-followings/:username", getUserFollowings);
userRoutes.get("/get-user-followers/:username", getUserFollowers);

userRoutes.get("/get-user-following-tweets", authMiddleware, getUserFollowingTweets);


userRoutes.get("/get-user-tweets/:username", getUserTweets);
userRoutes.get("/get-user-replies/:username", getUserReplies);
userRoutes.get("/get-user-likes/:username", getUserLikes);
userRoutes.get("/get-user-media-only-tweets/:username", getMediaOnlyTweets);

userRoutes.get("/get-user-bookmarks", authMiddleware, getUserBookmarks);


export default userRoutes;
