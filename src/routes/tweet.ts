import express from "express";
import multer from "multer";

import {
    getTweetReplies,
    getTweetQuotes,
    getSpecificTweet,
    getTweetStats,
    likeTweet,
    unlikeTweet,
    getTweetAuthor,
    getPopularTweets,
    retweetTweet,
    undoRetweet,
    addBookmark,
    removeBookmark,
    getRetweeters,
    getLikers,
} from "../controllers/tweetControlleer"
import authMiddleware from "../middlewares/authMiddleware";

// http://localhost:5000/tweet/
const tweetRoutes = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

tweetRoutes.get("/get-tweet/:tweetId", getSpecificTweet);
tweetRoutes.get("/get-popular-tweets", getPopularTweets);

tweetRoutes.get("/get-tweet-stats/:tweetId", getTweetStats);
tweetRoutes.get("/get-tweet-author/:tweetId", getTweetAuthor);

tweetRoutes.get("/get-tweet-retweeters/:tweetId", getRetweeters);
tweetRoutes.get("/get-tweet-likers/:tweetId", getLikers);


tweetRoutes.get("/get-tweet-replies/:tweetId", getTweetReplies);
tweetRoutes.get("/get-tweet-quotes/:tweetId", getTweetQuotes);

tweetRoutes.put("/like-tweet/:tweetId", authMiddleware, likeTweet);
tweetRoutes.put("/unlike-tweet/:tweetId", authMiddleware, unlikeTweet);

tweetRoutes.put("/retweet-tweet/:tweetId", authMiddleware, retweetTweet);
tweetRoutes.put("/undo-retweet/:tweetId", authMiddleware, undoRetweet);

tweetRoutes.put("/add-bookmark/:tweetId", authMiddleware, addBookmark);
tweetRoutes.put("/remove-bookmark/:tweetId", authMiddleware, removeBookmark);


export default tweetRoutes;