import React from "react";
import { FaStar } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

const testimonials = [
  {
    id: 1,
    name: "Emma S",
    review:
      "Fast delivery and excellent customer service. Highly recommended!",
  },
  {
    id: 2,
    name: "Olivia L",
    review:
      "Amazing quality automotive parts. Everything arrived perfectly packed.",
  },
  {
    id: 3,
    name: "Thomas O",
    review:
      "Great prices and quick shipping. Will definitely buy again!",
  },
  {
    id: 4,
    name: "Sarah K",
    review:
      "Very professional service and excellent product quality.",
  },
];

const Testimonial = () => {
  return (
    <section className="mt-20 px-4 sm:px-6 lg:px-10">

      {/* Section Header */}
      <div className="mb-12 text-left">
        {/* Eyebrow */}
        <div className="flex items-center gap-2 mb-3">
          <span className="w-6 h-[2px] bg-accent" />
          <p className="text-xs font-bold tracking-[3px] text-accent uppercase">
            Testimonials
          </p>
        </div>

        {/* Main Heading */}
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
          What Our Customers Say
        </h2>

        {/* Subtitle */}
        <p className="mt-4 max-w-2xl text-gray-500 text-sm sm:text-base leading-7">
          Hear what our customers have to say about the quality of our products and
          the service they received.
        </p>
      </div>

      {/* Testimonials Slider */}

      <Swiper
        modules={[Pagination, Autoplay]}
        spaceBetween={24}
        pagination={{ clickable: true }}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        breakpoints={{
          0: {
            slidesPerView: 1,
          },
          640: {
            slidesPerView: 2,
          },
          1024: {
            slidesPerView: 3,
          },
        }}
      >
        {testimonials.map((item) => (
          <SwiperSlide key={item.id}>
            <div className="group bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full">

              <div className="flex justify-start gap-1 text-yellow-500 text-lg mb-6">
                {[...Array(5)].map((_, index) => (
                  <FaStar key={index} />
                ))}
              </div>

              <p className="text-gray-600 italic leading-8 text-base mb-8">
                "{item.review}"
              </p>

              <div className="border-t pt-5">
                <h3 className="font-bold text-lg text-gray-900">
                  {item.name}
                </h3>

                <p className="text-sm text-gray-500 mt-1 uppercase tracking-wider">
                  Verified Customer
                </p>
              </div>

            </div>
          </SwiperSlide>
        ))}
      </Swiper>

    </section>
  );
};

export default Testimonial;
