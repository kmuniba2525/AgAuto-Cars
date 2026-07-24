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
    .slice(0, 8);

  return (
    <section className="py-14 px-4 sm:px-6 lg:px-10">

      {/* Heading */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">

        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-[2px] bg-primary"></span>

            <p className="uppercase text-xs tracking-[3px] font-semibold text-primary">
              Best Sellers
            </p>
          </div>

          <h2 className="text-3xl lg:text-4xl font-bold">
            {t("best_seller.title")}
          </h2>

          <p className="text-gray-500 mt-2">
            Explore our best-selling automotive products.
          </p>
        </div>

        <a
          href="/products"
          className="font-semibold text-primary hover:text-black transition"
        >
          View All Products →
        </a>

      </div>

      {/* Products */}

   <div
  className="
    flex
    gap-6
    overflow-x-auto
    snap-x
    snap-mandatory
    pb-5
    scroll-smooth
  "
>
  {bestSellers.map((product) => (
    <div
      key={product._id}
      className="
        snap-start
        shrink-0

        w-[300px] sm:w-[250px] md:w-[200px] lg:w-[250px]
        
      "
    >
      <ProductCard product={product} />
    </div>
  ))}
</div>

    </section>
  );
};

export default BestSeller;