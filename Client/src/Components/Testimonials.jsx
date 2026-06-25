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
    <section className="py-12 sm:py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-center uppercase mb-10 sm:mb-14">
          What Our Customers Say?
        </h2>

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
              <div className="bg-white border border-gray-200 p-6 sm:p-8 text-center shadow-sm hover:shadow-lg transition min-h-[300px]">
                <div className="flex justify-center gap-1 text-red-600 text-lg sm:text-xl mb-6">
                  {[...Array(5)].map((_, index) => (
                    <FaStar key={index} />
                  ))}
                </div>

                <p className="italic text-gray-700 text-base sm:text-lg leading-7 mb-8">
                  "{item.review}"
                </p>

                <h3 className="text-gray-500 text-xl sm:text-2xl font-medium">
                  {item.name}
                </h3>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default Testimonial;