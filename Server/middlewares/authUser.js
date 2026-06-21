import jwt from "jsonwebtoken";
import { errorResponse } from "../utils/response.js";

const authUser = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    // console.log("COOKIES:", req.cookies);

    // console.log("🍪 Cookies:", req.cookies);

    if (!token) {
      
      return errorResponse(res, 401, "Not Authorized");
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // console.log("✅ Decoded Token:", decodedToken);

    if (!decodedToken?.id) {
      // console.log("❌ Token has no ID");
      return errorResponse(res, 401, "Invalid Token");
    }

    req.user = { id: decodedToken.id };

    // console.log("👤 req.user SET:", req.user);

    return next(); // ✅ IMPORTANT: RETURN
  } catch (error) {
    console.log("❌ Auth Middleware Error:", error.message);
    return errorResponse(res, 401, "Invalid Token");
  }
};

export default authUser;

