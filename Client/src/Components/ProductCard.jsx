import React from "react";
import { assets } from "../assets/assets";
import { useAppContext } from "../Context/AppContext";
import { useTranslation } from "react-i18next";

const ProductCard = ({ product }) => {
  const {
    currency,
    addToCart,
    removeFromCart,
    cartItems,
    navigate,
  } = useAppContext();

  const { t } = useTranslation();

  if (!product) return null;

  const description = product.description
    ? product.description.replace(/<[^>]*>/g, "")
    : "";

  return (
    <div
      onClick={() => {
        navigate(`/products/${product.category.toLowerCase()}/${product._id}`);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      className="flex flex-col bg-white shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-300 w-full"
    >
      {/* Product Image */}
      <img
        src={product.image?.[0] || assets.upload_area}
        alt={product.name}
        className="w-full h-36 object-cover"
      />

      {/* Content */}
      <div className="p-3 text-xs flex flex-col flex-1">
        {/* Price */}
        <div className="flex items-center gap-2">
          <p className="text-slate-600 font-medium">
            {currency}{product.offerPrice}
          </p>
          {product.price > product.offerPrice && (
            <p className="text-gray-400 line-through">
              {currency}{product.price}
            </p>
          )}
        </div>

        {/* Product Name */}
        <p className="text-slate-800 text-sm font-medium mt-1 mb-1 line-clamp-1">
          {product.name}
        </p>

        {/* Description */}
        <p className="text-slate-500 line-clamp-2 leading-relaxed">
          {description}
        </p>

        {/* Buttons */}
        <div
          className="grid grid-cols-2 gap-2 mt-3"
          onClick={(e) => e.stopPropagation()}
        >
          {!cartItems[product._id] ? (
            <>
              <button
                onClick={() => addToCart(product._id)}
                className="bg-slate-100 text-slate-600 py-1.5 text-xs"
              >
                {t("product_card.add")}
              </button>
              <button
                onClick={() => { addToCart(product._id); navigate("/cart"); }}
                className="bg-slate-800 text-white py-1.5 text-xs"
              >
                Buy Now
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between bg-slate-100 px-2 py-1.5">
                <button
                  onClick={() => removeFromCart(product._id)}
                  className="text-base font-semibold text-slate-700 hover:text-black"
                >
                  −
                </button>
                <span className="font-semibold text-slate-800 text-xs">
                  {cartItems[product._id]}
                </span>
                <button
                  onClick={() => addToCart(product._id)}
                  className="text-base font-semibold text-slate-700 hover:text-black"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => navigate("/cart")}
                className="bg-slate-800 text-white py-1.5 text-xs"
              >
                Go To Cart
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;