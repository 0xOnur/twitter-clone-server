import mongoose, {Schema} from "mongoose";

const ChatSchema = new Schema({
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }],
    isGroupChat: {
        type: Boolean,
        default: false,
    },
    isPinned: {
        type: Boolean,
        default: false,
    },
    chatName: {
        type: String,
        maxlength: 50,
        minlength: 1,
    },
    chatImage: {
        type: String,
        trim: true,
    },
    lastMessage: {
        type: Schema.Types.ObjectId,
        ref: 'Message',
    },
}, {timestamps: true});

export default mongoose.model<IChat>('Chat', ChatSchema);