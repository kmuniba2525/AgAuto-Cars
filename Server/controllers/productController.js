import { v2 as cloudinary } from "cloudinary";
import { errorResponse, successResponse } from "../utils/response.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import sanitizeHtml from "sanitize-html";
import OpenAI from "openai";
import removeMarkdown from "remove-markdown";
import Notification from "../models/Notification.js";

const sanitizeOptions = {
  allowedTags: ["b", "i", "em", "strong", "ul", "ol", "li", "p", "br"],
  allowedAttributes: {},
};

// ✅ NEW: shared helper — builds a { en, pt, sv? } object, sanitizing HTML
// fields when a sanitizer is passed. Swedish is included only if present,
// so it's never dropped when it exists and never fabricated when it doesn't.
const buildBilingualField = (field, { sanitize = false } = {}) => {
  const clean = (val) =>
    sanitize ? sanitizeHtml(val, sanitizeOptions) : val.trim();

  const result = {
    en: clean(field.en),
    pt: clean(field.pt),
  };

  if (field.sv?.trim()) {
    result.sv = clean(field.sv);
  }

  return result;
};

// =========================
// ADD PRODUCT
// =========================
export const addProduct = async (req, res) => {
  try {
    if (!req.body.productData) {
      return errorResponse(res, 400, "Product data missing");
    }

    let productData = JSON.parse(req.body.productData);

    // ✅ name and description come in as { en, pt, sv? } objects.
    // Validate both required languages are present before touching anything else.
    if (
      !productData.name ||
      !productData.name.en?.trim() ||
      !productData.name.pt?.trim()
    ) {
      return errorResponse(res, 400, "Product name is required in both English and Portuguese");
    }

    if (
      !productData.description ||
      !productData.description.en ||
      !productData.description.pt
    ) {
      return errorResponse(res, 400, "Description is required in both English and Portuguese");
    }

    // ✅ FIXED: sanitize each language but keep sv if it was sent — the old
    // code rebuilt this object with only en/pt keys, silently dropping sv.
    productData.description = buildBilingualField(productData.description, {
      sanitize: true,
    });

    if (
      productData.description.en.trim() === "" ||
      productData.description.pt.trim() === ""
    ) {
      return errorResponse(res, 400, "Description is required in both languages");
    }

    // ✅ FIXED: same issue existed here — sv was being dropped on trim.
    productData.name = buildBilingualField(productData.name);

    const images = req.files;

    if (!images || images.length === 0) {
      return errorResponse(res, 400, "Images are required");
    }

    const imageURL = await Promise.all(
      images.map(async (item) => {
        const result = await cloudinary.uploader.upload(item.path, {
          resource_type: "image",
        });

        return result.secure_url;
      })
    );

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

    if (!id) {
      return errorResponse(res, 400, "Product ID is required");
    }

    if (stock === undefined || stock === null) {
      return errorResponse(res, 400, "Stock value is required");
    }

    const product = await Product.findById(id);

    if (!product) {
      return errorResponse(res, 404, "Product not found");
    }

    product.stock = Number(stock);
    product.inStock = Number(stock) > 0;

    await product.save();

    // product.name is an object — notifications are internal/admin-facing,
    // so we use the English name consistently rather than trying to
    // localize a system alert.
    const productNameEn = product.name?.en || "Product";

    if (Number(stock) > 0 && Number(stock) <= 5) {
      await Notification.create({
        title: "Low Stock Alert",
        message: `Only ${stock} ${productNameEn} left in inventory`,
        type: "stock",
      });
    }

    if (Number(stock) === 0) {
      await Notification.create({
        title: "Out Of Stock",
        message: `${productNameEn} is now out of stock`,
        type: "stock",
      });
    }

    if (Number(stock) > 5) {
      await Notification.create({
        title: "Stock Updated",
        message: `${productNameEn} stock updated to ${stock}`,
        type: "stock",
      });
    }

    return res.json({
      success: true,
      message: "Stock updated successfully",
      product,
    });
  } catch (error) {
    console.log("CHANGE STOCK ERROR:", error);

    return errorResponse(res, 500, error.message);
  }
};

// =========================
// GENERATE AI DESCRIPTION
// =========================
// Generates English, Portuguese, and Swedish descriptions in one call,
// returned as { en, pt, sv } so AddProduct.jsx can drop all three
// straight into the CKEditor instances.
export const generateDescription = async (req, res) => {
  try {
    if (!process.env.GROQ_API_KEY) {
      return res.json({
        success: false,
        message: "GROQ API KEY not found in .env",
      });
    }

    const client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });

    const { name, category } = req.body;

    if (!name || !category) {
      return res.json({
        success: false,
        message: "Name and category are required",
      });
    }

    const buildPrompt = (language) => `
Write a product description in ${language}:

Product Name: ${name}
Category: ${category}

Return product description in clean HTML with sections:

-short intro (1 line)
-4–6 bullet features
-ingredients/material (if applicable)
-usage/benefits
-Do NOT return long paragraphs.
    `;

    const [enCompletion, ptCompletion, svCompletion] = await Promise.all([
      client.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content:
              "You are an ecommerce product description writer. Always return clean, professional HTML without markdown symbols like ** or --. Keep response under 350 words.",
          },
          { role: "user", content: buildPrompt("English") },
        ],
      }),
      client.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content:
              "You are an ecommerce product description writer. Always return clean, professional HTML without markdown symbols like ** or --. Keep response under 350 words. Write in natural European Portuguese (Portugal), not Brazilian Portuguese.",
          },
          { role: "user", content: buildPrompt("European Portuguese") },
        ],
      }),
      client.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content:
              "You are an ecommerce product description writer. Always return clean, professional HTML without markdown symbols like ** or --. Keep response under 350 words. Write in natural Swedish (Sverige).",
          },
          { role: "user", content: buildPrompt("Swedish") },
        ],
      }),
    ]);

    const cleanUp = (raw) => {
      const limited = raw.split(" ").slice(0, 350).join(" ");
      return removeMarkdown(limited);
    };

    const descriptionEn = cleanUp(enCompletion.choices[0].message.content);
    const descriptionPt = cleanUp(ptCompletion.choices[0].message.content);
    const descriptionSv = cleanUp(svCompletion.choices[0].message.content);

    res.json({
      success: true,
      description: {
        en: descriptionEn,
        pt: descriptionPt,
        sv: descriptionSv,
      },
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

    if (!productId) {
      return res.json({ success: false, message: "Product ID is required" });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    if (!comment || comment.trim() === "") {
      return res.json({ success: false, message: "Comment is required" });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const existingReview = product.reviews.find(
      (review) => review.user.toString() === req.user.id
    );

    if (existingReview) {
      existingReview.rating = Number(rating);
      existingReview.comment = comment.trim();
      existingReview.updatedAt = new Date();
    } else {
      product.reviews.push({
        user: req.user.id,
        name: user.name,
        rating: Number(rating),
        comment: comment.trim(),
      });
    }

    const totalRating = product.reviews.reduce(
      (acc, item) => acc + item.rating,
      0
    );

    product.rating = totalRating / product.reviews.length;
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

    res.json({ success: false, message: error.message });
  }
};

// =========================
// UPDATE PRODUCT (EDIT)
// =========================
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.body.productData) {
      return errorResponse(res, 400, "Product data missing");
    }

    let productData = JSON.parse(req.body.productData);

    const product = await Product.findById(id);
    if (!product) {
      return errorResponse(res, 404, "Product not found");
    }

    // Validate bilingual name/description, same as addProduct
    if (
      !productData.name ||
      !productData.name.en?.trim() ||
      !productData.name.pt?.trim()
    ) {
      return errorResponse(res, 400, "Product name is required in both English and Portuguese");
    }

    if (
      !productData.description ||
      !productData.description.en ||
      !productData.description.pt
    ) {
      return errorResponse(res, 400, "Description is required in both English and Portuguese");
    }

    // ✅ FIXED: same sv-dropping bug as addProduct — now preserved via
    // buildBilingualField instead of a hand-rolled { en, pt } literal.
    productData.description = buildBilingualField(productData.description, {
      sanitize: true,
    });

    productData.name = buildBilingualField(productData.name);

    // Optional new images — only re-upload if new files were provided,
    // otherwise keep the product's existing images untouched.
    const images = req.files;
    let imageURL = product.image;

    if (images && images.length > 0) {
      imageURL = await Promise.all(
        images.map(async (item) => {
          const result = await cloudinary.uploader.upload(item.path, {
            resource_type: "image",
          });
          return result.secure_url;
        })
      );
    }

    product.name = productData.name;
    product.description = productData.description;
    product.category = productData.category;
    product.price = productData.price;
    product.offerPrice = productData.offerPrice;
    product.stock = productData.stock;
    product.inStock = productData.inStock;
    product.variants = productData.variants;
    product.image = imageURL;

    await product.save();

    return successResponse(res, 200, "Product Updated");
  } catch (error) {
    console.log("UPDATE PRODUCT ERROR:", error);
    return errorResponse(res, 500, error.message);
  }
};