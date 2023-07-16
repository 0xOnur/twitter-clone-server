import mongoose, { Schema } from "mongoose";

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
      enum: ["everyone", "circle"],
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
    pollId: {
      type: Schema.Types.ObjectId,
      ref: "Poll",
    },
    media: [
      {
        url: {
          type: String,
          required: true,
        },
        alt: {
          type: String,
        },
        type: {
          type: String,
          required: true,
        },
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
      enum: ["tweet", "reply", "retweet", "like", "quote"],
    },
    view: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

export default mongoose.model<ITweet>("Tweet", TweetSchema);
