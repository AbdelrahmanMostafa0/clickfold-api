import { Schema, model } from "mongoose";

const campaignSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

const Campaign = model("Campaign", campaignSchema);
export default Campaign;
