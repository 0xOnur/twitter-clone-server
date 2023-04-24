import mongoose, { Schema, Document } from "mongoose";

interface IUser extends Document {
  displayName: string;
  username: string;
  email: string;
  isVerified: boolean;
  password: string;
  bio?: string;
  location?: string;
  avatar?: string;
  cover?: string;
  following: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    displayName: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxLength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    bio: {
        type: String,
        maxLength: 160,
    },
    location: {
        type: String,
        trim: true,
        maxLength: 30,
    },
    avatar: {
      type: String,
    },
    cover: {
      type: String,
    },
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>("User", UserSchema);
