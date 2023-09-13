interface IMessage {
    chat: IObjectId;
    sender: IObjectId;
    removedBy?: IObjectId[];
    content?: string;
    readBy?: IObjectId[];
    type?: "message" | "reply" | "tweet";
    replyTo?: IObjectId;
    tweet?: IObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}