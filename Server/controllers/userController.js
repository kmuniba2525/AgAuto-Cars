import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { successResponse, errorResponse } from "../utils/response.js";
import Notification from "../models/Notification.js";

const isProd = process.env.NODE_ENV === "production";

const USER_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    if (!name || !normalizedEmail || !password) {
      return errorResponse(res, 400, "Missing Credentials");
    }

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return errorResponse(res, 409, "User Already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      authProvider: "local",
    });

    await Notification.create({
      title: "A new User Created",
      message: `New user registered: ${user.name}`,
      type: "user",
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, USER_COOKIE_OPTIONS);

    return successResponse(res, 201, "Registered successfully", {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.log(error.message);
    return errorResponse(res, 500, error.message);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 400, "Email and Password are required");
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return errorResponse(res, 401, "Invalid Email or Password");
    }

    if (user.authProvider === "google") {
      return errorResponse(
        res,
        401,
        "This account uses Google Sign-In. Please continue with Google."
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return errorResponse(res, 401, "Invalid Email or Password");
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, USER_COOKIE_OPTIONS);

    return successResponse(res, 200, "Login successful", {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// ================= GOOGLE AUTH =================
// api/user/google
export const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return errorResponse(res, 400, "Google credential is required");
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    const normalizedEmail = email.toLowerCase().trim();

    let user = await User.findOne({ email: normalizedEmail });
    let isNewUser = false;

    if (!user) {
      user = await User.create({
        name,
        email: normalizedEmail,
        authProvider: "google",
        image: picture,
      });
      isNewUser = true;
    }

    if (isNewUser) {
      await Notification.create({
        title: "A new User Created",
        message: `New user registered: ${user.name}`,
        type: "user",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, USER_COOKIE_OPTIONS);

    return successResponse(res, 200, "Login successful", {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.log(error.message);
    return errorResponse(res, 500, error.message);
  }
};

// ================= Check Auth =================
// api/user/is-auth
export const isAuth = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      console.log("❌ req.user missing");
      return errorResponse(res, 401, "Not Authorized");
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    return successResponse(res, 200, "User authenticated", {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        cartItems: user.cartItems || {},
      },
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// ================= LOGOUT USER =================
// api/user/logout
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
    });

    return successResponse(res, 200, "Logged Out");
  } catch (error) {
    console.log(error.message);
    return errorResponse(res, 500, error.message);
  }
};