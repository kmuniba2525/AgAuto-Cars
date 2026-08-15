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
    // pt required: true -> false for now — Portuguese support paused (kept
    // in the schema, not required, so existing PT product data isn't lost)
    pt: { type: String, required: false },
    sv: { type: String, required: false }, // optional so existing products don't break; falls back to en via getLocalizedText
    fi: { type: String, required: false }, // optional, falls back to en via getLocalizedText
    da: { type: String, required: false }, // optional, falls back to en via getLocalizedText
    no: { type: String, required: false }, // optional, falls back to en via getLocalizedText
  },
  { _id: false }
);

// ======================
// SLUG GENERATOR
// ======================
// Turns a product name into a clean, URL-safe string, e.g.
// "Premium Ceramic Shield™ (5L)" -> "premium-ceramic-shield-5l"
const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");

const productsSchema = new mongoose.Schema(
  {
    // ✅ CHANGED: name and description are now { en, pt } objects instead
    // of plain strings.
    name: { type: bilingualTextSchema, required: true },

    description: { type: bilingualTextSchema, required: true },

    // SEO-friendly URL segment, e.g. "premium-ceramic-shield". Generated
    // automatically from the English name the first time a product is
    // saved — see the pre-save hook below. Left unset here (not required)
    // so existing products can be backfilled via utils/backfillSlugs.js.
    slug: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

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

// Auto-generate a unique slug from the English name — only on first save,
// so editing the name later never breaks an already-indexed URL.
productsSchema.pre("save", async function () {
  if (this.slug) return;

  const base = slugify(this.name?.en || "product") || "product";
  let slug = base;
  let counter = 1;

  while (await this.constructor.exists({ slug, _id: { $ne: this._id } })) {
    counter += 1;
    slug = `${base}-${counter}`;
  }

  this.slug = slug;
});

const Product =
  mongoose.models.product ||
  mongoose.model("product", productsSchema);

export default Product;