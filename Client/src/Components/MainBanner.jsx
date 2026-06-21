import React from "react";
import { Link } from "react-router-dom";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import { assets } from "../assets/assets";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const slides = [
  {
    image: assets.main_banner_bg,
    tagline: "🚗 Premium Auto Parts",
    title: (
      <>
        Premium Parts <br />
        For Every <span className="text-[#E10600]">Vehicle</span>
      </>
    ),
    subtitle:
      "Find genuine automotive parts, accessories, and performance upgrades for every vehicle.",
    primaryText: "Shop Parts",
    primaryLink: "/products",
    secondaryText: "Contact Us",
    secondaryLink: "/contact",
  },

  {
    image: assets.main_banner_bg2,
    tagline: "⚙️ Performance Upgrades",
    title: (
      <>
        Boost Your <br />
        Vehicle Performance
      </>
    ),
    subtitle:
      "Engine, suspension, braking, and performance solutions built for reliability.",
    primaryText: "Explore",
    primaryLink: "/products",
    secondaryText: "Learn More",
    secondaryLink: "/about",
  },

  {
    image: assets.main_banner_bg3,
    tagline: "🔥 Best Deals",
    title: (
      <>
        Genuine Parts <br />
        At Competitive Prices
      </>
    ),
    subtitle:
      "Quality you can trust for daily driving, workshops, and professional repairs.",
    primaryText: "View Products",
    primaryLink: "/products",
    secondaryText: "Contact",
    secondaryLink: "/contact",
  },
];

const MainBanner = () => {
  return (
    <section className="relative w-full h-screen overflow-hidden">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        pagination={{ clickable: true }}
        navigation
        loop
        className="h-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="relative w-full h-screen">

              {/* Single image for both desktop and mobile */}
              <img
                src={slide.image}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Premium Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/40" />

              {/* Content */}
              <div className="absolute inset-0 flex items-center justify-center text-center px-6">
                <div className="max-w-3xl">

                  {/* Badge */}
                  <span className="inline-block px-5 py-2 rounded-full bg-[#E10600]/20 border border-[#E10600]/40 text-[#E10600] text-sm font-medium mb-6 backdrop-blur-sm">
                    {slide.tagline}
                  </span>

                  {/* Heading */}
                  <h1 className="text-white font-bold text-5xl md:text-7xl leading-tight tracking-tight">
                    {slide.title}
                  </h1>

                  {/* Subtitle */}
                  <p className="mt-6 text-[#E5E7EB] text-base md:text-xl max-w-2xl mx-auto leading-relaxed">
                    {slide.subtitle}
                  </p>

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
                    <Link
                      to={slide.primaryLink}
                      className="px-8 py-4 rounded-lg bg-[#E10600] text-white font-semibold hover:bg-[#C50500] hover:scale-105 transition duration-300 shadow-lg shadow-red-900/30"
                    >
                      {slide.primaryText}
                    </Link>

                    <Link
                      to={slide.secondaryLink}
                      className="px-8 py-4 rounded-lg border border-white/20 bg-white/10 backdrop-blur-md text-white font-medium hover:bg-white/20 transition duration-300"
                    >
                      {slide.secondaryText}
                    </Link>
                  </div>

                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default MainBanner;