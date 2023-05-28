import express from "express";
import multer from "multer";

import {
    getTweetReplies,
    getTweetRetweets,
    getTweetQuotes,
    getSpecificTweet,
    getTweetStats,
    likeTweet,
    unlikeTweet,
} from "../controllers/tweetControlleer"
import authMiddleware from "../middlewares/authMiddleware";

// http://localhost:5000/tweet/
const tweetRoutes = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

tweetRoutes.get("/get-tweet/:tweetId", getSpecificTweet);

tweetRoutes.get("/get-tweet-stats/:tweetId", getTweetStats);

tweetRoutes.get("/get-tweet-replies/:tweetId", getTweetReplies);
tweetRoutes.get("/get-tweet-retweets/:tweetId", getTweetRetweets);
tweetRoutes.get("/get-tweet-quotes/:tweetId", getTweetQuotes);

tweetRoutes.put("/like-tweet/:tweetId", authMiddleware, likeTweet);
tweetRoutes.put("/unlike-tweet/:tweetId", authMiddleware, unlikeTweet);


export default tweetRoutes;