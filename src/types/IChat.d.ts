interface IChat {
    participants: {
        user: ObjectId,
        hasLeft: boolean,
        isPinned: boolean;
    }[];
    isGroupChat?: boolean;
    chatName?: string;
    chatImage?: string;
    lastMessage?: ObjectId;
}