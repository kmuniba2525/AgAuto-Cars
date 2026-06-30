// ProductCard.jsx
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
      className="flex flex-col bg-white rounded-xl sm:rounded-2xl border border-gray-200/70 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] cursor-pointer hover:shadow-[0_12px_28px_-8px_rgba(0,0,0,0.12)] hover:border-gray-300 transition-all duration-300 w-full overflow-hidden"
    >
      {/* Product Image */}
      <div className="overflow-hidden">
        <img
          src={product.image?.[0] || assets.upload_area}
          alt={product.name}
          className="w-full h-28 sm:h-36 lg:h-40 object-cover hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Content */}
      <div className="p-2.5 sm:p-3.5 text-[11px] sm:text-xs flex flex-col flex-1">
        {/* Price */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <p className="text-gray-900 font-semibold text-xs sm:text-[13px]">
            {currency}{product.offerPrice}
          </p>
          {product.price > product.offerPrice && (
            <p className="text-gray-400 line-through text-[10px] sm:text-[11px]">
              {currency}{product.price}
            </p>
          )}
        </div>

        {/* Product Name */}
        <p className="text-gray-800 text-xs sm:text-sm font-medium mt-1 sm:mt-1.5 mb-1 line-clamp-1">
          {product.name}
        </p>

        {/* Description */}
        <p
          className="text-gray-500 text-[10px] sm:text-xs leading-4 sm:leading-5 overflow-hidden"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {description}
        </p>

        {/* Buttons */}
        <div
          className="grid grid-cols-2 gap-1.5 sm:gap-2 mt-2.5 sm:mt-3.5"
          onClick={(e) => e.stopPropagation()}
        >
          {!cartItems[product._id] ? (
            <>
              <button
                onClick={() => addToCart(product._id)}
                className="bg-gray-50 border border-gray-200 text-gray-700 py-1 sm:py-1.5 text-[10px] sm:text-xs rounded-md sm:rounded-lg font-medium hover:bg-gray-100 hover:border-gray-300 transition-colors duration-200"
              >
                {t("product_card.add")}
              </button>
              <button
                onClick={() => { addToCart(product._id); navigate("/cart"); }}
                className="bg-primary text-white py-1 sm:py-1.5 text-[10px] sm:text-xs rounded-md sm:rounded-lg font-medium hover:opacity-90 shadow-sm shadow-primary/30 transition-opacity duration-200"
              >
                Buy Now
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-md sm:rounded-lg px-1.5 sm:px-2 py-1 sm:py-1.5">
                <button
                  onClick={() => removeFromCart(product._id)}
                  className="text-sm sm:text-base font-semibold text-gray-500 hover:text-gray-900 transition-colors"
                >
                  −
                </button>
                <span className="font-semibold text-gray-800 text-[10px] sm:text-xs">
                  {cartItems[product._id]}
                </span>
                <button
                  onClick={() => addToCart(product._id)}
                  className="text-sm sm:text-base font-semibold text-gray-500 hover:text-gray-900 transition-colors"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => navigate("/cart")}
                className="bg-primary text-white py-1 sm:py-1.5 text-[10px] sm:text-xs rounded-md sm:rounded-lg font-medium hover:opacity-90 shadow-sm shadow-primary/30 transition-opacity duration-200"
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