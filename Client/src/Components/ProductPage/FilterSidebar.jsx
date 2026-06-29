import React from "react";

const FilterSidebar = ({
  products,
  categories,
  availability,
  setAvailability,
  selectedCategories,
  toggleCategory,
  clearAllCategories,
  clearFilters,
  hasActiveFilters,
  filteredProducts,
  onClose,
}) => {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white shrink-0">
        <div>
          <p className="text-base sm:text-lg font-semibold text-gray-900">Filters</p>
          <p className="text-xs text-gray-500 mt-0.5">Refine your search</p>
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs font-semibold text-primary border border-primary/30 rounded-full px-3 py-1.5 hover:bg-primary hover:text-white hover:border-primary transition-colors"
            >
              Reset All
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 sm:p-5 space-y-6 overflow-y-auto">
        {/* Availability */}
        <div>
          <p className="text-xs font-semibold text-gray-900 mb-3 tracking-wide uppercase">
            Availability
          </p>
          <div className="space-y-1">
            {[
              { value: "all", label: "All Products" },
              { value: "inStock", label: "In Stock" },
              { value: "outOfStock", label: "Out of Stock" },
            ].map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 cursor-pointer rounded-xl px-3 py-2.5 hover:bg-gray-50 transition-colors"
              >
                <input
                  type="radio"
                  name="availability"
                  value={option.value}
                  checked={availability === option.value}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="accent-primary w-4 h-4"
                />
                <span
                  className={`text-sm ${
                    availability === option.value
                      ? "font-semibold text-gray-900"
                      : "text-gray-600"
                  }`}
                >
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="border-t border-gray-100 pt-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wide">
              Categories
            </p>
            {selectedCategories.length > 0 && (
              <button
                onClick={clearAllCategories}
                className="text-xs text-primary hover:underline"
              >
                Clear ({selectedCategories.length})
              </button>
            )}
          </div>

          <div className="space-y-1">
            {categories.map((cat) => {
              const checked = selectedCategories.includes(cat.path);
              const count = products.filter(
                (p) => p.category?.toLowerCase() === cat.path.toLowerCase()
              ).length;

              return (
                <div
                  key={cat.path}
                  onClick={() => toggleCategory(cat.path)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer transition-colors ${
                    checked ? "bg-primary/5" : "hover:bg-gray-50"
                  }`}
                >
                  {/* Custom Checkbox */}
                  <span
                    className={`w-4 h-4 border-2 rounded flex items-center justify-center shrink-0 transition-all ${
                      checked ? "bg-primary border-primary" : "border-gray-300"
                    }`}
                  >
                    {checked && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 8">
                        <path
                          d="M1 4l3 3 5-6"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>

                  <span
                    className={`flex-1 text-sm ${
                      checked ? "font-semibold text-gray-900" : "text-gray-600"
                    }`}
                  >
                    {cat.text}
                  </span>

                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      checked
                        ? "bg-primary/10 text-primary font-semibold"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Footer */}
      {onClose && (
        <div className="lg:hidden p-4 border-t border-gray-100 bg-white">
          <button
            onClick={onClose}
            className="w-full py-3 bg-primary text-white rounded-2xl text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Show {filteredProducts.length} Products
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterSidebar;