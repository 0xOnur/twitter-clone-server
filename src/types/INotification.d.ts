interface INotification {
    type: "like" | "retweet" | "reply" | "follow" | "quote" | "tweet";
    sender: IObjectId;
    receiver: IObjectId;
    tweetId?: IObjectId;
    read: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}