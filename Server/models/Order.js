import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId, // ✅ FIXED
      required: true,
      ref: "user",
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId, // ✅ FIXED
          required: true,
          ref: "product",
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],

    amount: { type: Number, required: true },

    address: {
      type: mongoose.Schema.Types.ObjectId, // ✅ FIXED
      required: true,
      ref: "address",
    },

 status: {
  type: String,
  enum: [
    "Order Placed",
    "Preparing",
    "Shipped",
    "Delivered",
  ],
  default: "Order Placed",
},
// riderName: String,
// riderPhone: String,
// estimatedDelivery: String,

    paymentType: { type: String, required: true },

    isPaid: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Order = mongoose.models.order || mongoose.model("order", orderSchema);

export default Order;