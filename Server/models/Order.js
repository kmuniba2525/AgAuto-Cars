import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false, // was true — guests won't have this
      ref: "user",
    },

    // true when this order was placed without logging in
    isGuestOrder: {
      type: Boolean,
      default: false,
    },

    // contact info collected at checkout for guest orders
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

    // NEW: currency this order was actually charged in (picked per-order
    // based on the customer's shipping country — see
    // resolveShippingAndCurrency in orderController.js). Falls back to
    // "eur" so older orders created before this field existed, and any
    // write that omits it, still validate cleanly.
    currency: { type: String, default: "eur" },

    // NEW: the VAT/tax portion of `amount`, as returned by Stripe Tax at
    // checkout. Stored explicitly instead of being re-derived later, so
    // invoices and reporting show the real tax charged rather than a
    // guess based on subtracting a recalculated subtotal (which could
    // drift if a product's price changes after the order is placed).
    // Defaults to 0 for older orders that predate this field.
    taxAmount: { type: Number, default: 0 },

    // Used for LOGGED-IN users who picked one of their saved addresses
    address: {
      type: mongoose.Schema.Types.ObjectId,
      required: false, // was true
      ref: "address",
    },

    // Used for GUEST users — they have no account to save an
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
    language: {
      type: String,
      // pt kept in the enum so existing orders tagged "pt" still pass
      // validation on save — it's just no longer offered as a new choice
      // (see SUPPORTED_ORDER_LANGUAGES in orderController.js)
      enum: ["en", "pt", "sv", "fi", "da", "no"], // extend as you add more
      default: "en",
    },

    paymentType: { type: String, required: true },

    isPaid: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Order = mongoose.models.order || mongoose.model("order", orderSchema);

export default Order;
