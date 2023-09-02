interface IMessage {
    chat: ObjectId;
    sender: ObjectId;
    removedBy?: ObjectId[];
    content: string;
    readBy?: ObjectId[];
    type: "message" | "reply" | "tweet";
    replyTo?: ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}