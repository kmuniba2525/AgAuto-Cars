import React from "react";

const Pagination = ({
  currentPage,
  totalPages,
  setCurrentPage,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="w-full flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-8 sm:mt-12">
      {/* Previous Button */}
      <button
        onClick={() =>
          setCurrentPage((prev) => Math.max(prev - 1, 1))
        }
        disabled={currentPage === 1}
        className="px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-full text-xs sm:text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary hover:text-primary transition-colors"
      >
        ← Prev
      </button>

      {/* Page Numbers */}
      {Array.from({ length: totalPages }, (_, index) => (
        <button
          key={index + 1}
          onClick={() => setCurrentPage(index + 1)}
          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
            currentPage === index + 1
              ? "bg-primary text-white shadow-md shadow-primary/30 scale-105"
              : "bg-white border border-gray-200 text-gray-700 hover:border-primary hover:text-primary"
          }`}
        >
          {index + 1}
        </button>
      ))}

      {/* Next Button */}
      <button
        onClick={() =>
          setCurrentPage((prev) =>
            Math.min(prev + 1, totalPages)
          )
        }
        disabled={currentPage === totalPages}
        className="px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-full text-xs sm:text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary hover:text-primary transition-colors"
      >
        Next →
      </button>
    </div>
  );
};

export default Pagination;