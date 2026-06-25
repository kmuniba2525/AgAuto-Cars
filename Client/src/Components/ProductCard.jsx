import React from "react";
import { assets } from "../assets/assets";
import { useAppContext } from "../Context/AppContext";
import { FaStar } from "react-icons/fa";
const ProductCard = ({ product }) => {

  const {
    currency,
    addToCart,
    removeFromCart,
    cartItems,
    navigate,
  } = useAppContext();

  if (!product) return null;

  const averageRating =
    Number(product?.rating) || 0;

  const roundedRating =
    Math.round(averageRating);

  return (
    <div
      onClick={() => {
        navigate(
          `/products/${product.category.toLowerCase()}/${product._id}`
        );
        window.scrollTo(0, 0);
      }}

      className="
group
relative
bg-white
rounded-3xl
overflow-hidden
w-full
h-full
flex
flex-col
border
border-gray-100
shadow-[0_4px_20px_rgba(0,0,0,0.05)]
hover:shadow-[0_12px_35px_rgba(0,0,0,0.12)]
transition-all
duration-300
hover:-translate-y-1
"
    >

      {/* IMAGE */}
      <div className="relative w-full h-44 flex items-center justify-center overflow-hidden bg-gray-50">

        {/* subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition"></div>

        <img
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          src={
            product?.image?.[0] ||
            assets.upload_area
          }
          alt={product.name}
        />

        {/* CATEGORY BADGE */}
        <span className="absolute top-2 left-2 text-[10px] px-2 py-1 bg-red-600 text-black font-semibold rounded-full backdrop-blur">
          {product.category}
        </span>

      </div>

      {/* CONTENT */}
      <div className="flex flex-col flex-1 px-4 py-3 text-sm">

        {/* NAME */}
        <p className="text-gray-800 font-semibold text-base truncate group-hover:text-primary transition">
          {product.name}
        </p>

        {/* RATING */}
        <div className="flex items-center gap-1 mt-2">

  {[...Array(5)].map((_, i) => (
    <FaStar
      key={i}
      className={`text-sm ${
        i < roundedRating
          ? "text-red-600"
          : "text-gray-600"
      }`}
    />
  ))}

  <span className="ml-2 text-xs font-medium text-gray-200 bg-gray-800 px-2 py-1 rounded-full">
    {averageRating.toFixed(1)}
  </span>

</div>

        {/* PRICE */}
        <div className="mt-auto pt-4 flex items-end justify-between">

          <div>
            <p className="text-lg font-bold text-primary">
              {currency}
              {product.offerPrice}
            </p>

            <p className="text-xs text-gray-400 line-through">
              {currency}
              {product.price}
            </p>
          </div>

          {/* CART BUTTON */}
          <div onClick={(e) => e.stopPropagation()}>

            {!cartItems[product._id] ? (
              <button
                onClick={() =>
                  addToCart(product._id)
                }
                className="
                  flex items-center gap-1
                  bg-primary/10
                  text-primary
                  px-3 py-1.5
                  rounded-full
                  text-xs
                  font-medium
                  hover:bg-primary hover:text-white
                  transition
                "
              >
                <img
                  src={assets.cart_icon}
                  className="w-4 brightness-0 saturate-100"
                  alt="cart"
                />
                Add
              </button>
            ) : (
              <div className="
                flex items-center gap-2
                bg-primary/10
                px-2 py-1
                rounded-full
                text-xs
              ">
                <button
                  onClick={() =>
                    removeFromCart(product._id)
                  }
                  className="w-5 h-5 flex items-center justify-center bg-white rounded-full"
                >
                  -
                </button>

                <span className="min-w-[18px] text-center">
                  {cartItems[product._id]}
                </span>

                <button
                  onClick={() =>
                    addToCart(product._id)
                  }
                  className="w-5 h-5 flex items-center justify-center bg-white rounded-full"
                >
                  +
                </button>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductCard;