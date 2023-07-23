interface IMessage {
    chat: ObjectId;
    sender: ObjectId;
    content: string;
    readBy: ObjectId[];
}