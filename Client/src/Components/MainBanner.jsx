import React from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { assets } from "../assets/assets";
import { useTranslation } from "react-i18next";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const MainBanner = () => {
  const { t } = useTranslation();

  const slides = [
    {
      image: assets.main_banner_bg,
      tagline: t('banner.slide1_tagline'),
      title: (
        <>
          {t('banner.slide1_title1')} <br />
          {t('banner.slide1_title2')} <span className="text-[#E10600]">{t('banner.slide1_highlight')}</span>
        </>
      ),
      subtitle: t('banner.slide1_subtitle'),
      primaryText: t('banner.slide1_primary'),
      primaryLink: "/products",
      secondaryText: t('banner.slide1_secondary'),
      secondaryLink: "/contact",
    },
    {
      image: assets.main_banner_bg2,
      tagline: t('banner.slide2_tagline'),
      title: (
        <>
          {t('banner.slide2_title1')} <br />
          {t('banner.slide2_title2')}
        </>
      ),
      subtitle: t('banner.slide2_subtitle'),
      primaryText: t('banner.slide2_primary'),
      primaryLink: "/products",
      secondaryText: t('banner.slide2_secondary'),
      secondaryLink: "/about",
    },
    {
      image: assets.main_banner_bg3,
      tagline: t('banner.slide3_tagline'),
      title: (
        <>
          {t('banner.slide3_title1')} <br />
          {t('banner.slide3_title2')}
        </>
      ),
      subtitle: t('banner.slide3_subtitle'),
      primaryText: t('banner.slide3_primary'),
      primaryLink: "/products",
      secondaryText: t('banner.slide3_secondary'),
      secondaryLink: "/contact",
    },
  ];

  return (
    <section className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] overflow-hidden">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation loop className="h-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="relative w-full h-full">
              <img src={slide.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/40" />
              <div className="absolute inset-0 flex items-center justify-center text-center px-4 md:px-6">
                <div className="max-w-3xl">
                  <span className="inline-block px-3 py-1 md:px-5 md:py-2 rounded-full bg-[#E10600]/20 border border-[#E10600]/40 text-[#E10600] text-xs md:text-sm font-medium mb-3 md:mb-6 backdrop-blur-sm">
                    {slide.tagline}
                  </span>
                  <h1 className="text-white font-bold text-2xl sm:text-3xl md:text-5xl leading-tight tracking-tight">
                    {slide.title}
                  </h1>
                  <p className="hidden sm:block mt-4 md:mt-6 text-[#E5E7EB] text-sm md:text-xl max-w-2xl mx-auto leading-relaxed">
                    {slide.subtitle}
                  </p>
                  <div className="flex flex-row justify-center gap-2 md:gap-4 mt-5 md:mt-10">
                    <Link to={slide.primaryLink}
                      className="px-4 py-2 md:px-8 md:py-4 rounded-lg bg-[#E10600] text-white text-sm md:text-base font-semibold hover:bg-[#C50500] hover:scale-105 transition duration-300 shadow-lg shadow-red-900/30">
                      {slide.primaryText}
                    </Link>
                    <Link to={slide.secondaryLink}
                      className="px-4 py-2 md:px-8 md:py-4 rounded-lg border border-white/20 bg-white/10 backdrop-blur-md text-white text-sm md:text-base font-medium hover:bg-white/20 transition duration-300">
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