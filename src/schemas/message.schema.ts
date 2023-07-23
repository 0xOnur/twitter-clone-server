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
    content: {
        type: String,
        trim: true,
        maxlength: 1000,
        minlength: 2,
        required: true
    },
    readBy: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
}, {timestamps: true});

export default mongoose.model<IMessage>('Message', MessageSchema);