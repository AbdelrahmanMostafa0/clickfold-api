import RateLimitHit from "../models/rateLimitHit.model.js";

/**
 * express-rate-limit v8 Store implementation backed by MongoDB.
 *
 * The in-memory MemoryStore resets on every cold start on serverless
 * platforms (Vercel), so rate limits are effectively unenforced there.
 * This store persists hit counts in Mongo, atomically resetting the
 * window via a pipeline update so concurrent requests can't race past
 * the limit.
 */
export class MongoRateLimitStore {
  constructor({ prefix = "rl:" } = {}) {
    this.prefix = prefix;
    this.windowMs = 60 * 1000;
  }

  init(options) {
    this.windowMs = options.windowMs;
  }

  key(key) {
    return `${this.prefix}${key}`;
  }

  async increment(key) {
    const now = new Date();
    const fullKey = this.key(key);
    const doc = await RateLimitHit.findOneAndUpdate(
      { key: fullKey },
      [
        {
          $set: {
            count: {
              $cond: [
                { $or: [{ $eq: ["$resetAt", null] }, { $lt: ["$resetAt", now] }] },
                1,
                { $add: ["$count", 1] },
              ],
            },
            resetAt: {
              $cond: [
                { $or: [{ $eq: ["$resetAt", null] }, { $lt: ["$resetAt", now] }] },
                new Date(now.getTime() + this.windowMs),
                "$resetAt",
              ],
            },
          },
        },
      ],
      { upsert: true, returnDocument: "after", updatePipeline: true },
    );
    return { totalHits: doc.count, resetTime: doc.resetAt };
  }

  async decrement(key) {
    const fullKey = this.key(key);
    await RateLimitHit.updateOne(
      { key: fullKey, count: { $gt: 0 } },
      { $inc: { count: -1 } },
    );
  }

  async resetKey(key) {
    const fullKey = this.key(key);
    await RateLimitHit.deleteOne({ key: fullKey });
  }
}
