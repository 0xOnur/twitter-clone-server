import { Request, Response } from "express";
import Tweet from "../schemas/tweet.schema";
import { AuthenticatedRequest } from "./userController";
import { Types } from "mongoose";

// Count tweet actions
export const getTweetStats =async (req:Request, res:Response) => {
    try {
        const tweetId = req.params.tweetId;
        const replyStats = await Tweet.find({originalTweet: tweetId, tweetType: "reply"})
        .select("author");
        const retweetStats = await Tweet.find({originalTweet: tweetId, tweetType: "retweet"})
        .select("author");
        const quoteStats = await Tweet.find({originalTweet: tweetId, tweetType: "quote"})
        .select("author");
        res.status(200).json({replyStats, retweetStats, quoteStats});
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

// Get Tweet replies
export const getTweetReplies = async(req: Request, res:Response) => {
    try {
        await Tweet.find({ originalTweet: req.params.tweetId, tweetType: "reply" })
            .populate("author", "username displayName avatar isVerified")
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
            .populate("author", "username displayName avatar isVerified")
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
            .populate("author", "username displayName avatar isVerified")
            .sort({ createdAt: -1 })
            .then(quotes => {
                res.status(200).json(quotes);
            }
        );
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Like Tweet
export const likeTweet = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const tweet = await Tweet.findById(req.params.tweetId);
        if (!tweet) {
            res.status(404).json({ message: "Tweet not found" });
            return;
        }
        if (tweet.likes?.includes(new Types.ObjectId(req.user?._id))) {
            res.status(400).json({ message: "You already liked this tweet" });
            return;
        }
        await Tweet.findByIdAndUpdate(req.params.tweetId, { $push: { likes: req.user?._id } }, { new: true });
        res.status(200).json({ message: "Tweet liked" });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Unlike Tweet
export const unlikeTweet = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const tweet = await Tweet.findById(req.params.tweetId);
        if (!tweet) {
            res.status(404).json({ message: "Tweet not found" });
            return;
        }
        if (!tweet.likes?.includes(new Types.ObjectId(req.user?._id))) {
            res.status(400).json({ message: "You didn't like this tweet" });
            return;
        }
        await Tweet.findByIdAndUpdate(req.params.tweetId, { $pull: { likes: req.user?._id } }, { new: true });
        res.status(200).json({ message: "Tweet unliked" });
    } catch (error) {
        
    }
};