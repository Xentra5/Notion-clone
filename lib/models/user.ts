import mongoose, { Schema, models, model } from "mongoose";

// TODO: Define your User Schema fields (e.g. email, password, etc.)
const UserSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    plan: {
      type: String,
      enum: ["free", "pro", "ultimate"],
      default: "free",
    },
    aiUsageCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Prevent compiling model query helper redefinition in hot-reloading development server
const User = models.User || model("User", UserSchema);

export default User;
