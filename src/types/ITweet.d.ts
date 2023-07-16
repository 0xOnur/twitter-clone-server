

interface ITweet {
    author: ObjectId;
    audience: "everyone" | "circle";
    whoCanReply: "everyone" | "following" | "mentioned";
    content?: string;
    media?: IMedia[];
    pollId?: ObjectId;
    bookmarks? : ObjectId[];
    originalTweet?: ObjectId[];
    tweetType: "tweet" | "reply" | "retweet" | "like" | "quote";
    view: number;
    createdAt?: Date;
    updatedAt?: Date;
  }