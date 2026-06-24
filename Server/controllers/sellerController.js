import jwt from "jsonwebtoken";
import { errorResponse, successResponse } from "../utils/response.js";

const isProd = process.env.NODE_ENV === "production";

// Shared so login/logout/refresh can never drift out of sync with each other.
// A mismatch here (e.g. sameSite differs) is the #1 reason clearCookie "doesn't work".
const SELLER_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
};

// ================= SELLER LOGIN =================
export const sellerLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return errorResponse(res, 400, "Email and password are required");
    }

    if (!process.env.SELLER_EMAIL || !process.env.SELLER_PASSWORD) {
      console.error("SELLER_EMAIL / SELLER_PASSWORD env vars are not set");
      return errorResponse(res, 500, "Server misconfiguration");
    }

    if (
      password === process.env.SELLER_PASSWORD &&
      email === process.env.SELLER_EMAIL
    ) {
      const token = jwt.sign(
        { email, role: "seller" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.cookie("sellerToken", token, {
        ...SELLER_COOKIE_OPTIONS,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return successResponse(res, 200, "Logged In");
    } else {
      return errorResponse(res, 401, "Invalid Credentials");
    }
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// ================= CHECK AUTH =================
export const isSellerAuth = async (req, res) => {
  try {
    const token = req.cookies?.sellerToken;

    if (!token) {
      return errorResponse(res, 401, "Not authenticated");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "seller") {
      return errorResponse(res, 401, "Not authenticated");
    }

    return successResponse(res, 200, "Seller authenticated", {
      email: decoded.email,
      role: decoded.role,
      isAuthenticated: true,
    });
  } catch (error) {
    return errorResponse(res, 401, "Not authenticated");
  }
};

// ================= SELLER LOGOUT =================
export const sellerLogout = async (req, res) => {
  try {
    res.clearCookie("sellerToken", SELLER_COOKIE_OPTIONS);

    return successResponse(res, 200, "Logged Out");
  } catch (error) {
    console.error(error.message);
    return errorResponse(res, 500, error.message);
  }
};