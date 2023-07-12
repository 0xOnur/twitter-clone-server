import mongoose from 'mongoose';

const PollChoiceSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        trim: true,
        maxLength: 25,
    },
    votes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
});

const PollSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    choices: [PollChoiceSchema],
    active: {
        type: Boolean,
        default: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
});

export default mongoose.model('Poll', PollSchema);
