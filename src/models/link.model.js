import { Schema, model } from "mongoose";

const linkSchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    destination: { type: String, required: true },
    clicks: { type: Number, default: 0 },
    susPopups: { type: Boolean, default: false },
    og: {
      title: { type: String },
      description: { type: String },
      image: { type: String },
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date, default: null },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);
linkSchema.index(
  { slug: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);
const Link = model("Link", linkSchema);
export default Link;
