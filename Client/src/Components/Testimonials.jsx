import React from "react";
import { FaStar, FaChevronLeft, FaChevronRight } from "react-icons/fa";

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
];

const Testimonial = () => {
  return (
    <section className=" py-20">

      <div className="max-w-7xl mx-auto px-6">

        {/* Heading */}

        <h2 className="text-3xl font-bold text-center uppercase mb-14">
          What Our Customers Say?
        </h2>

        <div className="relative">

          {/* Left Button */}

          <button className="absolute -left-6 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-full w-14 h-14 flex items-center justify-center hover:bg-red-600 transition">
            <FaChevronLeft className="text-gray-700" />
          </button>

          {/* Cards */}

          <div className="grid md:grid-cols-3 gap-8">

            {testimonials.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 p-10 text-center shadow-sm hover:shadow-lg transition"
              >
                {/* Stars */}

                <div className="flex justify-center gap-1 text-red-600 text-xl mb-8">
                  {[...Array(5)].map((_, index) => (
                    <FaStar key={index} />
                  ))}
                </div>

                {/* Review */}

                <p className="italic text-gray-700 text-lg leading-8 mb-10">
                  "{item.review}"
                </p>

                {/* Name */}

                <h3 className="text-gray-500 text-2xl font-medium">
                  {item.name}
                </h3>
              </div>
            ))}
          </div>

          {/* Right Button */}

          <button className="absolute -right-6 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-full w-14 h-14 flex items-center justify-center hover:bg-red-600 transition">
            <FaChevronRight className="text-gray-700" />
          </button>
        </div>

        {/* Dots */}

        <div className="flex justify-center gap-3 mt-12">
          <span className="w-3 h-3 rounded-full bg-black"></span>
          <span className="w-3 h-3 rounded-full bg-gray-300"></span>
        </div>

      </div>
    </section>
  );
};

export default Testimonial;