import { Schema, model } from "mongoose";

const clickSchema = new Schema(
  {
    link: { type: Schema.Types.ObjectId, ref: "Link", required: true },
    ip: { type: String },
    country: { type: String },
    city: { type: String },
    device: {
      type: String,
      enum: ["desktop", "mobile", "tablet", "unknown"],
      default: "unknown",
    },
    os: { type: String },
    browser: { type: String },
    referer: { type: String },
  },
  { timestamps: true },
);

clickSchema.index({ link: 1, createdAt: -1 });

export default model("Click", clickSchema);
