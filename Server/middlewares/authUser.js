import jwt from "jsonwebtoken";
import { errorResponse } from "../utils/response.js";

const authUser = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return errorResponse(res, 401, "Not Authorized");
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (!decodedToken?.id) {
      return errorResponse(res, 401, "Invalid Token");
    }

    req.user = { id: decodedToken.id };

    return next(); // ✅ IMPORTANT: RETURN
  } catch (error) {
    console.log("❌ Auth Middleware Error:", error.message);
    return errorResponse(res, 401, "Invalid Token");
  }
};

// ✅ NEW: Optional auth — used on routes that must work for BOTH
// logged-in users and guests (placing an order, etc).
// It never blocks the request — it just sets req.user if a valid
// token exists, or req.user = null if not.
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      req.user = null; // guest
      return next();
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (!decodedToken?.id) {
      req.user = null; // bad token payload -> treat as guest
      return next();
    }

    req.user = { id: decodedToken.id };
    return next();
  } catch (error) {
    // expired/invalid token -> don't error out, just treat as guest
    req.user = null;
    return next();
  }
};

export default authUser;