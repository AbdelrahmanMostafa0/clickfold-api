import rateLimit from "express-rate-limit";
import { MongoRateLimitStore } from "../utils/mongoRateLimitStore.js";

export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  store: new MongoRateLimitStore({ prefix: "rl:general:" }),
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});

// Login/register/google: brute-force protection, keyed by IP.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  store: new MongoRateLimitStore({ prefix: "rl:auth:" }),
  message: {
    success: false,
    message: "Too many attempts, please try again later.",
  },
});

// Forgot-password: keyed by the target email so an attacker can't
// email-bomb a victim's inbox by rotating IPs.
export const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  store: new MongoRateLimitStore({ prefix: "rl:forgot:" }),
  keyGenerator: (req) =>
    (req.body?.email || req.ip || "unknown").toLowerCase(),
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});
