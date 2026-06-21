import React, { useRef } from "react";
import { categories } from "../assets/assets";
import { useAppContext } from "../Context/AppContext";

const Categories = () => {
  const { navigate } = useAppContext();
  const scrollRef = useRef();

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -360 : 360,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="mt-20 relative">

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
        className="
          absolute
          left-2
          top-1/2
          -translate-y-1/2
          z-20
          bg-[#0F0F0F]
          text-white
          w-10
          h-10
          rounded-full
          shadow-lg
          hover:scale-110
          transition
        "
      >
        ◀
      </button>

      {/* Cards Container */}
      <div
        ref={scrollRef}
        className="
          flex
          gap-5
          overflow-x-auto
          scroll-smooth
          scrollbar-hide
          py-2
          px-6
        "
      >
        {categories.map((category, index) => (
          <div
            key={index}
            onClick={() => {
              navigate(`/products/${category.path.toLowerCase()}`);
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            }}
            className="
              relative
              flex-none
              basis-1/3
              h-[320px]
              overflow-hidden
              rounded-md
              group
              cursor-pointer
              shadow-xl
            "
          >
            {/* Background Image */}
            <img
              src={category.image}
              alt={category.text}
              className="
                w-full
                h-full
                object-cover
                group-hover:scale-110
                transition-all
                duration-700
              "
            />

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/35 transition duration-500"></div>

            {/* Card Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-15">

              {/* Title */}
              <h3
                className="
                  text-white
                  text-2xl
                  font-bold
                  uppercase
                  text-center
                  py-5
                  px-8
                  tracking-wide
                "
              >
                {category.text}
              </h3>

              {/* Button */}
              <button
                className="
                  absolute
                  bottom-10
                  px-8
                  py-1
                  bg-[#E10600]
                  text-black
                  font-semibold
                  rounded-sm
                  hover:scale-105
                  transition-all
                "
              >
                To see
              </button>

            </div>
          </div>
        ))}
      </div>

      {/* Right Arrow */}
      <button
        onClick={() => scroll("right")}
        className="
          absolute
          right-2
          top-1/2
          -translate-y-1/2
          z-20
          bg-[#0F0F0F]
          text-white
          w-12
          h-12
          rounded-full
          shadow-lg
          hover:scale-110
          transition
        "
      >
        ▶
      </button>

    </div>
  );
};

export default Categories;