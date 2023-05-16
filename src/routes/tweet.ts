import express from "express";
import multer from "multer";

import {
    getUserTweets,
    getTweetReplies,
    getTweetRetweets,
    getTweetQuotes,
    getTweet,
    getTweetStats,
} from "../controllers/tweetControlleer"

const tweetRoutes = express.Router();
const upload = multer({storage: multer.diskStorage({})});

tweetRoutes.get("/get-tweet/:tweetId", getTweet);
tweetRoutes.get("/get-tweet-stats/:tweetId", getTweetStats)
tweetRoutes.get("/get-user-tweets/:username", getUserTweets);

tweetRoutes.get("/get-tweet-replies/:tweetId", getTweetReplies);
tweetRoutes.get("/get-tweet-retweets/:tweetId", getTweetRetweets);
tweetRoutes.get("/get-tweet-quotes/:tweetId", getTweetQuotes);


export default tweetRoutes;