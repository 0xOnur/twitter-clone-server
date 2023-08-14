interface IMessage {
    chat: ObjectId;
    sender: ObjectId;
    content: string;
    readBy: ObjectId[];
    type: "message" | "reply" | "tweet";
    replyTo?: ObjectId;
}