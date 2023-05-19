import express from "express";
import multer from "multer";

import {
    getTweetReplies,
    getTweetRetweets,
    getTweetQuotes,
    getSpecificTweet,
    getTweetStats,
} from "../controllers/tweetControlleer"

// http://localhost:5000/tweet/
const tweetRoutes = express.Router();
const upload = multer({storage: multer.diskStorage({})});

tweetRoutes.get("/get-tweet/:tweetId", getSpecificTweet);

tweetRoutes.get("/get-tweet-stats/:tweetId", getTweetStats);

tweetRoutes.get("/get-tweet-replies/:tweetId", getTweetReplies);
tweetRoutes.get("/get-tweet-retweets/:tweetId", getTweetRetweets);
tweetRoutes.get("/get-tweet-quotes/:tweetId", getTweetQuotes);


export default tweetRoutes;