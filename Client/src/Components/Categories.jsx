import React, { useRef } from "react";
import { categories } from "../assets/assets";
import { useAppContext } from "../Context/AppContext";

const Categories = () => {
  const { navigate } = useAppContext();
  const scrollRef = useRef();

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -300 : 300,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="mt-16 relative px-2">

      {/* Heading */}
      <div className="mb-6 flex flex-col items-center">
        <h2 className="text-2xl md:text-3xl text-center font-bold text-[#0F0F0F]">
          Shop By Category
        </h2>
        <div className="w-20 h-1 bg-[#EAB308] mt-2 rounded-full"></div>
      </div>

      {/* Left Arrow */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-[#0F0F0F] text-white w-8 h-8 md:w-10 md:h-10 rounded-full shadow-lg hover:scale-110 transition text-xs md:text-base"
      >
        ◀
      </button>

      {/* Cards Container */}
      <div
        ref={scrollRef}
        className="flex gap-3 md:gap-5 overflow-x-auto scroll-smooth scrollbar-hide py-2 px-8 md:px-10"
      >
        {categories.map((category, index) => (
          <div
            key={index}
            onClick={() => {
              navigate(`/products/${category.path.toLowerCase()}`);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="relative flex-none w-[200px] sm:w-[240px] md:w-[280px] lg:basis-1/4 h-[220px] sm:h-[260px] md:h-[320px] overflow-hidden rounded-md group cursor-pointer shadow-xl"
          >
            {/* Background Image */}
            <img
              src={category.image}
              alt={category.text}
              className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
            />

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/35 transition duration-500" />

            {/* Card Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 md:pb-12">

              {/* Title */}
              <h3 className="text-white text-lg md:text-2xl font-bold uppercase text-center px-4 tracking-wide">
                {category.text}
              </h3>

              {/* Button */}
              <button className="mt-3 px-6 py-1.5 bg-[#E10600] text-white text-sm md:text-base font-semibold rounded-sm hover:scale-105 transition-all">
                Shop Now
              </button>

            </div>
          </div>
        ))}
      </div>

      {/* Right Arrow */}
      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-[#0F0F0F] text-white w-8 h-8 md:w-10 md:h-10 rounded-full shadow-lg hover:scale-110 transition text-xs md:text-base"
      >
        ▶
      </button>

    </div>
  );
};

export default Categories;