interface IChat {
    _id: string;
    participants: {
        user: IObjectId,
        hasLeft?: boolean,
        isPinned?: boolean;
    }[];
    isGroupChat: boolean;
    chatName?: string;
    chatImage?: string;
    lastMessage?: IObjectId;
}