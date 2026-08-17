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

// Allowed origins for CORS — include both www and non-www variants,
// plus whatever CLIENT_URL is set to on the host, so a mismatch there
// can't take down the whole site.
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4000",
  "https://agautosystemab.com",
  "https://www.agautosystemab.com",
  process.env.CLIENT_URL, // e.g. https://www.agautosystemab.com
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like Postman, curl, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("❌ Blocked by CORS:", origin);
      // Deny gracefully instead of throwing — an unhandled CORS error
      // here used to bubble up to Express's default error handler and
      // return a 500 HTML page for every request, including static
      // assets, breaking the whole site for that origin.
      callback(null, false);
    }
  },
  credentials: true,
};

// CORS only applies to API routes — your own static frontend assets
// (JS/CSS/images served below) don't need CORS at all since they're
// same-origin, so a bad origin here can no longer break asset loading.
app.use("/api", cors(corsOptions));

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