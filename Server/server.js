import "dotenv/config";

import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";

import connectDB from "./configs/db.js";
import connectCloudinary from "./configs/cloudinary.js";

import userRouter from "./routes/userRoute.js";
import sellerRouter from "./routes/sellerRoute.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import addressRouter from "./routes/addressRoutes.js";
import orderRouter from "./routes/orderRoute.js";

import { stripeWebhooks } from "./controllers/orderController.js";
import aiRouter from "./routes/aiRoutes.js";
import notificationRouter from "./routes/Notification.js";

const app = express();
const port = process.env.PORT || 4000;

// STRIPE WEBHOOK FIRST — must come before express.json(), needs raw body
app.post(
  "/api/order/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhooks
);

// NORMAL MIDDLEWARE AFTER
app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://ag-auto-cars.vercel.app",
    /\.vercel\.app$/   // ✅ allow all vercel preview domains
  ],
  credentials: true
}));

// routes
app.get("/", (req, res) => {
  res.send("API is working");
});

app.use("/api/user", userRouter);
app.use("/api/seller", sellerRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/address", addressRouter);
app.use("/api/order", orderRouter);
app.use("/api/ai", aiRouter);
app.use("/api/notification", notificationRouter);

// start server
const startServer = async () => {
  try {
    await connectDB();
    await connectCloudinary();

    app.listen(port, () => {
      console.log(`🚀 Server running on port: ${port}`);
    });
  } catch (error) {
    console.log("❌ Server startup error:", error.message);
  }
};

startServer();