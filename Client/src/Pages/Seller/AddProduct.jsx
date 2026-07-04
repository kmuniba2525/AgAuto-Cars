import React, { useState } from "react";
import { assets, categories } from "../../assets/assets";
import { useAppContext } from "../../Context/AppContext";
import toast from "react-hot-toast";

// CKEditor
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

const emptyVariant = () => ({
  label: "",
  price: "",
  offerPrice: "",
  stock: "",
  sku: "",
});

const AddProduct = () => {
  const [files, setFiles] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // SIZE / LITRE VARIANTS
  // =========================
  // Every product needs at least one row (e.g. "1L", "5L"). If you only
  // sell one size, just add a single row — you can label it "1L" or
  // "Standard", whatever makes sense.
  const [variants, setVariants] = useState([emptyVariant()]);

  const { axios } = useAppContext();

  const addVariantRow = () => {
    setVariants((prev) => [...prev, emptyVariant()]);
  };

  const removeVariantRow = (index) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const updateVariant = (index, field, value) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  };

  // =========================
  // ADD PRODUCT
  // =========================
  const onSubmitHandler = async (event) => {
    try {
      event.preventDefault();

      // ---- Validate variants ----
      if (variants.length === 0) {
        return toast.error("Add at least one size");
      }

      for (const v of variants) {
        if (!v.label.trim() || v.price === "" || v.offerPrice === "") {
          return toast.error(
            "Fill in size, price, and offer price for every row"
          );
        }
        if (Number(v.offerPrice) > Number(v.price)) {
          return toast.error(
            `Offer price can't be higher than price for "${v.label}"`
          );
        }
      }

      const cleanedVariants = variants.map((v) => ({
        label: v.label.trim(),
        price: Number(v.price),
        offerPrice: Number(v.offerPrice),
        stock: Number(v.stock) || 0,
        ...(v.sku.trim() ? { sku: v.sku.trim() } : {}),
      }));

      const totalStock = cleanedVariants.reduce(
        (sum, v) => sum + v.stock,
        0
      );

      // Base price/offerPrice/stock mirror the first variant so the
      // schema's required top-level fields stay populated — these are
      // what ProductCard / listing pages show before a size is picked.
      const productData = {
        name,
        description,
        category,
        price: cleanedVariants[0].price,
        offerPrice: cleanedVariants[0].offerPrice,
        stock: totalStock,
        inStock: totalStock > 0,
        variants: cleanedVariants,
      };

      const formData = new FormData();
      formData.append("productData", JSON.stringify(productData));

      for (let i = 0; i < files.length; i++) {
        if (files[i]) {
          formData.append("image", files[i]);
        }
      }

      const { data } = await axios.post("/api/product/add", formData);

      if (data.success) {
        toast.success(data.message);

        // reset form
        setName("");
        setDescription("");
        setCategory("");
        setVariants([emptyVariant()]);
        setFiles([]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // =========================
  // GENERATE AI DESCRIPTION
  // =========================
  const generateDescription = async () => {
    try {
      if (!name) return toast.error("Enter product name first");
      if (!category) return toast.error("Select category first");

      setLoadingAI(true);

      const { data } = await axios.post(
        "/api/product/generate-description",
        { name, category }
      );

      if (data.success) {
        setDescription(data.description);
        toast.success("Description generated!");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between">
      <form
        onSubmit={onSubmitHandler}
        className="md:p-10 p-4 space-y-6 max-w-lg"
      >
        {/* IMAGE UPLOAD */}
        <div>
          <p className="text-base font-medium">Product Image</p>

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
                        : assets.upload_area
                    }
                    alt="upload"
                  />
                </label>
              ))}
          </div>
        </div>

        {/* PRODUCT NAME */}
        <div className="flex flex-col gap-1">
          <label className="text-base font-medium">Product Name</label>
          <input
            type="text"
            required
            value={name}
            placeholder="Enter Alphabets Only"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-400 focus:border-primary"
            onChange={(e) => {
              const value = e.target.value;
              if (/^[A-Za-z\s\-]*$/.test(value)) {
                setName(value);
                setError("");
              } else {
                setError("Please enter alphabets Only");
              }
            }}
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
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

        {/* DESCRIPTION */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-base font-medium">
              Product Description
            </label>

            <button
              type="button"
              onClick={generateDescription}
              disabled={loadingAI}
              className="text-blue-600 text-sm hover:underline"
            >
              {loadingAI ? "Generating..." : "✨ Generate with AI"}
            </button>
          </div>

          <div className="border rounded">
            <CKEditor
              editor={ClassicEditor}
              data={description}
              onChange={(event, editor) => setDescription(editor.getData())}
            />
          </div>
        </div>

        {/* ========================= */}
        {/* SIZES / LITRE VARIANTS */}
        {/* ========================= */}

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-base font-medium">
              Sizes &amp; Pricing
            </label>

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
              <div
                key={index}
                className="border border-gray-300 rounded-lg p-3 relative"
              >
                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariantRow(index)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-sm"
                    title="Remove this size"
                  >
                    ✕
                  </button>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
                    <label className="text-xs text-gray-500 font-medium">
                      Size Label
                    </label>
                    <input
                      type="text"
                      required
                      value={variant.label}
                      placeholder="e.g. 1L, 5L, 25L"
                      className="outline-none py-2 px-3 rounded border border-gray-300 focus:border-primary text-sm"
                      onChange={(e) =>
                        updateVariant(index, "label", e.target.value)
                      }
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500 font-medium">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={variant.stock}
                      placeholder="0"
                      className="outline-none py-2 px-3 rounded border border-gray-300 focus:border-primary text-sm"
                      onChange={(e) =>
                        updateVariant(index, "stock", e.target.value)
                      }
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500 font-medium">
                      Price
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={variant.price}
                      placeholder="0"
                      className="outline-none py-2 px-3 rounded border border-gray-300 focus:border-primary text-sm"
                      onChange={(e) =>
                        updateVariant(index, "price", e.target.value)
                      }
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500 font-medium">
                      Offer Price
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={variant.offerPrice}
                      placeholder="0"
                      className="outline-none py-2 px-3 rounded border border-gray-300 focus:border-primary text-sm"
                      onChange={(e) =>
                        updateVariant(index, "offerPrice", e.target.value)
                      }
                    />
                  </div>

                  <div className="flex flex-col gap-1 col-span-2">
                    <label className="text-xs text-gray-500 font-medium">
                      SKU <span className="text-gray-400">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={variant.sku}
                      placeholder="Supplier / internal code"
                      className="outline-none py-2 px-3 rounded border border-gray-300 focus:border-primary text-sm"
                      onChange={(e) =>
                        updateVariant(index, "sku", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-400">
            Only one size? Just fill in the single row above with a clear
            label (e.g. "1L") so customers know exactly what they're buying.
          </p>
        </div>

        {/* SUBMIT */}
        <button className="w-full py-3 bg-primary text-white font-medium rounded hover:opacity-90 transition">
          ADD PRODUCT
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
