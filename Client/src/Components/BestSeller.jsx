import React from "react";
import ProductCard from "./ProductCard";
import { useAppContext } from "../Context/AppContext";
import { useTranslation } from "react-i18next";

const BestSeller = () => {
  const { products } = useAppContext();
  const { t } = useTranslation();

  const bestSellers = products
    .filter((product) => product.inStock)
    .map((product) => ({
      ...product,
      rating: (Math.random() * 5).toFixed(1),
    }))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);

  return (
    <div className="mt-20 px-4 sm:px-6 text center  lg:px-10">
      {/* Section Header */}
      <div className="relative mb-10">
        {/* Background watermark text */}
        <p className="absolute -top-6 left-0 text-[64px] sm:text-[90px] font-black text-gray-100 leading-none select-none pointer-events-none uppercase tracking-tighter">
          Top Picks
        </p>

        <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            {/* Eyebrow */}
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-[2px] bg-accent" />
              <p className="text-xs text-center font-bold tracking-[3px] text-accent uppercase">
                Best Sellers
              </p>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
              {t("best_seller.title")}
            </h2>
          </div>

          {/* View All Button */}
          <a
            href="/products"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-gray-900 border-b-2 border-accent pb-0.5 hover:text-accent transition-colors w-fit"
          >
            View All Products
            <svg
              className="w-4 h-4 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>

        {/* Divider */}
        <div className="mt-5 flex items-center gap-3">
          <div className="h-[2px] w-10 bg-accent rounded-full" />
          <div className="h-[1px] flex-1 bg-gray-200 rounded-full" />
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
        {bestSellers.map((product, index) => (
          <div
            key={product._id}
            className="relative group"
          >
            {/* Rank Badge */}
            <div className="absolute -top-2 -left-2 z-10 w-7 h-7 rounded-full bg-primary text-white text-xs font-black flex items-center justify-center shadow-md">
              {index + 1}
            </div>

            {/* Top Seller badge on first product */}
            {index === 0 && (
              <div className="absolute -top-2 -right-2 z-10 bg-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md uppercase tracking-wide">
                🔥 Top
              </div>
            )}

            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BestSeller;