interface INotification {
    type: "like" | "retweet" | "reply" | "follow" | "quote" | "tweet";
    sender: ObjectId;
    receiver: ObjectId;
    tweetId?: ObjectId;
    read: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}