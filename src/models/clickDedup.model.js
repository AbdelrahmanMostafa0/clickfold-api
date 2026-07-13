import { Schema, model } from "mongoose";

const CLICK_DEDUP_WINDOW_SECONDS = 15;

// One doc per (link, ip) pair, auto-expiring after the dedup window.
// A duplicate-key error on insert means this ip already clicked this
// link recently — used to stop curl-loop spam from inflating counts.
const clickDedupSchema = new Schema({
  key: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

clickDedupSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: CLICK_DEDUP_WINDOW_SECONDS },
);

export default model("ClickDedup", clickDedupSchema);
