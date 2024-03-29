import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";

const UserSchema: Schema = new Schema(
  {
    displayName: {
      type: String,
      required: true,
      maxLength: 50,
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
    website: {
        type: String,
        trim: true,
        maxLength: 100,
    },
    avatar: {
      type: String,
      default: "https://res.cloudinary.com/dwcw9iftp/image/upload/v1683417676/Twitter/Users/Avatar/default_profile_400x400_dctbia.png"
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
    birthDay: {
      day: {
        type: Number,
        min: 1,
        max: 31,
        },
      month: {
        type: Number,
        min: 1,
        max: 12,
        },
      year: {
        type: Number,
        min: 1900,
        },
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
      return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export default mongoose.model<IUser>("User", UserSchema);
