import { sendError } from "../utils/response.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

// Double-submit cookie check: the auth cookies are sameSite:none (needed
// for the frontend/API to live on different domains), which makes them
// vulnerable to CSRF. The csrfToken cookie is readable by frontend JS,
// so a cross-site attacker can't forge the matching header.
export const csrfProtection = (req, res, next) => {
  if (SAFE_METHODS.has(req.method)) return next();

  const cookieToken = req.cookies?.csrfToken;
  const headerToken = req.header("x-csrf-token");

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return sendError(res, "Invalid or missing CSRF token", 403);
  }
  next();
};
