import mongoose, { Schema, Document } from "mongoose";

interface IMedia {
  url: string;
  alt: string;
  type: "image" | "gif" | "video";
}

export interface ITweet extends Document {
  author: string;
  audience: "everyone" | "followers" | "specificUsers";
  whoCanReply: "everyone" | "following" | "mentioned";
  content: string;
  media: IMedia[];
  likes: string[];
  originalTweet: string;
  tweetType: "tweet" | "reply" | "retweet" | "quote";
  createdAt: Date;
  updatedAt: Date;
}

const TweetSchema: Schema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    audience: {
      type: String,
      required: true,
      enum: ["everyone", "followers", "specificUsers"],
    },
    whoCanReply: {
      type: String,
      required: true,
      enum: ["everyone", "following", "mentioned"],
    },
    content: {
      type: String,
      maxLength: 280,
    },
    media: [
      {
        url: {
          type: String,
          required: true,
        },
        alt: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          required: true,
          enum: ["image", "gif", "video"],
        },
      },
    ],
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    originalTweet: {
      type: Schema.Types.ObjectId,
      ref: "Tweet",
    },
    tweetType: {
      type: String,
      required: true,
      enum: ["tweet", "reply", "retweet", "quote"],
    },
  },
  { timestamps: true }
);

export default mongoose.model<ITweet>("Tweet", TweetSchema);
