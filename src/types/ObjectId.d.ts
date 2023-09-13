import mongoose from "mongoose";

declare global {
    type IObjectId = mongoose.Types.ObjectId;
}
