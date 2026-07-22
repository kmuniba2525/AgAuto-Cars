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

// ✅ NEW: single source of truth for supported languages.
// Add/remove a language by editing this array only — everything else
// (tabs, validation, payload building) reads from it.
const LANGUAGES = [
  { code: "en", label: "English", required: true, namePattern: /^[A-Za-z\s\-]*$/, namePlaceholder: "Enter Alphabets Only" },
  { code: "pt", label: "Portuguese", required: true, namePattern: null, namePlaceholder: "Digite apenas letras" },
  { code: "sv", label: "Swedish", required: false, namePattern: null, namePlaceholder: "Ange produktnamn på svenska" },
];

const AddProduct = () => {
  const [files, setFiles] = useState([]);

  // ✅ CHANGED: name/description collapsed from 6 separate useState fields
  // into two objects keyed by language code — { en, pt, sv }.
  const [name, setName] = useState({ en: "", pt: "", sv: "" });
  const [description, setDescription] = useState({ en: "", pt: "", sv: "" });

  // ✅ NEW: which language tab is currently visible for Name / Description.
  const [activeNameLang, setActiveNameLang] = useState("en");
  const [activeDescLang, setActiveDescLang] = useState("en");

  const [category, setCategory] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [nameError, setNameError] = useState("");

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

  const updateName = (lang, value) => {
    const langDef = LANGUAGES.find((l) => l.code === lang);
    if (langDef?.namePattern && !langDef.namePattern.test(value)) {
      setNameError("Please enter alphabets only");
      return;
    }
    setNameError("");
    setName((prev) => ({ ...prev, [lang]: value }));
  };

  const updateDescription = (lang, value) => {
    setDescription((prev) => ({ ...prev, [lang]: value }));
  };

  // =========================
  // ADD PRODUCT
  // =========================
  const onSubmitHandler = async (event) => {
    try {
      event.preventDefault();

      const requiredLangs = LANGUAGES.filter((l) => l.required);

      const missingName = requiredLangs.find((l) => !name[l.code]?.trim());
      if (missingName) {
        setActiveNameLang(missingName.code);
        return toast.error(
          `Please enter the product name in ${missingName.label}`
        );
      }

      const missingDesc = requiredLangs.find(
        (l) => !description[l.code]?.trim()
      );
      if (missingDesc) {
        setActiveDescLang(missingDesc.code);
        return toast.error(
          `Please enter the description in ${missingDesc.label}`
        );
      }

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

      const totalStock = cleanedVariants.reduce((sum, v) => sum + v.stock, 0);

      // ✅ Build { en, pt, sv } payload from the collapsed state objects,
      // trimming and only including optional languages if filled in.
      const buildLocalized = (obj) =>
        LANGUAGES.reduce((acc, l) => {
          const val = (obj[l.code] || "").trim();
          if (l.required || val) acc[l.code] = val;
          return acc;
        }, {});

      const productData = {
        name: buildLocalized(name),
        description: buildLocalized(description),
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
        setName({ en: "", pt: "", sv: "" });
        setDescription({ en: "", pt: "", sv: "" });
        setActiveNameLang("en");
        setActiveDescLang("en");
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
      if (!name.en) return toast.error("Enter English product name first");
      if (!category) return toast.error("Select category first");

      setLoadingAI(true);

      const { data } = await axios.post(
        "/api/product/generate-description",
        { name: name.en, category }
      );

      if (data.success) {
        setDescription({
          en: data.description.en,
          pt: data.description.pt,
          sv: data.description.sv || "",
        });
        toast.success("Descriptions generated for all languages!");
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

  // ✅ NEW: reusable language tab-switcher, used for both Name and Description.
  const LangTabs = ({ active, onChange, filledMap }) => (
    <div className="flex gap-1 bg-gray-100 rounded p-1 w-fit">
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => onChange(l.code)}
          className={`px-3 py-1 text-xs font-medium rounded transition ${
            active === l.code
              ? "bg-white shadow text-primary"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {l.label}
          {l.required && !filledMap[l.code]?.trim() && (
            <span className="text-red-400 ml-1">*</span>
          )}
          {!l.required && filledMap[l.code]?.trim() && (
            <span className="text-green-500 ml-1">✓</span>
          )}
        </button>
      ))}
    </div>
  );

  const activeNameDef = LANGUAGES.find((l) => l.code === activeNameLang);

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

        {/* PRODUCT NAME — single field, language tabs */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-base font-medium">Product Name</label>
            <LangTabs
              active={activeNameLang}
              onChange={setActiveNameLang}
              filledMap={name}
            />
          </div>

          <input
            type="text"
            required={activeNameDef.required}
            value={name[activeNameLang]}
            placeholder={activeNameDef.namePlaceholder}
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-400 focus:border-primary"
            onChange={(e) => updateName(activeNameLang, e.target.value)}
          />
          {nameError && <p className="text-xs text-red-500">{nameError}</p>}
          {activeNameLang === "sv" && (
            <p className="text-xs text-gray-400">
              Optional — leave blank to show the English name to Swedish
              customers for now.
            </p>
          )}
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

        {/* DESCRIPTION — single editor, language tabs */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label className="text-base font-medium">
              Product Description
            </label>
            <LangTabs
              active={activeDescLang}
              onChange={setActiveDescLang}
              filledMap={description}
            />
          </div>

          <div className="border rounded">
            {/* key forces CKEditor to remount with the right initial data
                when switching languages, since it's an uncontrolled editor */}
            <CKEditor
              key={activeDescLang}
              editor={ClassicEditor}
              data={description[activeDescLang]}
              onChange={(event, editor) =>
                updateDescription(activeDescLang, editor.getData())
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">
              {activeDescLang === "sv"
                ? "Optional — leave blank to show the English description to Swedish customers for now."
                : "AI can generate all three languages at once — review each before publishing."}
            </p>
            <button
              type="button"
              onClick={generateDescription}
              disabled={loadingAI}
              className="text-blue-600 text-sm hover:underline whitespace-nowrap"
            >
              {loadingAI ? "Generating..." : "✨ Generate with AI"}
            </button>
          </div>
        </div>

        {/* SIZES / LITRE VARIANTS */}
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
