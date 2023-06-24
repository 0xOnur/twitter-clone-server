import { Request, Response } from "express";
import { Types } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../schemas/user.schema";
import Tweet from "../schemas/tweet.schema";
import { generateToken, updateToken } from "./tokenController";
import { uploadFile, deleteFile } from "../services/aws";

// Extend the Request type and create a new type
export interface AuthenticatedRequest extends Request {
  user?: IDecoded;
  files?: any;
}

// Login User
export const LoginUser = async (req: Request, res: Response) => {
  try {
    console.log(req.body);

    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    const isPasswordCorrect = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!isPasswordCorrect) {
      res.status(401).json({ message: "Invalid password" });
      return;
    }
    const tokens = generateToken(user._id);
    res.status(200).json({ user, tokens });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Update accessToken
export const updateAccessToken = async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId;
    const refreshToken = req.headers["x-refresh-token"];

    if (!refreshToken) {
      return res.status(400).json({ message: "No refresh token provided" });
    }

    const decodedToken = jwt.verify(
      refreshToken as string,
      process.env.JWT_REFRESH_TOKEN_SECRET!
    ) as IDecoded;
    if (!decodedToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const userIdFromDB = await User.findById(userId).select("_id");

    if (!userIdFromDB) {
      return res.status(404).json({ message: "User not found" });
    }

    if (userIdFromDB._id.toString() === decodedToken._id) {
      const accessToken = updateToken(userId);
      return res.status(200).json(accessToken);
    } else {
      return res.status(401).json({ message: "Invalid compare" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Create a User
export const createUser = async (req: Request, res: Response) => {
  try {
    console.log(req.file);
    console.log(req.body);

    const emailRegex = /^\S+@\S+\.\S+$/;
    const isValid = emailRegex.test(req.body.email);
    if (!isValid) {
      res.status(400).json({ message: "Email is not valid" });
      return;
    }

    const user = new User({
      username: req.body.username,
      displayName: req.body.displayName,
      email: req.body.email,
      password: req.body.password,
      bio: req.body?.bio,
      isVerified: false,
      birthDay: {
        day: req.body?.birthDay?.day,
        month: req.body?.birthDay?.month,
        year: req.body?.birthDay?.year,
      },
    });

    await user.validate();

    if (req.file) {
      await uploadFile({
        file: req.file,
        folder: `Users/${user._id}`,
      }).then((res) => {
        user.avatar = res?.url;
      });
    }

    await user.save();
    const tokens = generateToken(user._id);
    res.status(201).json({ user, tokens });
  } catch (error: any) {
    if (error.name === "ValidationError") {
      res
        .status(400)
        .json({ message: "Validation Error", errors: error.errors });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

// Update User
export const updateUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    const newUserData = {
      cover: req.body.cover,
      avatar: req.body.avatar === "null" ? null : user.avatar,
      displayName: req.body?.displayName,
      username: req.body?.username,
      bio: req.body?.bio,
      location: req.body?.location,
      website: req.body?.website,
    };

    //delete old avatar from aws
    if ((req.body.avatar === "null" || req.files.avatar) && user.avatar) {
      //get path from url
      const path = user.avatar.split("/").slice(3).join("/");
      await deleteFile(path);
    }

    // delete old cover from aws
    if ((req.body.cover === "null" || req.files.cover) && user.cover) {
      //get path from url
      const path = user.cover.split("/").slice(3).join("/");
      await deleteFile(path);
    }

    if (req.files) {
      if (req.files.avatar) {
        const file: Express.Multer.File = req.files.avatar[0];
        await uploadFile({
          file: file,
          folder: `Users/${user._id}`,
        }).then((res) => {
          newUserData.avatar = res?.url;
        });
      }
      if (req.files.cover) {
        const file: Express.Multer.File = req.files.cover[0];
        await uploadFile({
          file: file,
          folder: `Users/${user._id}`,
        }).then((res) => {
          newUserData.cover = res?.url;
        });
      }
    }
    console.log(newUserData);

    await User.findByIdAndUpdate(req.user?._id, newUserData, { new: true });
    res.status(200).json({ message: "User updated" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get User
export const getUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select(
      "-password"
    );
    if (user) {
      const followers = await User.find({ following: { $in: [user._id] } })
        .select("_id")
      const userObject = user.toObject();
      userObject.followers = followers;
      res.status(200).json(userObject);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get User Followings
export const getUserFollowings = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({username: req.params.username})
    if (user) {
      const followings = await User.find({_id: {$in: user.following}})
      .select("username displayName avatar cover bio isVerified");
      res.status(200).json(followings);
    }else{
      res.status(404).json({message: "User not found"});
    }
  } catch (error:any) {
    res.status(500).json({ message: error.message });
  }
}

// Get User Followers
export const getUserFollowers =async (req:Request, res: Response) => {
  try {
    const user = await User.findOne({username: req.params.username})
    if (user) {
      const followings = await User.find({following: {$in: [user?._id]}})
      .select("username displayName avatar cover bio isVerified");
      res.status(200).json(followings);
    }else{
      res.status(404).json({message: "User not found"});
    }
  } catch (error:any) {
    res.status(500).json({ message: error.message });
  }
}

// Check username is Available
export const usernameIsAvailable = async (req: Request, res: Response) => {
  try {
    console.log(req.params);
    const user = await User.findOne({ username: req.params.username });
    if (user) {
      res.status(200).send(false);
    } else {
      res.status(200).send(true);
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Check email is Available with valid format
export const emailIsAvailable = async (req: Request, res: Response) => {
  try {
    console.log(req.params);
    const emailRegex = /^\S+@\S+\.\S+$/;
    const isValid = emailRegex.test(req.params.email);
    const user = await User.findOne({ email: req.params.email });
    if (user || !isValid) {
      res.status(200).send(false);
    } else {
      res.status(200).send(true);
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Check username exist
export const usernameExist = async (req: Request, res: Response) => {
  try {
    console.log(req.params);
    const user = await User.findOne({ username: req.params.username });
    if (user) {
      res.status(200).send(true);
    } else {
      res.status(200).send(false);
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Search User with username
export const searchUser = async (req: Request, res: Response) => {
  try {
    const regex = new RegExp(req.params.username, "i");
    await User.find({ username: { $regex: regex } })
      .limit(10)
      .then((searchResult) => {
        res.status(200).json(searchResult);
      });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// This controller function suggests new users to follow, 
// sorted by their creation date, and paginated using limit and page query parameters
export const whoToFollow = async (req: Request, res: Response) => {
  try {
    // Get the page number and limit from the request, or set default values
    const page = parseInt(req.query.page as string) || 1;
    const perPage = parseInt(req.query.limit as string) || 10;

    // Calculate the number of documents to skip based on the page number
    let skip = (page - 1) * perPage;
    let limit = perPage;

    // Find the total number of user documents in the database
    const totalItems = await User.countDocuments();

    // Calculate the total number of pages
    const totalPages = Math.ceil(totalItems / limit);

    // Find the users for the current page, 
    // selecting specific fields and sorting by creation date
    const users = await User.find()
      .select("username displayName avatar cover bio isVerified")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Construct the response object
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
    // Catch and handle any errors
    res.status(500).json({ message: error.message });
  }
};

// Follow User
export const followUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.following.includes(new Types.ObjectId(req.params.userId))) {
      return res.status(200).json({ message: "Already followed" });
    }

    await User.findByIdAndUpdate(user._id, {
      $push: { following: req.params.userId },
    }).then(() => {
      res.status(200).json({ message: "Followed" });
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// UnFollowUser User
export const UnFollowUser = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.following.includes(new Types.ObjectId(req.params.userId))) {
      await User.findByIdAndUpdate(user._id, {
        $pull: { following: req.params.userId },
      }).then(() => {
        res.status(200).json({ message: "Unfollowed" });
      });
    } else {
      res.status(200).json({ message: "Already unfollowed" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get user Tweets
export const getUserTweets = async (req: Request, res: Response) => {
  try {
    const userId = await User.findOne({ username: req.params.username }).select(
      "_id"
    );
    if (!userId) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    await Tweet.find({
      author: userId,
      tweetType: { $in: ["tweet", "quote", "retweet"] },
    })
      .sort({ createdAt: -1 })
      .select("_id")
      .then((tweets) => {
        res.status(200).json(tweets);
      });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get User Following Tweets
export const getUserFollowingTweets = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const user = await User.findById(userId);

    // Get the page and limit parameters from the request, or set default values
    const page = parseInt(req.query.page as string) || 1;
    const perPage = parseInt(req.query.limit as string) || 10;

    // Calculate the number of documents to skip
    let skip = (page - 1) * perPage;
    let limit = perPage;

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    const following = user?.following;
    following.push(new Types.ObjectId(userId))
    
    const tweets = await Tweet.find(
      { author: { $in: following } })
      .populate("author", "username displayName avatar isVerified")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Find the total number of user documents in the database
    const totalItems = await Tweet.countDocuments({ author: { $in: following } });

    // Calculate the total number of pages
    const totalPages = Math.ceil(totalItems / limit);

    // Construct the response object
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
    res.status(500).json({ message: error.message });
  }
};

// Get Media only User Tweets
export const getMediaOnlyTweets = async (req: Request, res: Response) => {
  try {
    const userId = await User.findOne({ username: req.params.username }).select(
      "_id"
    );
    if (!userId) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    await Tweet.find({ author: userId, media: { $exists: true, $ne: [] } })
      .sort({ createdAt: -1 })
      .select("_id")
      .then((tweets) => {
        res.status(200).json(tweets);
      });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get User Replies
export const getUserReplies = async (req: Request, res: Response) => {
  try {
    const userId = await User.findOne({ username: req.params.username }).select(
      "_id"
    );
    if (!userId) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    await Tweet.find({ author: userId, tweetType: "reply" })
      .sort({ createdAt: -1 })
      .select("_id")
      .then((tweets) => {
        res.status(200).json(tweets);
      });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get User Liked Tweets
export const getUserLikes = async (req: Request, res: Response) => {
  try {
    const userId = await User.findOne({ username: req.params.username }).select(
      "_id"
    );
    if (!userId) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    await Tweet.find({ likes: { $in: [userId] } })
      .sort({ createdAt: -1 })
      .select("_id")
      .then((tweets) => {
        res.status(200).json(tweets);
      });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
