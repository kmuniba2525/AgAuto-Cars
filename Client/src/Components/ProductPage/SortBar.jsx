import React from "react";

const SortBar = ({
  filteredProducts,
  sortBy,
  setSortBy,
  hasActiveFilters,
  selectedCategories,
  availability,
  setMobileFilterOpen,
  categories,
  toggleCategory,
  clearFilters,
}) => {
  return (
    <div className="mb-6 space-y-3">
      {/* Main Sort Bar */}
      <div className="bg-white border border-gray-200/80 rounded-3xl px-4 sm:px-5 py-3 shadow-lg shadow-black/[0.03] flex items-center justify-between gap-3">
        {/* Left Side */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-700 hover:border-primary hover:text-primary transition-colors relative"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M7 10h10M11 16h2" />
            </svg>
            Filters
            {hasActiveFilters && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {selectedCategories.length + (availability !== "all" ? 1 : 0)}
              </span>
            )}
          </button>

          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-800">{filteredProducts.length}</span>{" "}
            Products Found
          </p>
        </div>

        {/* Right Side */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all cursor-pointer hover:border-gray-300"
          >
            <option value="default">Sort: Default</option>
            <option value="priceLow">Price: Low → High</option>
            <option value="priceHigh">Price: High → Low</option>
            <option value="nameAZ">Name: A → Z</option>
            <option value="nameZA">Name: Z → A</option>
            <option value="newest">Newest First</option>
          </select>

          <svg
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Active Filter Tags */}
      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 px-1">
          {selectedCategories.map((path) => {
            const cat = categories?.find((c) => c.path === path);
            return (
              <button
                key={path}
                onClick={() => toggleCategory(path)}
                className="flex items-center gap-2 bg-slate-800 text-white text-sm font-medium px-3 py-1.5 rounded-full hover:bg-black transition-colors"
              >
                {cat?.text || path}
                <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-xs leading-none">
                  ✕
                </span>
              </button>
            );
          })}

          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-800 underline underline-offset-2 transition-colors"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};

export default SortBar;