import express from "express";
import {
  placeOrderCOD,
  getUserOrder,
  getAllOrders,
  updateOrderStatus,
  getSingleOrder,
  getAnalytics,
  getAdvancedAnalytics,
  placeOrderStripeIntent,
} from "../controllers/orderController.js";
import authUser, { optionalAuth } from "../middlewares/authUser.js";
import { authSeller } from "../middlewares/authSeller.js";

const orderRouter = express.Router();

//  Place Order (COD) — optionalAuth so guests can order too
orderRouter.post("/cod", optionalAuth, placeOrderCOD);

//  Get Logged-in User Orders (still requires login — guests have no account to look up)
orderRouter.get("/user", authUser, getUserOrder);

//  Get All Orders (Admin/Seller)
orderRouter.get("/seller", authSeller, getAllOrders);

// Placing order Online — optionalAuth so guests can order too
orderRouter.post("/stripe-intent", optionalAuth, placeOrderStripeIntent);

orderRouter.put("/status/:id", updateOrderStatus);

// both were previously unprotected — any client could read
// store revenue. Now seller-only, same as /seller.
orderRouter.get("/analytics", authSeller, getAnalytics);
orderRouter.get("/analytics/advanced", authSeller, getAdvancedAnalytics);

// optionalAuth — guests need to fetch their own order by ID
// (e.g. on the payment-success page). Ownership is still enforced inside
// getSingleOrder for orders that belong to a registered user.
orderRouter.get("/:id", optionalAuth, getSingleOrder);

export default orderRouter;