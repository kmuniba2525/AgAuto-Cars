import jwt from "jsonwebtoken";
import { errorResponse, successResponse } from "../utils/response.js";

// ================= SELLER LOGIN =================
export const sellerLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (
      password === process.env.SELLER_PASSWORD &&
      email === process.env.SELLER_EMAIL
    ) {
      // assign token (FIXED: added role)
      const token = jwt.sign(
        {
          email,
          role: "seller", // ✅ ADDED (important fix)
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // store cookie
      res.cookie("sellerToken", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return successResponse(res, 201, "Logged In");
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

    // FIX: handle missing token safely
    if (!token) {
      return errorResponse(res, 401, "Not authenticated");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // FIX: return actual data instead of undefined "user"
    return successResponse(res, 200, {
      email: decoded.email,
      role: decoded.role,
      isAuthenticated: true,
    });
  } catch (error) {
    console.log(error.message);
    return errorResponse(res, 500, error.message);
  }
};

// ================= SELLER LOGOUT =================
export const sellerLogout = async (req, res) => {
  try {
    res.clearCookie("sellerToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return successResponse(res, 201, "Logged Out");
  } catch (error) {
    console.log(error.message);
    return errorResponse(res, 500, error.message);
  }
};