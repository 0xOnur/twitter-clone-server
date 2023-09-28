interface IMessage {
    chat: IObjectId;
    sender: IObjectId;
    removedBy?: IObjectId[];
    content?: string;
    media?: {
        url: string;
        type: string;
    };
    readBy?: IObjectId[];
    type?: "message" | "reply" | "tweet";
    replyTo?: IObjectId;
    tweet?: IObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}