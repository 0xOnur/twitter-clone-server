import { Request, Response } from "express";
import { AuthenticatedRequest } from "./userController";
import { Types } from "mongoose";
import Tweet from "../schemas/tweet.schema";
import { createPoll } from "./pollController";
import { uploadFile } from "../services/aws";

// Count tweet actions
export const getTweetStats = async (req: Request, res: Response) => {
  try {
    const tweetId = req.params.tweetId;
    
    const replyStats = await Tweet.find({
      originalTweet: tweetId,
      tweetType: "reply",
    }).select("author");
    
    const retweetStats = await Tweet.find({
      originalTweet: tweetId,
      tweetType: "retweet",
    }).select("author");

    const likeStats = await Tweet.find({
      originalTweet: tweetId,
      tweetType: "like",
    }).select("author");

    const quoteStats = await Tweet.find({
      originalTweet: tweetId,
      tweetType: "quote",
    }).select("author");
    
    res.status(200).json({ replyStats, retweetStats, likeStats, quoteStats });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

//Get specific Tweet
export const getSpecificTweet = async (req: Request, res: Response) => {
  try {
    const tweet = await Tweet.findById(req.params.tweetId).populate(
      "author",
      "username displayName avatar isVerified"
    );

    if (!tweet) {
      res.status(404).json({ message: "Tweet not found" });
      return;
    }
    const view = tweet.view + 1;
    await Tweet.findByIdAndUpdate(req.params.tweetId, { view }, { new: true });
    res.status(200).json(tweet);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get Popular Tweets
export const getPopularTweets = async (req: Request, res: Response) => {
  try {
    // Define a date for one month ago
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    // Get the page and limit parameters from the request, or set default values
    const page = parseInt(req.query.page as string) || 1;
    const perPage = parseInt(req.query.limit as string) || 10;

    // Calculate the number of documents to skip
    let skip = (page - 1) * perPage;
    let limit = perPage;

    // Get the total number of tweets from the past month
    const totalItemsArray = await Tweet.aggregate([
      { $match: { createdAt: { $gte: oneMonthAgo } } },
      { $count: "totalItems" },
    ]);

    // Extract the total items count from the returned array, or default to 0
    const totalItems = totalItemsArray[0]?.totalItems || 0;

    // Calculate the total number of pages
    const totalPages = Math.ceil(totalItems / limit);

    // Query to get the tweets, their interactions, and author details
    const tweets = await Tweet.aggregate([
      { $match: { createdAt: { $gte: oneMonthAgo } } }, // Filter by creation date
      //get the just this types tweets: tweet, reply, quote
      { $match: { tweetType: { $in: ["tweet", "reply", "quote"] } } },

      {
        // Look up interactions for each tweet
        $lookup: {
          from: "tweets",
          let: { originalTweetId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$originalTweet", "$$originalTweetId"] },
              },
            },
            { $count: "count" }, // Count the interactions
          ],
          as: "interactions",
        },
      },
      {
        // Unwind the interactions array
        $unwind: {
          path: "$interactions",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        // Add the total interactions to the tweet document
        $addFields: {
          totalInteractions: {
            $add: [
              "$view",
              { $ifNull: ["$interactions.count", 0] },
            ],
          },
        },
      },
      {
        // Look up the author details
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author",
        },
      },
      {
        // Unwind the author array
        $unwind: "$author",
      },
      {
        // Exclude certain fields from the author details
        $project: {
          "author._id": 0,
          "author.password": 0,
          "author.email": 0,
          "author.birthDay": 0,
          "author.following": 0,
          "author.website": 0,
          "author.location": 0,
          "author.createdAt": 0,
          "author.updatedAt": 0,
          "author.__v": 0,
        },
      },
      {
        // Sort by total interactions
        $sort: { totalInteractions: -1 },
      },
      { $skip: skip }, // Skip the required number of documents
      { $limit: limit }, // Limit the number of documents returned
    ]);

    // Construct the response
    const response = {
      page: page,
      perPage: limit,
      totalItems: totalItems,
      totalPages: totalPages,
      data: tweets,
    };

    // Send the response
    res.status(200).json(response);
  } catch (error: any) {
    // Catch and handle any errors
    res.status(500).json({ message: error.message });
  }
};

//Get specific Tweet Author
export const getTweetAuthor = async (req: Request, res: Response) => {
  try {
    const author = await Tweet.findById(req.params.tweetId)
      .populate("author", "username displayName avatar isVerified")
      .select("author");

    if (!author) {
      res.status(404).json({ message: "Tweet not found" });
      return;
    }
    res.status(200).json(author.author);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get Tweet replies
export const getTweetReplies = async (req: Request, res: Response) => {
  try {
    const tweetId = req.params.tweetId;

    // Get the page and limit parameters from the request, or set default values
    const page = parseInt(req.query.page as string) || 1;
    const perPage = parseInt(req.query.limit as string) || 10;

     // Calculate the number of documents to skip
     let skip = (page - 1) * perPage;
     let limit = perPage;
 
     const tweet = await Tweet.findById(tweetId);

     if (!tweet) {
      res.status(404).json({ message: "Tweet not found" });
      return;
    }
     
     const replies = await Tweet.find({ originalTweet: tweetId, tweetType: "reply" })
     .select("_id")
     .sort({ createdAt: -1 })
     .skip(skip)
     .limit(limit)
     .lean();

      // Find the total number of user documents in the database
      const totalItems = await Tweet.countDocuments({originalTweet: tweetId, tweetType: "reply"});
      const totalPages = Math.ceil(totalItems / limit);

      // Construct the response
      const response = {
        page: page,
        perPage: limit,
        totalItems: totalItems,
        totalPages: totalPages,
        data: replies,
      };

      // Send the response
      res.status(200).json(response);

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get Tweet Quotes
export const getTweetQuotes = async (req: Request, res: Response) => {
  try {
    const tweetId = req.params.tweetId;

    // Get the page and limit parameters from the request, or set default values
    const page = parseInt(req.query.page as string) || 1;
    const perPage = parseInt(req.query.limit as string) || 10;

    // Calculate the number of documents to skip
    let skip = (page - 1) * perPage;
    let limit = perPage;

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
      res.status(404).json({ message: "Tweet not found" });
      return;
    }

    const quotes = await Tweet.find({ originalTweet: tweetId, tweetType: "quote" })
      .select("_id")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Find the total number of user documents in the database
    const totalItems = await Tweet.countDocuments({ originalTweet: tweetId, tweetType: "quote" })
    const totalPages = Math.ceil(totalItems / limit);

    // Construct the response
    const response = {
      page: page,
      perPage: limit,
      totalItems: totalItems,
      totalPages: totalPages,
      data: quotes,
    };

    // Send the response
    res.status(200).json(response);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Like Tweet
export const likeTweet = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const tweetId = req.params.tweetId;
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
      res.status(404).json({ message: "Tweet not found" });
      return;
    }

    const isLiked = await Tweet.find({author: userId, tweetType: "like", originalTweet: tweetId});
    if (isLiked.length > 0) {
      res.status(400).json({ message: "You already liked this tweet" });
      return;
    }

    const like = new Tweet({
      author: userId,
      originalTweet: tweetId,
      tweetType: "like",
      whoCanReply: "everyone",
      audience: "everyone",
    });

    await like.save();

    res.status(200).json({ message: "Tweet liked" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Unlike Tweet
export const unlikeTweet = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const tweetId = req.params.tweetId;
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
      res.status(404).json({ message: "Tweet not found" });
      return;
    }
    const isLiked = await Tweet.find({author: userId, tweetType: "like", originalTweet: tweetId});

    if (isLiked.length === 0) {
      res.status(400).json({ message: "You didn't like this tweet" });
      return;
    }

    await Tweet.deleteOne({author: userId, tweetType: "like", originalTweet: tweetId})
    res.status(200).json({ message: "Tweet unliked" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Retweet Tweet
export const retweetTweet =async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const tweetId = req.params.tweetId;
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
      res.status(404).json({ message: "Tweet not found" });
      return;
    }
    // Check if the user has already retweeted this tweet.
    const isRetweeted = await Tweet.find({author: userId, tweetType: "retweet", originalTweet: tweetId})
    if (isRetweeted.length > 0) {
      res.status(400).json({ message: "You already retweeted this tweet" });
      return;
    }
    const retweet = new Tweet({
      author:userId,
      originalTweet: tweetId,
      tweetType: "retweet",
      whoCanReply: "everyone",
      audience: "everyone",
    })
    await retweet.save();
    res.status(200).json({ message: "Tweet retweeted" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Undo Retweet
export const undoRetweet = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const tweetId = req.params.tweetId;
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
      res.status(404).json({ message: "Tweet not found" });
      return;
    }
    // Check if the user has already retweeted this tweet.
    const isRetweeted = await Tweet.find({author: userId, tweetType: "retweet", originalTweet: tweetId})
    if (isRetweeted.length === 0) {
      res.status(400).json({ message: "You didn't retweet this tweet" });
      return;
    }
    await Tweet.deleteOne({author: userId, tweetType: "retweet", originalTweet: tweetId})
    res.status(200).json({ message: "Tweet unretweeted" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Add Bookmark
export const addBookmark = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const tweetId = req.params.tweetId;

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
      res.status(404).json({ message: "Tweet not found" });
      return;
    }
    // Check if the user has already added bookmark field this tweet.
    const isBookmarked = tweet.bookmarks?.includes(new Types.ObjectId(userId));
    if (isBookmarked) {
      res.status(400).json({ message: "You already bookmarked this tweet" });
      return;
    }
    await Tweet.findByIdAndUpdate(tweetId,
      { $push: { bookmarks: userId } },
      { new: true }
    );

    res.status(200).json({ message: "Tweet added to your Bookmarks" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Remove Bookmark
export const removeBookmark = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const tweetId = req.params.tweetId;

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
      res.status(404).json({ message: "Tweet not found" });
      return;
    }
    // Check if the user has already added bookmark field this tweet.
    const isBookmarked = tweet.bookmarks?.includes(new Types.ObjectId(userId));
    if (!isBookmarked) {
      res.status(400).json({ message: "You didn't bookmark this tweet" });
      return;
    }
    await Tweet.findByIdAndUpdate(tweetId,
      { $pull: { bookmarks: userId } },
      { new: true }
    );
    res.status(200).json({ message: "Tweet removed from your Bookmarks" })
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get users who retweeted the tweet
export const getRetweeters = async (req: Request, res: Response) => {
  try {
    const tweetId = req.params.tweetId;

    // Get the page and limit parameters from the request, or set default values
    const page = parseInt(req.query.page as string) || 1;
    const perPage = parseInt(req.query.limit as string) || 10;

    // Calculate the number of documents to skip
    let skip = (page - 1) * perPage;
    let limit = perPage;

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
      res.status(404).json({ message: "Tweet not found" });
      return;
    }

    const retweeters = await Tweet.find({
      originalTweet: tweetId,
      tweetType: "retweet",
    })
      .sort({ createdAt: -1 })
      .populate("author", "username displayName avatar cover isVerified")
      .select("author")
      .skip(skip)
      .limit(limit);
    
    const users = retweeters.map(tweet => tweet.author);
    
    // Find the total number of user documents in the database
    const totalItems = await Tweet.countDocuments({ originalTweet: tweetId, tweetType: "retweet" });
    const totalPages = Math.ceil(totalItems / limit);

    // Construct the response
    const response = {
      page: page,
      perPage: limit,
      totalItems: totalItems,
      totalPages: totalPages,
      data: users,
    };

    // Send the response
    res.status(200).json(response);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get users who liked the tweet
export const getLikers = async (req: Request, res: Response) => {
  try {
    const tweetId = req.params.tweetId;

    // Get the page and limit parameters from the request, or set default values
    const page = parseInt(req.query.page as string) || 1;
    const perPage = parseInt(req.query.limit as string) || 10;

    // Calculate the number of documents to skip
    let skip = (page - 1) * perPage;
    let limit = perPage;

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
      res.status(404).json({ message: "Tweet not found" });
      return;
    }

    const likers = await Tweet.find({
      originalTweet: tweetId,
      tweetType: "like",
    })
      .sort({ createdAt: -1 })
      .populate("author", "username displayName avatar cover isVerified")
      .select("author")
      .skip(skip)
      .limit(limit);

      const users = likers.map(tweet => tweet.author);

    // Find the total number of user documents in the database
    const totalItems = await Tweet.countDocuments({ originalTweet: tweetId, tweetType: "like" });
    const totalPages = Math.ceil(totalItems / limit);

    // Construct the response
    const response = {
      page: page,
      perPage: limit,
      totalItems: totalItems,
      totalPages: totalPages,
      data: users,
    };

    // Send the response
    res.status(200).json(response);
  }catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Create Tweet
export const createTweet =async (req:AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    // check the poll
    if (req.body.poll) {
      const pollData = JSON.parse(req.body.poll);

      const poll = await createPoll(userId!, pollData);
      req.body.poll = poll._id;
    }

    //check the gif
    if (req.body.tenorMedia) {
      const tenorMedia = JSON.parse(req.body.tenorMedia);
      req.body.media = tenorMedia;
    }

    const tweetData = {
      author :userId,
      audience: req.body.audience || "everyone",
      whoCanReply: req.body.whoCanReply || "everyone",
      content: req.body?.content,
      media: req.body?.media,
      pollId: req.body?.poll,
      tweetType: req.body.tweetType,
      originalTweet: req.body?.originalTweet
    };

    const tweet = new Tweet(tweetData);

    if(req.files) {
      await Promise.all(
        req.files.map(async (file: Express.Multer.File, index: number) => {
          console.log(file);
          await uploadFile({
            file: file,
            folder: `Tweets/${tweet._id}`
          }).then((res) => {
            console.log("🚀 ~ file: tweetControlleer.ts:596 ~ req.files.map ~ res:", res)
            tweet.media?.push({
              url: res?.url!,
              alt: undefined,
              type: file.mimetype,
            })
          });
        })
      );
    }
    console.log(tweet);
    console.log(req.body);
    await tweet.save();
    res.status(200).json({ message: "Tweet created" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}