import { Request, Response } from "express";
import cloudinary from "cloudinary";
import User from "../schemas/user.schema";
import Tweet from "../schemas/tweet.schema";

const tweetMediaOption = {
    use_filename: true,
    folder: "Twitter/Users/Avatar",
    allowed_formats: ["jpg", "png", "jpeg", "gif"],
    quality: "auto:eco",
};

// Count tweet actions
export const getTweetStats =async (req:Request, res:Response) => {
    try {
        const tweetId = req.params.tweetId;
        const replyCount = await Tweet.find({originalTweet: tweetId, tweetType: "reply"})
        .countDocuments();
        const retweetCount = await Tweet.find({originalTweet: tweetId, tweetType: "retweet"})
        .countDocuments();
        const quoteCount = await Tweet.find({originalTweet: tweetId, tweetType: "quote"})
        .countDocuments();
        res.status(200).json({replyCount, retweetCount, quoteCount});
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

//Get specific Tweet
export const getSpecificTweet = async (req: Request, res: Response) => {
    try {
        const tweet = await Tweet.findById(req.params.tweetId)
            .populate("author", "username displayName avatar isVerified")
            .populate({
                path: "originalTweet",
                populate: {
                    path: "author",
                    select: "username displayName avatar isVerified"
                }
            })

        if (!tweet) {
            res.status(404).json({ message: "Tweet not found" });
            return;
        }
        const view = tweet.view + 1;
        await Tweet.findByIdAndUpdate(req.params.tweetId, {view}, {new: true});
        res.status(200).json(tweet);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Get user Tweets
export const getUserTweets = async (req: Request, res: Response) => {
    try {
        const userId = await User.findOne({username: req.params.username}).select('_id');
        if (!userId) {
            res.status(404).json({ message: "User not found" });
            return;
        };
        await Tweet.find({ author: userId, tweetType: {$in: ["tweet", "quote", "retweet"]}})
            .populate("author", "username displayName avatar isVerified")
            .populate({
                path: "originalTweet",
                populate: {
                    path: "author",
                    select: "username displayName avatar isVerified"
                }
            })
            .sort({ createdAt: -1 })
            .then(tweets => {
                res.status(200).json(tweets);
            }
        );
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Get User Replies
export const getUserReplies = async (req:Request, res: Response) => {
    try {
        const userId = await User.findOne({username: req.params.username}).select('_id');
        if (!userId) {
            res.status(404).json({ message: "User not found" });
            return;
        };
        await Tweet.find({ author: userId, tweetType: "reply"})
            .populate("author", "username displayName avatar isVerified")
            .populate({
                path: "originalTweet",
                populate: {
                    path: "author",
                    select: "username displayName avatar isVerified"
                }
            })
            .sort({ createdAt: -1 })
            .then(tweets => {
                res.status(200).json(tweets);
            }
        );
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Get Tweet replies
export const getTweetReplies = async(req: Request, res:Response) => {
    try {
        await Tweet.find({ originalTweet: req.params.tweetId, tweetType: "reply" })
            .populate("author", "username displayName avatar")
            .sort({ createdAt: -1 })
            .then(replies => {
                res.status(200).json(replies);
            }
        );
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Get Tweet retweets
export const getTweetRetweets = async (req: Request, res: Response) => {
    try {
        await Tweet.find({ originalTweet: req.params.tweetId, tweetType: "retweet" })
            .populate("author", "username displayName avatar")
            .sort({ createdAt: -1 })
            .then(retweets => {
                res.status(200).json(retweets);
            }
        );
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Get Tweet Quotes
export const getTweetQuotes =async (req: Request, res: Response) => {
    try {
        await Tweet.find({ originalTweet: req.params.tweetId, tweetType: "quote" })
            .populate("author", "username displayName avatar")
            .sort({ createdAt: -1 })
            .then(quotes => {
                res.status(200).json(quotes);
            }
        );
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}