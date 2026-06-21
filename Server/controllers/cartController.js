import User from "../models/User.js";
import { errorResponse, successResponse } from "../utils/response.js";

export const updateCart = async (req, res) => {
  try {
    const { cartItems } = req.body;
    const userId = req.user.id;

  

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { cartItems } },
      { new: true }
    );

    // console.log("✅ Updated cart in DB:", updatedUser.cartItems);

    return successResponse(res, 200, "Updated Successfully");
  } catch (error) {
    console.log("❌ Cart Update Error:", error.message);
    return errorResponse(res, 500, error.message);
  }
};