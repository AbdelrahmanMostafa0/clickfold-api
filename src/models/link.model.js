import { Schema, model } from "mongoose";

const linkSchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    destination: { type: String, required: true },
    clicks: { type: Number, default: 0 },
    og: {
      title: { type: String },
      description: { type: String },
      image: { type: String },
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true },
);

const Link = model("Link", linkSchema);
export default Link;
