import React from "react";
import ProductCard from "../ProductCard";
import Pagination from "./Pagination";

const CategorySection = ({
  paginatedCategories,
  products,
  setSelectedCategories,
  categoryPage,
  totalCategoryPages,
  setCategoryPage,
}) => {
  return (
    <>
      <div className="space-y-12 sm:space-y-16">
        {paginatedCategories.map((cat) => {
          const categoryProducts = products.filter(
            (p) =>
              p.category?.toLowerCase() ===
              cat.path.toLowerCase()
          );

          if (categoryProducts.length === 0) return null;

          return (
            <section key={cat.path}>
              <div className="flex items-center justify-between mb-5 sm:mb-6">
                <div>
                  <p className="text-xs tracking-[2px] uppercase text-primary font-semibold">
                    Collection
                  </p>

                  <h2 className="font-serif text-xl sm:text-2xl text-gray-900 mt-1">
                    {cat.text}
                  </h2>
                </div>

                <button
                  onClick={() =>
                    setSelectedCategories([cat.path])
                  }
                  className="group text-xs sm:text-sm font-semibold rounded-full px-4 py-2 shadow-sm hover:shadow-md text-primary border border-primary/30 hover:bg-primary hover:text-white hover:border-primary transition-colors flex items-center gap-1"
                >
                  View All

                  <span className="transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
                {categoryProducts
                  .slice(0, 4)
                  .map((product) => (
                    <div
                      key={product._id}
                      className="transition-transform duration-300 hover:-translate-y-1"
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
              </div>
            </section>
          );
        })}
      </div>

      <Pagination
        currentPage={categoryPage}
        totalPages={totalCategoryPages}
        setCurrentPage={setCategoryPage}
      />
    </>
  );
};

export default CategorySection;