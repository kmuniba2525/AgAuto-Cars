import React, { useState } from "react";
import { assets, categories } from "../../assets/assets";
import { useAppContext } from "../../Context/AppContext";
import toast from "react-hot-toast";

// CKEditor
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

const AddProduct = () => {
  const [files, setFiles] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [stock, setStock] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const[error,setError]=useState('');

  const { axios } = useAppContext();

  // =========================
  // ADD PRODUCT
  // =========================
  const onSubmitHandler = async (event) => {
    try {
      event.preventDefault();

      const productData = {
        name,
        description,
        category,
        price: Number(price),
        offerPrice: Number(offerPrice),
        stock: Number(stock),
        inStock: Number(stock) > 0,
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
        setStock("");
        setPrice("");
        setOfferPrice("");
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
        "http://localhost:4000/api/product/generate-description",
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
            // onChange={(e) => setName(e.target.value)}
            onChange={(e)=>{
              const value=e.target.value;
              if(/^[A-Za-z]*$/.test(value)){
                setName(value);
                setError("");

              }else{
                setError("Please enter alphabets Only")
              }

              
            }}
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
              onChange={(event, editor) =>
                setDescription(editor.getData())
              }
            />
          </div>
        </div>

        {/* STOCK */}
        <div className="flex flex-col gap-1">
          <label className="text-base font-medium">
            Stock Quantity
          </label>
          <input
            type="number"
            value={stock}
            placeholder="0"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-400 focus:border-primary"
            onChange={(e) => setStock(e.target.value)}
          />
        </div>

        {/* PRICES */}
        <div className="flex gap-5 flex-wrap">
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-base font-medium">
              Product Price
            </label>
            <input
              type="number"
              required
              value={price}
              placeholder="0"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-400 focus:border-primary"
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <div className="flex-1 flex flex-col gap-1">
            <label className="text-base font-medium">
              Offer Price
            </label>
            <input
              type="number"
              required
              value={offerPrice}
              placeholder="0"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-400 focus:border-primary"
              onChange={(e) => setOfferPrice(e.target.value)}
            />
          </div>
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
