interface IChat {
    participants: ObjectId[];
    isGroupChat?: boolean;
    isPinned: boolean;
    chatName?: string;
    chatImage?: string;
    lastMessage?: ObjectId;
}