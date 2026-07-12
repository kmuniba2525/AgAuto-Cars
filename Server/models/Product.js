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
      type: String,
    },
  },
  { _id: false }
);

// ======================
// BILINGUAL TEXT FIELDS
// ======================
// Used for name + description so the same product document serves both
// English and Portuguese storefronts without duplicating the whole product.
const bilingualTextSchema = new mongoose.Schema(
  {
    en: { type: String, required: true },
    pt: { type: String, required: true },
  },
  { _id: false }
);

const productsSchema = new mongoose.Schema(
  {
    // ✅ CHANGED: name and description are now { en, pt } objects instead
    // of plain strings.
    name: { type: bilingualTextSchema, required: true },

    description: { type: bilingualTextSchema, required: true },

    price: { type: Number, required: true },

    offerPrice: { type: Number, required: true },

    image: { type: Array, required: true },

    // Category stays a plain string key (e.g. "Primer") — it's translated
    // on the frontend via i18n's categories.* keys, not stored bilingually.
    category: { type: String, required: true },

    inStock: { type: Boolean, required: true },

    stock: {
      type: Number,
      required: true,
      default: 0,
    },

    variants: {
      type: [variantSchema],
      default: [],
    },

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