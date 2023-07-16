import mongoose, {Schema} from "mongoose";

const notificationSchema = new Schema({
    type: {
        type: String,
        enum: ['like', 'retweet', 'reply', 'follow', 'quote'],
        required: true,
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    tweetId: {
        type: Schema.Types.ObjectId,
        ref: 'Tweet',
    },
    read: {
        type: Boolean,
        default: false,
    },
}, {timestamps: true});

export default mongoose.model<INotification>('Notification', notificationSchema);