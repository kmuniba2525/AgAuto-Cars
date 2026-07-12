import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { assets, categories } from "../../assets/assets";
import { useAppContext } from "../../Context/AppContext";
import toast from "react-hot-toast";

import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

const emptyVariant = () => ({
  label: "",
  price: "",
  offerPrice: "",
  stock: "",
  sku: "",
});

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { axios } = useAppContext();

  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const [nameEn, setNameEn] = useState("");
  const [namePt, setNamePt] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionPt, setDescriptionPt] = useState("");
  const [category, setCategory] = useState("");
  const [variants, setVariants] = useState([emptyVariant()]);

  // =========================
  // LOAD EXISTING PRODUCT
  // =========================
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`/api/product/${id}`);

        if (data.success) {
          // ✅ FIXED: your successResponse(res, statusCode, message, data)
          // helper spreads its 3rd argument as `message`, and productById
          // calls successResponse(res, 200, product) — so the actual
          // product object lives at data.message, not data.data/data.product.
          const product = data.message;

          if (!product) {
            toast.error("Product not found");
            navigate("/seller/product-list");
            return;
          }

          // ✅ Handle both migrated ({en, pt}) and legacy (string) shapes,
          // same safety net as getLocalizedText on the customer side.
          const name = product.name;
          setNameEn(typeof name === "string" ? name : name?.en || "");
          setNamePt(typeof name === "string" ? name : name?.pt || "");

          const description = product.description;
          setDescriptionEn(typeof description === "string" ? description : description?.en || "");
          setDescriptionPt(typeof description === "string" ? description : description?.pt || "");

          setCategory(product.category || "");
          setExistingImages(product.image || []);
          setVariants(
            product.variants?.length > 0
              ? product.variants.map((v) => ({
                  label: v.label || "",
                  price: v.price ?? "",
                  offerPrice: v.offerPrice ?? "",
                  stock: v.stock ?? "",
                  sku: v.sku || "",
                }))
              : [emptyVariant()]
          );
        } else {
          toast.error("Product not found");
          navigate("/seller/product-list");
        }
      } catch (error) {
        console.log(error);
        toast.error(error.response?.data?.message || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const addVariantRow = () => setVariants((prev) => [...prev, emptyVariant()]);

  const removeVariantRow = (index) =>
    setVariants((prev) => prev.filter((_, i) => i !== index));

  const updateVariant = (index, field, value) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  };

  // =========================
  // SUBMIT UPDATE
  // =========================
  const onSubmitHandler = async (event) => {
    try {
      event.preventDefault();

      if (!nameEn.trim() || !namePt.trim()) {
        return toast.error("Please enter the product name in both English and Portuguese");
      }

      if (!descriptionEn.trim() || !descriptionPt.trim()) {
        return toast.error("Please enter the description in both English and Portuguese");
      }

      if (variants.length === 0) {
        return toast.error("Add at least one size");
      }

      for (const v of variants) {
        if (!v.label.trim() || v.price === "" || v.offerPrice === "") {
          return toast.error("Fill in size, price, and offer price for every row");
        }
        if (Number(v.offerPrice) > Number(v.price)) {
          return toast.error(`Offer price can't be higher than price for "${v.label}"`);
        }
      }

      const cleanedVariants = variants.map((v) => ({
        label: v.label.trim(),
        price: Number(v.price),
        offerPrice: Number(v.offerPrice),
        stock: Number(v.stock) || 0,
        ...(v.sku.trim() ? { sku: v.sku.trim() } : {}),
      }));

      const totalStock = cleanedVariants.reduce((sum, v) => sum + v.stock, 0);

      const productData = {
        name: { en: nameEn.trim(), pt: namePt.trim() },
        description: { en: descriptionEn, pt: descriptionPt },
        category,
        price: cleanedVariants[0].price,
        offerPrice: cleanedVariants[0].offerPrice,
        stock: totalStock,
        inStock: totalStock > 0,
        variants: cleanedVariants,
      };

      const formData = new FormData();
      formData.append("productData", JSON.stringify(productData));

      // ✅ Only append new files if the seller picked replacements —
      // otherwise the backend keeps existing images untouched.
      for (let i = 0; i < files.length; i++) {
        if (files[i]) {
          formData.append("image", files[i]);
        }
      }

      const { data } = await axios.put(`/api/product/edit/${id}`, formData);

      if (data.success) {
        toast.success(data.message);
        navigate("/seller/product-list");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 h-[95vh] flex items-center justify-center text-gray-500">
        Loading product...
      </div>
    );
  }

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between">
      <form
        onSubmit={onSubmitHandler}
        className="md:p-10 p-4 space-y-6 max-w-lg"
      >
        <h2 className="text-xl font-semibold text-gray-800">Edit Product</h2>

        {/* IMAGES */}
        <div>
          <p className="text-base font-medium">Product Image</p>
          <p className="text-xs text-gray-400 mb-2">
            Leave unchanged to keep the current images, or select new ones to replace them.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-2">
            {Array(4)
              .fill("")
              .map((_, index) => (
                <label key={index} htmlFor={`image${index}`}>
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    id={`image${index}`}
                    onChange={(e) => {
                      const updatedFiles = [...files];
                      updatedFiles[index] = e.target.files[0];
                      setFiles(updatedFiles);
                    }}
                  />
                  <img
                    className="max-w-24 cursor-pointer rounded border border-gray-300"
                    src={
                      files[index]
                        ? URL.createObjectURL(files[index])
                        : existingImages[index] || assets.upload_area
                    }
                    alt="upload"
                  />
                </label>
              ))}
          </div>
        </div>

        {/* NAME — EN */}
        <div className="flex flex-col gap-1">
          <label className="text-base font-medium">
            Product Name <span className="text-xs font-normal text-gray-400">(English)</span>
          </label>
          <input
            type="text"
            required
            value={nameEn}
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-400 focus:border-primary"
            onChange={(e) => setNameEn(e.target.value)}
          />
        </div>

        {/* NAME — PT */}
        <div className="flex flex-col gap-1">
          <label className="text-base font-medium">
            Nome do Produto <span className="text-xs font-normal text-gray-400">(Portuguese)</span>
          </label>
          <input
            type="text"
            required
            value={namePt}
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-400 focus:border-primary"
            onChange={(e) => setNamePt(e.target.value)}
          />
        </div>

        {/* CATEGORY */}
        <div className="flex flex-col gap-1">
          <label className="text-base font-medium">Category</label>
          <select
            value={category}
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-400 focus:border-primary"
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Select Category</option>
            {categories.map((item, index) => (
              <option key={index} value={item.path}>
                {item.path}
              </option>
            ))}
          </select>
        </div>

        {/* DESCRIPTION — EN */}
        <div className="flex flex-col gap-3">
          <label className="text-base font-medium">
            Product Description <span className="text-xs font-normal text-gray-400">(English)</span>
          </label>
          <div className="border rounded">
            <CKEditor
              editor={ClassicEditor}
              data={descriptionEn}
              onChange={(event, editor) => setDescriptionEn(editor.getData())}
            />
          </div>
        </div>

        {/* DESCRIPTION — PT */}
        <div className="flex flex-col gap-3">
          <label className="text-base font-medium">
            Descrição do Produto <span className="text-xs font-normal text-gray-400">(Portuguese)</span>
          </label>
          <div className="border rounded">
            <CKEditor
              editor={ClassicEditor}
              data={descriptionPt}
              onChange={(event, editor) => setDescriptionPt(editor.getData())}
            />
          </div>
        </div>

        {/* VARIANTS */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-base font-medium">Sizes &amp; Pricing</label>
            <button
              type="button"
              onClick={addVariantRow}
              className="text-primary text-sm font-medium hover:underline"
            >
              + Add Size
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {variants.map((variant, index) => (
              <div key={index} className="border border-gray-300 rounded-lg p-3 relative">
                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariantRow(index)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-sm"
                  >
                    ✕
                  </button>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
                    <label className="text-xs text-gray-500 font-medium">Size Label</label>
                    <input
                      type="text"
                      required
                      value={variant.label}
                      className="outline-none py-2 px-3 rounded border border-gray-300 focus:border-primary text-sm"
                      onChange={(e) => updateVariant(index, "label", e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500 font-medium">Stock Quantity</label>
                    <input
                      type="number"
                      min="0"
                      value={variant.stock}
                      className="outline-none py-2 px-3 rounded border border-gray-300 focus:border-primary text-sm"
                      onChange={(e) => updateVariant(index, "stock", e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500 font-medium">Price</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={variant.price}
                      className="outline-none py-2 px-3 rounded border border-gray-300 focus:border-primary text-sm"
                      onChange={(e) => updateVariant(index, "price", e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500 font-medium">Offer Price</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={variant.offerPrice}
                      className="outline-none py-2 px-3 rounded border border-gray-300 focus:border-primary text-sm"
                      onChange={(e) => updateVariant(index, "offerPrice", e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1 col-span-2">
                    <label className="text-xs text-gray-500 font-medium">
                      SKU <span className="text-gray-400">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={variant.sku}
                      className="outline-none py-2 px-3 rounded border border-gray-300 focus:border-primary text-sm"
                      onChange={(e) => updateVariant(index, "sku", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SUBMIT */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate("/seller/product-list")}
            className="flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button className="flex-1 py-3 bg-primary text-white font-medium rounded hover:opacity-90 transition">
            SAVE CHANGES
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;