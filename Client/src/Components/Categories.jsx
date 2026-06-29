import React, { useRef } from "react";
import { categories } from "../assets/assets";
import { useAppContext } from "../Context/AppContext";
import { useTranslation } from "react-i18next";

const Categories = () => {
  const { navigate } = useAppContext();
  const { t } = useTranslation();
  const scrollRef = useRef();

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -320 : 320,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="mt-20 px-4 sm:px-6 lg:px-10">
      {/* Section Header */}
      <div className="relative mb-10">
        {/* Watermark */}
        <p className="absolute -top-6 left-0 text-[64px] sm:text-[90px] font-black text-gray-100 leading-none select-none pointer-events-none uppercase tracking-tighter">
          Shop
        </p>

        <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-[2px] bg-accent" />
              <p className="text-xs font-bold tracking-[3px] text-accent uppercase">
                Browse
              </p>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
              {t("categories.title")}
            </h2>
          </div>

          {/* Scroll Arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white hover:border-primary transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white hover:border-primary transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-5 flex items-center gap-3">
          <div className="h-[2px] w-10 bg-accent rounded-full" />
          <div className="h-[1px] flex-1 bg-gray-200 rounded-full" />
        </div>
      </div>

      {/* Scrollable Cards */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth scrollbar-hide pb-2"
      >
        {categories.map((category, index) => (
          <div
            key={index}
            onClick={() => {
              navigate(`/products/${category.path.toLowerCase()}`);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="relative flex-none w-[200px] sm:w-[240px] md:w-[270px] h-[260px] sm:h-[300px] md:h-[340px] overflow-hidden cursor-pointer group"
          >
            {/* Image */}
            <img
              src={category.image}
              alt={category.text}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition duration-500 group-hover:from-black/90" />

            {/* Red left border accent on hover */}
            <div className="absolute left-0 top-0 w-[3px] h-0 bg-accent group-hover:h-full transition-all duration-500" />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-5">
              <p className="text-white/60 text-xs font-semibold tracking-[2px] uppercase mb-1">
                Collection
              </p>
              <h3 className="text-white text-lg sm:text-xl font-black uppercase tracking-wide leading-tight">
                {category.text}
              </h3>

              {/* Shop Now — slides up on hover */}
              <div className="overflow-hidden mt-2">
                <div className="flex items-center gap-2 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <span className="text-accent text-sm font-bold uppercase tracking-widest">
                    {t("categories.shop_now")}
                  </span>
                  <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;