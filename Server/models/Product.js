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

const productsSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    description: { type: String, required: true },

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