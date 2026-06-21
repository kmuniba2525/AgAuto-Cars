import jwt from "jsonwebtoken";
import { errorResponse } from "../utils/response.js";

export const authSeller = (req, res, next) => {
  try {
    const token = req.cookies?.sellerToken;
    

    if (!token) {
      return errorResponse(res, 401, "Not authenticated");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // FIX: safe role check (no email dependency)
    if (decoded.role !== "seller") {
      return errorResponse(res, 403, "Access denied");
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.log("AUTH ERROR:", error.message);
    return errorResponse(res, 500, error.message);
  }
};