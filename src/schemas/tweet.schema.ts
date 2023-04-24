import mongoose, { Schema, Document } from "mongoose";

export interface IMedia {
  url: string;
  alt: string;
  type: "image" | "gif" | "video";
}

export interface ITweet extends Document {
  author: mongoose.Types.ObjectId[];
  audience: "everyone" | "specificUsers";
  specificAudience?: mongoose.Types.ObjectId[];
  whoCanReply: "everyone" | "following" | "mentioned";
  content?: string;
  media?: IMedia[];
  likes?: mongoose.Types.ObjectId[];
  bookmarks? : mongoose.Types.ObjectId[];
  originalTweet?: mongoose.Types.ObjectId[];
  tweetType: "tweet" | "reply" | "retweet" | "quote";
  view: number;
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
      enum: ["everyone", "specificUsers"],
    },
    specificAudience: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
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
    bookmarks: [
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
    view: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

export default mongoose.model<ITweet>("Tweet", TweetSchema);
