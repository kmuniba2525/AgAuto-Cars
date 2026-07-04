import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    rating: {
      type: Number,
      default: 0,
    },

    comment: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// ======================
// LITRE / SIZE VARIANTS
// ======================
// One entry per purchasable size, e.g. { label: "1L", price: 1200, offerPrice: 999, stock: 20 }
// A product with no variants falls back to the base price/offerPrice/stock fields below,
// so nothing already in your DB breaks.
const variantSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true, // "1L", "5L", "25L", etc.
    },

    price: {
      type: Number,
      required: true,
    },

    offerPrice: {
      type: Number,
      required: true,
    },

    stock: {
      type: Number,
      required: true,
      default: 0,
    },

    sku: {
      type: String, // optional — useful once you start tracking supplier codes
    },
  },
  { _id: false }
);

const productsSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    description: { type: String, required: true },

    // Base price/stock — used as the fallback "Standard" variant for
    // products that don't have multiple sizes.
    price: { type: Number, required: true },

    offerPrice: { type: Number, required: true },

    image: { type: Array, required: true },

    category: { type: String, required: true },

    inStock: { type: Boolean, required: true },

    stock: {
      type: Number,
      required: true,
      default: 0,
    },

    // ======================
    // LITRE / SIZE VARIANTS
    // ======================
    variants: {
      type: [variantSchema],
      default: [],
    },

    // ======================
    // REVIEW SYSTEM
    // ======================

    reviews: {
      type: [reviewSchema],
      default: [],
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    numReviews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Product =
  mongoose.models.product ||
  mongoose.model("product", productsSchema);

export default Product;
