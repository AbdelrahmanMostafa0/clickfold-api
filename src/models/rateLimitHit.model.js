import { Schema, model } from "mongoose";

const rateLimitHitSchema = new Schema({
  key: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
  resetAt: { type: Date, required: true },
});

rateLimitHitSchema.index({ resetAt: 1 }, { expireAfterSeconds: 0 });

export default model("RateLimitHit", rateLimitHitSchema);
