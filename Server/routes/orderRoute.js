import express from "express";
import {
  placeOrderCOD,
  getUserOrder,
  getAllOrders,
  placeOrderStripe,
  updateOrderStatus,
  getSingleOrder,
  getAnalytics,
} from "../controllers/orderController.js";
import authUser from "../middlewares/authUser.js";
import { authSeller } from "../middlewares/authSeller.js";



const orderRouter = express.Router();

//  Place Order (COD)
orderRouter.post("/cod", authUser, placeOrderCOD);

//  Get Logged-in User Orders
orderRouter.get("/user", authUser, getUserOrder);

//  Get All Orders (Admin/Seller)
orderRouter.get("/seller",  authSeller, getAllOrders);

//Placing order Online
orderRouter.post("/stripe", authUser, placeOrderStripe);

orderRouter.put("/status/:id",updateOrderStatus);
orderRouter.get("/analytics", getAnalytics)
orderRouter.get("/:id", authUser, getSingleOrder);

export default orderRouter;