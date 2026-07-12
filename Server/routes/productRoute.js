import express from "express";
import { upload } from "../configs/multer.js";
import { authSeller } from "../middlewares/authSeller.js";
import authUser from "../middlewares/authUser.js";

import {
  addProduct,
  changeStock,
  generateDescription,
  productById,
  productList,
  addReview,
  updateProduct,
} from "../controllers/productController.js";

const productRouter = express.Router();

productRouter.post(
  "/add",
  authSeller,
  upload.array("image", 4),
  addProduct
);
productRouter.put("/edit/:id", upload.array("image", 4), authSeller, updateProduct);

productRouter.get("/list", productList);

productRouter.get("/:id", productById);

productRouter.post(
  "/stock",
  authSeller,
  changeStock
);

productRouter.post(
  "/review",
  authUser,
  addReview
);

productRouter.post(
  "/generate-description",
  generateDescription
);

export default productRouter;