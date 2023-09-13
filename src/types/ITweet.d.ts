

interface ITweet {
    author: IObjectId;
    audience: "everyone" | "circle";
    whoCanReply: "everyone" | "following" | "mentioned";
    content?: string;
    media?: IMedia[];
    pollId?: IObjectId;
    bookmarks? : IObjectId[];
    originalTweet?: IObjectId[];
    tweetType: "tweet" | "reply" | "retweet" | "like" | "quote";
    view: number;
    createdAt?: Date;
    updatedAt?: Date;
  }