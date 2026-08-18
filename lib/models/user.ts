import { Schema, models, model } from "mongoose";

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
      required: false,
    },
    image: {
      type: String,
      default: "",
    },
    provider: {
      type: String,
      default: "credentials",
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
    // Stripe Payment Metadata
    stripeCustomerId: { type: String, default: null },
    stripeSubscriptionId: { type: String, default: null },
    stripePriceId: { type: String, default: null },
    stripeCurrentPeriodEnd: { type: Date, default: null },
    // Razorpay Payment Metadata
    razorpayCustomerId: { type: String, default: null },
    razorpaySubscriptionId: { type: String, default: null },
    razorpayOrderId: { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },
  },
  { timestamps: true }
);

// Prevent compiling model query helper redefinition in hot-reloading development server
const User = models.User || model("User", UserSchema);

export default User;
