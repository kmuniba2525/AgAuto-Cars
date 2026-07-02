import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false, // ✅ CHANGED: was true — guests won't have this
      ref: "user",
    },

    // ✅ NEW: true when this order was placed without logging in
    isGuestOrder: {
      type: Boolean,
      default: false,
    },

    // ✅ NEW: contact info collected at checkout for guest orders
    guestInfo: {
      name: { type: String },
      email: { type: String },
      phone: { type: String },
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
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

    // Used for LOGGED-IN users who picked one of their saved addresses
    address: {
      type: mongoose.Schema.Types.ObjectId,
      required: false, // ✅ CHANGED: was true
      ref: "address",
    },

    // ✅ NEW: Used for GUEST users — they have no account to save an
    // address to, so it's stored directly on the order instead of a ref.
    guestAddress: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      zipcode: { type: String },
      country: { type: String },
      phone: { type: String },
    },

    status: {
      type: String,
      enum: ["Order Placed", "Preparing", "Shipped", "Delivered"],
      default: "Order Placed",
    },

    paymentType: { type: String, required: true },

    isPaid: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Order = mongoose.models.order || mongoose.model("order", orderSchema);

export default Order;