import mongoose, {Schema} from "mongoose";

const MessageSchema = new Schema({
    chat: {
        type: Schema.Types.ObjectId,
        ref: 'Chat',
        required: true,
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    //users who removed message
    removedBy: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    content: {
        type: String,
        trim: true,
        maxlength: 1000,
    },
    media: {
        url: {
            type: String,
        },
        type: {
            type: String,
        },
    },
    readBy: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    type: {
        type: String,
        enum: ['message', 'reply', 'tweet'],
        default: 'message',
        required: true
    },
    tweet: {
        type: Schema.Types.ObjectId,
        ref: 'Tweet',
    },
    replyTo: {
        type: Schema.Types.ObjectId,
        ref: 'Message',
    }
}, {timestamps: true});

export default mongoose.model<IMessage>('Message', MessageSchema);