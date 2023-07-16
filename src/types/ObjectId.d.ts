import mongoose from "mongoose";

declare global {
    type ObjectId = mongoose.Types.ObjectId;
}
