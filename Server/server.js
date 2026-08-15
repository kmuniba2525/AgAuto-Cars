import "dotenv/config";

import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./configs/db.js";
import connectCloudinary from "./configs/cloudinary.js";
import compression from "compression";
import userRouter from "./routes/userRoute.js";
import sellerRouter from "./routes/sellerRoute.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import addressRouter from "./routes/addressRoutes.js";
import orderRouter from "./routes/orderRoute.js";
import sitemapRouter from "./routes/sitemapRoute.js";
import { stripeWebhooks } from "./controllers/orderController.js";
import aiRouter from "./routes/aiRoutes.js";
import notificationRouter from "./routes/Notification.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 4000;

// STRIPE WEBHOOK FIRST — must come before express.json(), needs raw body
app.post(
  "/api/order/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhooks
);

// Allowed origins for CORS
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4000",
  process.env.CLIENT_URL, // e.g. https://agautosystemab.com
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like Postman, curl, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("❌ Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.use(compression());

// NORMAL MIDDLEWARE AFTER
app.use(express.json());
app.use(cookieParser());

// API routes
app.use("/api/user", userRouter);
app.use("/api/seller", sellerRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/address", addressRouter);
app.use("/api/order", orderRouter);
app.use("/api/ai", aiRouter);
app.use("/api/notification", notificationRouter);
app.use("/", sitemapRouter);
app.use(express.static(path.join(__dirname, "client-dist")));

app.get("/{*splat}", (req, res) => {
  res.sendFile(path.join(__dirname, "client-dist/index.html"));
});

// start server
const startServer = async () => {
  try {
    await connectDB();
    await connectCloudinary();

    app.listen(port, "0.0.0.0", () => {
      console.log(`🚀 Server running on port: ${port}`);
    });
  } catch (error) {
    console.log("❌ Server startup error:", error.message);
  }
};

startServer();