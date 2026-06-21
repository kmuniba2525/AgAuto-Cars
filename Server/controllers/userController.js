import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { successResponse, errorResponse } from "../utils/response.js";
import Notification from "../models/Notification.js";


// console.log("🔥 NEW userController LOADED");
// ================= REGISTER =================
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
});
    await Notification.create({
      title:'A new User Created',
  message: `New user registered: ${user.name}`,
  type: "user",
});

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
  httpOnly: true,
  secure: false, // ✅ IMPORTANT for localhost
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
    // ✅ Fixed: actual user fields instead of { ... }
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

// ================= LOGIN =================
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

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return errorResponse(res, 401, "Invalid Email or Password");
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return successResponse(res, 200, "Login successful", {
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};
// ================= Check Auth=================
//api/user/is-auth
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
    // console.log("❌ isAuth Error:", error.message);
    return errorResponse(res, 500, error.message);
  }
};

// ================= LOGOUT USER =================
// api/user/logout
export const logout=async(req,res)=>{
try{
res.clearCookie('token', {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax', // ✅ matches the value used when setting the cookie
});

return successResponse(res,201,'Logged Out')
}catch(error){
console.log(error.message);
    return errorResponse(res, 500, error.message);
}
}