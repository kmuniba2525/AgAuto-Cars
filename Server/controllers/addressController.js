import Address from "../models/Address.js";
import { errorResponse, successResponse } from "../utils/response.js";

// Add Address
export const addAddress = async (req, res) => {
  try {
    const { address } = req.body;
    const userId = req.user.id;

    await Address.create({ ...address, userId });

    return successResponse(res, 201, "Address Added Successfully");
  } catch (error) {
    console.log(error.message);
    return errorResponse(res, 500, error.message);
  }
};

// Get Address
export const getAddress = async (req, res) => {
  try {
    const userId = req.user.id;

    const addresses = await Address.find({ userId });

    return res.status(200).json({
      success: true,
      addresses: addresses, // ✅ THIS LINE FIXES EVERYTHING
    });

  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};