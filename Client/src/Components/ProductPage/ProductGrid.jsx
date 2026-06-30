import React from "react";
import ProductCard from "../ProductCard";
import Pagination from "./Pagination";

const ProductGrid = ({
  paginatedProducts,
  currentPage,
  totalPages,
  setCurrentPage,
  clearFilters,
}) => {
  // No Products Found
  if (paginatedProducts.length === 0) {
    return (
      <div className="bg-white border border-gray-200/80 rounded-[32px] px-6 py-16 sm:px-10 sm:py-20 text-center shadow-lg shadow-black/[0.03] shadow-[0_2px_16px_-6px_rgba(0,0,0,0.06)]">
        <div className="mx-auto mb-4 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        <p className="text-lg sm:text-xl font-serif text-gray-900">
          No Products Found
        </p>

        <p className="text-gray-500 mt-2 text-sm px-6">
          Try changing your selected filters.
        </p>

        <button
          onClick={clearFilters}
          className="mt-5 px-5 py-2.5 bg-primary text-white rounded-full text-sm font-medium hover:opacity-90 transition-opacity shadow-md shadow-primary/20"
        >
          Clear Filters
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Products */}
     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {paginatedProducts.map((product) => (
          <div
            key={product._id}
            className="transition-transform duration-300  hover:-translate-y-1"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />
    </>
  );
};

export default ProductGrid;