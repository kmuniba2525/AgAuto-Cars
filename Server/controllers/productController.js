import { v2 as cloudinary } from "cloudinary";
import { errorResponse, successResponse } from "../utils/response.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import sanitizeHtml from "sanitize-html";
import OpenAI from "openai";
import removeMarkdown from "remove-markdown";
import Notification from "../models/Notification.js";
// =========================
// ADD PRODUCT
// =========================
export const addProduct = async (req, res) => {
  try {
    if (!req.body.productData) {
      return errorResponse(res, 400, "Product data missing");
    }

    let productData = JSON.parse(req.body.productData);

    // sanitize CKEditor HTML
    productData.description = sanitizeHtml(productData.description, {
      allowedTags: [
        "b",
        "i",
        "em",
        "strong",
        "ul",
        "ol",
        "li",
        "p",
        "br",
      ],
      allowedAttributes: {},
    });

    if (
      !productData.description ||
      productData.description.trim() === ""
    ) {
      return errorResponse(res, 400, "Description is required");
    }

    const images = req.files;

    if (!images || images.length === 0) {
      return errorResponse(res, 400, "Images are required");
    }

    // upload images to cloudinary
    const imageURL = await Promise.all(
      images.map(async (item) => {
        const result = await cloudinary.uploader.upload(item.path, {
          resource_type: "image",
        });

        return result.secure_url;
      })
    );

    // create product
    await Product.create({
      ...productData,
      image: imageURL,
    });

    return successResponse(res, 200, "Product Added");
  } catch (error) {
    console.log("ADD PRODUCT ERROR:", error);

    return errorResponse(res, 500, error.message);
  }
};

// =========================
// PRODUCT LIST
// =========================
export const productList = async (req, res) => {
  try {
    const products = await Product.find({});

    return res.json({
      success: true,
      products,
    });
  } catch (error) {
    console.log("PRODUCT LIST ERROR:", error);

    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// =========================
// PRODUCT BY ID
// =========================
export const productById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return errorResponse(res, 404, "Product not found");
    }

    return successResponse(res, 200, product);
  } catch (error) {
    console.log("PRODUCT BY ID ERROR:", error);

    return errorResponse(res, 500, error.message);
  }
};

// =========================
// CHANGE STOCK
// =========================
export const changeStock = async (req, res) => {
  try {

    const { id, stock } = req.body;

    // VALIDATION
    if (!id) {
      return errorResponse(
        res,
        400,
        "Product ID is required"
      );
    }

    if (
      stock === undefined ||
      stock === null
    ) {
      return errorResponse(
        res,
        400,
        "Stock value is required"
      );
    }

    // FIND PRODUCT
    const product =
      await Product.findById(id);

    if (!product) {
      return errorResponse(
        res,
        404,
        "Product not found"
      );
    }

    // UPDATE STOCK
    product.stock = Number(stock);

    product.inStock =
      Number(stock) > 0;

    await product.save();

    // LOW STOCK ALERT
    if (
      Number(stock) > 0 &&
      Number(stock) <= 5
    ) {

      await Notification.create({
        title: "Low Stock Alert",

        message: `Only ${stock} ${product.name} left in inventory`,

        type: "stock",
      });

    }

    // OUT OF STOCK ALERT
    if (Number(stock) === 0) {

      await Notification.create({
        title: "Out Of Stock",

        message: `${product.name} is now out of stock`,

        type: "stock",
      });

    }

    // STOCK RESTORED
    if (Number(stock) > 5) {

      await Notification.create({
        title: "Stock Updated",

        message: `${product.name} stock updated to ${stock}`,

        type: "stock",
      });

    }

    return res.json({
      success: true,

      message:
        "Stock updated successfully",

      product,
    });

  } catch (error) {

    console.log(
      "CHANGE STOCK ERROR:",
      error
    );

    return errorResponse(
      res,
      500,
      error.message
    );
  }
};

// =========================
// GENERATE AI DESCRIPTION
// =========================
export const generateDescription = async (req, res) => {
  try {
    
    // check api key
    if (!process.env.GROQ_API_KEY) {
      return res.json({
        success: false,
        message: "GROQ API KEY not found in .env",
      });
    }

    // create groq client
    const client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });

    const { name, category } = req.body;

    // validation
    if (!name || !category) {
      return res.json({
        success: false,
        message: "Name and category are required",
      });
    }

    // ai response
    const completion = await client.chat.completions.create({
  model: "llama-3.1-8b-instant",
  messages: [
    {
      role: "system",
      content:
        "You are an ecommerce product description writer. Always return clean, professional HTML without markdown symbols like ** or --. Keep response under 350 words.",
    },
    {
      role: "user",
      content: `
Write a product description:

Product Name: ${name}
Category: ${category}

“Return product description in clean HTML with sections:

-short intro (1 line)
-4–6 bullet features
-ingredients/material (if applicable)
-usage/benefits
-Do NOT return long paragraphs.”
      `,
    },
  ],
});

   const description = completion.choices[0].message.content;

// limit to 350 words
const limitedDescription = description
  .split(" ")
  .slice(0, 350)
  .join(" ");
const cleanDescription = removeMarkdown(limitedDescription);
    res.json({
  success: true,
  description: cleanDescription,
});
  } catch (error) {
    console.log("AI DESCRIPTION ERROR:", error);

    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// =========================
// ADD REVIEW
// =========================



export const addReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    // =========================
    // VALIDATION
    // =========================

    if (!productId) {
      return res.json({
        success: false,
        message: "Product ID is required",
      });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    if (!comment || comment.trim() === "") {
      return res.json({
        success: false,
        message: "Comment is required",
      });
    }

    // =========================
    // FIND PRODUCT
    // =========================

    const product = await Product.findById(productId);

    if (!product) {
      return res.json({
        success: false,
        message: "Product not found",
      });
    }

    // =========================
    // FIND USER
    // =========================

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    // =========================
    // CHECK EXISTING REVIEW
    // =========================

    const existingReview = product.reviews.find(
      (review) =>
        review.user.toString() === req.user.id
    );

    // =========================
    // UPDATE REVIEW
    // =========================

    if (existingReview) {
      existingReview.rating = Number(rating);
      existingReview.comment = comment.trim();
      existingReview.updatedAt = new Date();
    }

    // =========================
    // ADD NEW REVIEW
    // =========================

    else {
      product.reviews.push({
        user: req.user.id,
        name: user.name,
        rating: Number(rating),
        comment: comment.trim(),
      });
    }

    // =========================
    // CALCULATE AVERAGE RATING
    // =========================

    const totalRating = product.reviews.reduce(
      (acc, item) => acc + item.rating,
      0
    );

    product.rating =
      totalRating / product.reviews.length;

    product.numReviews = product.reviews.length;

    await product.save();

    res.json({
      success: true,
      message: existingReview
        ? "Review updated successfully"
        : "Review added successfully",
      product,
    });

  } catch (error) {
    console.log("ADD REVIEW ERROR:", error);

    res.json({
      success: false,
      message: error.message,
    });
  }
};