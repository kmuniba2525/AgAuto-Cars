import React, { useEffect, useMemo, useState } from "react";
import { useAppContext } from "../Context/AppContext";
import ProductCard from "../Components/ProductCard";

const PRODUCTS_PER_PAGE = 10;

export const CATEGORIES = [
  { text: "Primer & Grundfärg", path: "Primer" },
  { text: "Clearcoat", path: "Clearcoat" },
  { text: "Thinners & Degreaser", path: "Thinners" },
  { text: "Putty & Filler", path: "Putty" },
  { text: "Paint & Basecoat", path: "Paint" },
  { text: "Sanding & Abrasives", path: "Sanding" },
  { text: "Masking & Tape", path: "Masking" },
  { text: "Body Sealant", path: "Sealant" },
  { text: "Gloves & Safety", path: "Safety" },
  { text: "Ceramic & Car Care", path: "CarCare" },
  { text: "Aerosol Spray", path: "Aerosol" },
  { text: "Workwear", path: "Workwear" },
];

const AllProducts = () => {
  const { products, searchQuery } = useAppContext();

  const [availability, setAvailability] = useState("all");
  const [selectedCategories, setSelectedCategories] = useState([]); // now multi-select
  const [sortBy, setSortBy] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [categoryPage, setCategoryPage] = useState(1);
  // const [categoryPage, setCategoryPage] = useState(1);

const CATEGORIES_PER_PAGE = 3;

const categoryStart =
  (categoryPage - 1) * CATEGORIES_PER_PAGE;

const categoryEnd =
  categoryStart + CATEGORIES_PER_PAGE;

const paginatedCategories =
  CATEGORIES.slice(categoryStart, categoryEnd);

const totalCategoryPages =
  Math.ceil(CATEGORIES.length / CATEGORIES_PER_PAGE);

  // Toggle a single category in the multi-select list
  const toggleCategory = (path) => {
    setSelectedCategories((prev) =>
      prev.includes(path) ? prev.filter((c) => c !== path) : [...prev, path]
    );
  };

  const clearAllCategories = () => setSelectedCategories([]);

  

  // Main filtering + sorting
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchQuery?.trim()) {
      result = result.filter((p) =>
        p.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (availability === "inStock") result = result.filter((p) => p.inStock === true);
    if (availability === "outOfStock") result = result.filter((p) => p.inStock === false);

    if (selectedCategories.length > 0) {
      result = result.filter((p) =>
        selectedCategories.some(
          (cat) => p.category?.toLowerCase() === cat.toLowerCase()
        )
      );
    }

    if (sortBy === "priceLow") result.sort((a, b) => Number(a.price) - Number(b.price));
    if (sortBy === "priceHigh") result.sort((a, b) => Number(b.price) - Number(a.price));
    if (sortBy === "nameAZ") result.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === "nameZA") result.sort((a, b) => b.name.localeCompare(a.name));
    if (sortBy === "newest")
      result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    return result;
  }, [products, searchQuery, availability, selectedCategories, sortBy]);

  useEffect(() => {
    setCurrentPage(1);
    setCategoryPage(1);
  }, [availability, selectedCategories, sortBy, searchQuery]);

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const clearFilters = () => {
    setAvailability("all");
    setSelectedCategories([]);
    setSortBy("default");
    setCurrentPage(1);
  };

  const showCategoryWise =
    selectedCategories.length === 0 &&
    availability === "all" &&
    !searchQuery?.trim() &&
    sortBy === "default";

  const hasActiveFilters =
    selectedCategories.length > 0 || availability !== "all" || sortBy !== "default";

  // Sidebar content — shared between desktop sidebar and mobile drawer
  const FilterSidebar = ({ onClose }) => (
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
              aria-label="Close filters"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Scrollable body */}
      {/* <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6"> */}
      <div className="p-4 sm:p-5 space-y-6">
        {/* Availability */}
        <div>
          <p className="text-sm font-semibold text-gray-900 mb-3 tracking-wide uppercase text-xs">
            Availability
          </p>
          <div className="space-y-1">
            {[
              { value: "all", label: "All Products" },
              { value: "inStock", label: "In Stock" },
              { value: "outOfStock", label: "Out of Stock" },
            ].map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-3 cursor-pointer rounded-xl px-3 py-2.5 hover:bg-gray-50 transition-colors"
              >
                <input
                  type="radio"
                  name="availability"
                  value={opt.value}
                  checked={availability === opt.value}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="accent-primary w-4 h-4 cursor-pointer shrink-0"
                />
                <span
                  className={`text-sm transition-colors ${availability === opt.value
                      ? "text-gray-900 font-semibold"
                      : "text-gray-600"
                    }`}
                >
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Categories — checkboxes */}
        <div className="border-t border-gray-100 pt-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-900 tracking-wide uppercase">
              Categories
            </p>
            {selectedCategories.length > 0 && (
              <button
                onClick={clearAllCategories}
                className="text-xs text-primary font-medium hover:underline"
              >
                Clear ({selectedCategories.length})
              </button>
            )}
          </div>

          <div className="space-y-1">
            {CATEGORIES.map((cat) => {
              const count = products.filter(
                (p) => p.category?.toLowerCase() === cat.path.toLowerCase()
              ).length;
              const checked = selectedCategories.includes(cat.path);

              return (
                <label
                  key={cat.path}
                  className={`flex items-center gap-3 cursor-pointer rounded-xl px-3 py-2.5 transition-colors ${checked ? "bg-primary/5" : "hover:bg-gray-50"
                    }`}
                >
                  {/* Custom checkbox */}
                  <span
                    onClick={() => toggleCategory(cat.path)}
                    className={`shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${checked
                        ? "bg-primary border-primary"
                        : "border-gray-300 bg-white"
                      }`}
                  >
                    {checked && (
                      <svg
                        className="w-2.5 h-2.5 text-white"
                        viewBox="0 0 10 8"
                        fill="none"
                      >
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
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={checked}
                    onChange={() => toggleCategory(cat.path)}
                  />
                  <span
                    className={`text-sm flex-1 transition-colors ${checked ? "text-gray-900 font-semibold" : "text-gray-600"
                      }`}
                    onClick={() => toggleCategory(cat.path)}
                  >
                    {cat.text}
                  </span>
                  <span
                    className={`text-xs rounded-full px-2 py-0.5 shrink-0 ${checked
                        ? "bg-primary/10 text-primary font-semibold"
                        : "bg-gray-100 text-gray-500"
                      }`}
                  >
                    {count}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile footer apply button */}
      {onClose && (
        <div className="lg:hidden shrink-0 p-4 border-t border-gray-100 bg-white">
          <button
            onClick={onClose}
            className="w-full py-3 bg-primary text-white rounded-2xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-md shadow-primary/20"
          >
            Show {filteredProducts.length} Products
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-gradient-to-b from-white via-[#f9fafb] to-[#f2f3f6] min-h-screen">
      {/* Mobile filter drawer backdrop */}
      {mobileFilterOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileFilterOpen(false)}
        />
      )}

      {/* Mobile filter drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-[90vw] max-w-[380px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${mobileFilterOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <FilterSidebar onClose={() => setMobileFilterOpen(false)} />
      </div>

      <div className="px-4 sm:px-6 lg:px-10 xl:px-12 py-5 sm:py-8 lg:py-10">
        {/* Header */}
        <div className="max-w-[1600px] mx-auto mb-6 sm:mb-10 relative">
          <div className="pointer-events-none absolute -top-10 right-0 w-48 sm:w-72 h-48 sm:h-72 bg-primary/10 rounded-full blur-3xl" />

          <p className="relative text-xs font-semibold tracking-[3px] text-primary uppercase flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
            Explore Collection
          </p>

          <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mt-2 sm:mt-3">
            <div>
              <h1 className="font-serif text-[28px] sm:text-4xl lg:text-[3rem] leading-tight tracking-tight text-gray-900">
                All Products
              </h1>
              <div className="h-[3px] w-12 sm:w-16 mt-2 sm:mt-3 rounded-full bg-gradient-to-r from-primary to-primary/20" />
              <p className="text-gray-500 mt-2 sm:mt-3 text-sm sm:text-[15px]">
                Find the products that match your style and needs.
              </p>
            </div>

            <p className="
text-sm
text-gray-600
bg-white
border
border-gray-200
rounded-2xl
px-4
py-2.5
shadow-sm
">
              <span className="font-semibold text-gray-900">{filteredProducts.length}</span>{" "}
              Products available
            </p>
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-5 lg:gap-7">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-[260px] xl:w-[280px] shrink-0">
            <div className="bg-white border border-gray-200/80 rounded-3xl shadow-[0_4px_24px_-6px_rgba(0,0,0,0.07)] overflow-hidden lg:sticky lg:top-24 h-auto flex flex-col">
              <FilterSidebar />
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {/* Sort / Filter bar */}
            <div className="
bg-white
border
border-gray-200/80
rounded-3xl
p-4
sm:p-5
md:p-6
mb-6
shadow-lg
shadow-black/[0.03]
">
              <div className="flex items-center gap-3">
                {/* Mobile filter trigger */}
                <button
                  onClick={() => setMobileFilterOpen(true)}
                  className="lg:hidden
flex
items-center
justify-center
gap-2
px-4
py-3
rounded-2xl
border
border-gray-200
bg-gray-50
font-medium
 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-primary hover:text-primary transition-colors relative"
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

                <div>
                  <p className="font-semibold text-gray-900 text-sm sm:text-base">
                    {showCategoryWise
                      ? "Browse by Category"
                      : `${filteredProducts.length} Products Found`}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 hidden sm:block mt-0.5">
                    Premium products selected for you
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-sm text-gray-500 whitespace-nowrap">Sort:</span>
                <div className="relative flex-1 sm:flex-none">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full appearance-none border border-gray-200 rounded-xl pl-3 pr-8 py-2 sm:py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 bg-white cursor-pointer transition-colors"
                  >
                    <option value="default">Featured</option>
                    <option value="newest">Newest First</option>
                    <option value="priceLow">Price: Low to High</option>
                    <option value="priceHigh">Price: High to Low</option>
                    <option value="nameAZ">Name: A to Z</option>
                    <option value="nameZA">Name: Z to A</option>
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                    ▾
                  </span>
                </div>
              </div>
            </div>

            {/* Active filter chips */}
            {(selectedCategories.length > 0 || availability !== "all") && (
              <div className="flex flex-wrap gap-2 mb-4">
                {availability !== "all" && (
                  <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold rounded-full px-3 py-1.5">
                    {availability === "inStock" ? "In Stock" : "Out of Stock"}
                    <button
                      onClick={() => setAvailability("all")}
                      className="hover:text-primary/60 transition-colors"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {selectedCategories.map((cat) => {
                  const found = CATEGORIES.find((c) => c.path === cat);
                  return (
                    <span
                      key={cat}
                      className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold rounded-full px-3 py-1.5"
                    >
                      {found?.text || cat}
                      <button
                        onClick={() => toggleCategory(cat)}
                        className="hover:text-primary/60 transition-colors"
                      >
                        ✕
                      </button>
                    </span>
                  );
                })}
                <button
                  onClick={clearFilters}
                  className="text-xs text-gray-500 font-medium hover:text-gray-800 px-2 py-1.5 underline underline-offset-2"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Category-wise default view */}
            {showCategoryWise ? (
              <>
                <div className="space-y-12 sm:space-y-16">
                  {paginatedCategories.map((cat) => {
                    const categoryProducts = products.filter(
                      (p) =>
                        p.category?.toLowerCase() ===
                        cat.path.toLowerCase()
                    );

                    if (categoryProducts.length === 0)
                      return null;

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
                              setSelectedCategories([
                                cat.path,
                              ])
                            }
                            className="
                              group
                              text-xs
                              sm:text-sm
                              font-semibold
                              rounded-full
                              px-4
                              py-2
                              shadow-sm
                              hover:shadow-md
                              text-primary
                              border
                              border-primary/30
                              hover:bg-primary
                              hover:text-white
                              hover:border-primary
                              transition-colors
                              flex
                              items-center
                              gap-1
                            "
                          >
                            View All

                            <span className="transition-transform group-hover:translate-x-0.5">
                              →
                            </span>
                          </button>
                        </div>

                        <div className="
    grid
    grid-cols-1
    sm:grid-cols-2
    lg:grid-cols-3
    xl:grid-cols-4
    gap-5
    sm:gap-6
  ">
                          {categoryProducts.slice(0, 4).map((product) => (
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

                {/* Category Pagination */}
                {totalCategoryPages > 1 && (
                  <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-8 sm:mt-12">
                    <button
                      onClick={() => setCategoryPage((p) => Math.max(p - 1, 1))}
                      disabled={categoryPage === 1}
                      className="px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-full text-xs sm:text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary hover:text-primary transition-colors"
                    >
                      ← Prev
                    </button>

                    {Array.from({ length: totalCategoryPages }, (_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCategoryPage(i + 1)}
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${categoryPage === i + 1
                            ? "bg-primary text-white shadow-md shadow-primary/30 scale-105"
                            : "bg-white border border-gray-200 text-gray-700 hover:border-primary hover:text-primary"
                          }`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      onClick={() => setCategoryPage((p) => Math.min(p + 1, totalCategoryPages))}
                      disabled={categoryPage === totalCategoryPages}
                      className="px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-full text-xs sm:text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary hover:text-primary transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Filtered products grid */}
                {paginatedProducts.length > 0 ? (
                  <div className="
grid
grid-cols-1
sm:grid-cols-2
lg:grid-cols-3
xl:grid-cols-4
gap-5
sm:gap-6
">
                    {paginatedProducts.map((product) => (
                      <div
                        key={product._id}
                        className="transition-transform duration-300 hover:-translate-y-1"
                      >
                        <ProductCard product={product} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="
                bg-white
border
border-gray-200/80
rounded-[32px]
px-6
py-16
sm:px-10
sm:py-20
text-center
shadow-lg
shadow-black/[0.03]
shadow-[0_2px_16px_-6px_rgba(0,0,0,0.06)]">
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
                    <p className="text-lg sm:text-xl font-serif text-gray-900">No Products Found</p>
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
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                
  <div className="w-full flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-8 sm:mt-12 lg:-ml-[140px]">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-full text-xs sm:text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary hover:text-primary transition-colors"
                    >
                      ← Prev
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${currentPage === i + 1
                            ? "bg-primary text-white shadow-md shadow-primary/30 scale-105"
                            : "bg-white border border-gray-200 text-gray-700 hover:border-primary hover:text-primary"
                          }`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-full text-xs sm:text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary hover:text-primary transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AllProducts;
