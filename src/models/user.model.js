import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      select: false,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    provider: {
      type: String,
      enum: ["email", "google"],
      default: "email",
    },
    // Bumped on every successful password reset so any other outstanding
    // reset tokens (and the one just used) are invalidated.
    tokenVersion: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

const User = model("User", userSchema);

export default User;
