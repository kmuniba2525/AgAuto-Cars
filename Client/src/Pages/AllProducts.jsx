import React, { useEffect, useMemo, useState } from "react";
import { useAppContext } from "../Context/AppContext";
import ProductCard from "../Components/ProductCard";

const PRODUCTS_PER_PAGE = 10;

const AllProducts = () => {
  const { products, searchQuery } = useAppContext();

  const [availability, setAvailability] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);

  // Get all categories from products automatically
  const categories = useMemo(() => {
    return [
      ...new Set(
        products
          .map((product) => product.category)
          .filter(Boolean)
      ),
    ];
  }, [products]);

  // Main filtering + sorting
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (searchQuery?.trim()) {
      result = result.filter((product) =>
        product.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Availability
    if (availability === "inStock") {
      result = result.filter((product) => product.inStock === true);
    }

    if (availability === "outOfStock") {
      result = result.filter((product) => product.inStock === false);
    }

    // Category
    if (selectedCategory !== "all") {
      result = result.filter(
        (product) =>
          product.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Sorting
    if (sortBy === "priceLow") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    }

    if (sortBy === "priceHigh") {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    }

    if (sortBy === "nameAZ") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    if (sortBy === "nameZA") {
      result.sort((a, b) => b.name.localeCompare(a.name));
    }

    if (sortBy === "newest") {
      result.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
    }

    return result;
  }, [products, searchQuery, availability, selectedCategory, sortBy]);

  // Reset pagination whenever user changes filters
  useEffect(() => {
    setCurrentPage(1);
  }, [availability, selectedCategory, sortBy, searchQuery]);

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const clearFilters = () => {
    setAvailability("all");
    setSelectedCategory("all");
    setSortBy("default");
    setCurrentPage(1);
  };

  // Default view = category-wise sections
  const showCategoryWise =
    selectedCategory === "all" &&
    availability === "all" &&
    !searchQuery?.trim() &&
    sortBy === "default";

  return (
    <div className="bg-gradient-to-b from-white via-[#f9fafb] to-[#f2f3f6] min-h-screen px-4 sm:px-6 lg:px-12 py-10">
      {/* Header */}
      <div className="max-w-[1600px] mx-auto mb-10 relative">
        {/* ambient glow accent */}
        <div className="pointer-events-none absolute -top-10 right-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />

        <p className="relative text-sm font-semibold tracking-[3px] text-primary uppercase flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
          Explore Collection
        </p>

        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-3 mt-3">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl lg:text-[2.75rem] tracking-tight text-gray-900">
              All Products
            </h1>
            <div className="h-[3px] w-16 mt-3 rounded-full bg-gradient-to-r from-primary to-primary/20" />
            <p className="text-gray-500 mt-3 text-[15px]">
              Find the products that match your style and needs.
            </p>
          </div>

          <p className="text-sm text-gray-500 bg-white border border-gray-200 rounded-full px-4 py-2 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] whitespace-nowrap">
            <span className="font-semibold text-gray-900">
              {filteredProducts.length}
            </span>{" "}
            Products available
          </p>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-7">
        {/* LEFT FILTER SIDEBAR */}
        <aside className="w-full lg:w-[280px] shrink-0">
          <div className="bg-white border border-gray-200/80 rounded-3xl shadow-[0_4px_24px_-6px_rgba(0,0,0,0.07)] overflow-hidden lg:sticky lg:top-24">
            {/* Sidebar Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
              <div>
                <p className="text-lg font-semibold text-gray-900">Filters</p>
                <p className="text-xs text-gray-500 mt-1">
                  Refine your search
                </p>
              </div>

              <button
                onClick={clearFilters}
                className="text-xs font-semibold text-primary border border-primary/30 rounded-full px-3 py-1.5 hover:bg-primary hover:text-white hover:border-primary transition-colors"
              >
                Reset All
              </button>
            </div>

            <div className="p-5 space-y-7">
              {/* Availability */}
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-3 tracking-wide">
                  Availability
                </p>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-3 cursor-pointer rounded-xl px-3 py-2.5 transition-colors hover:bg-gray-50">
                    <input
                      type="radio"
                      name="availability"
                      value="all"
                      checked={availability === "all"}
                      onChange={(e) => setAvailability(e.target.value)}
                      className="peer accent-primary w-4 h-4 cursor-pointer"
                    />
                    <span className="text-sm text-gray-600 peer-checked:text-gray-900 peer-checked:font-semibold transition-colors">
                      All Products
                    </span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer rounded-xl px-3 py-2.5 transition-colors hover:bg-gray-50">
                    <input
                      type="radio"
                      name="availability"
                      value="inStock"
                      checked={availability === "inStock"}
                      onChange={(e) => setAvailability(e.target.value)}
                      className="peer accent-primary w-4 h-4 cursor-pointer"
                    />
                    <span className="text-sm text-gray-600 peer-checked:text-gray-900 peer-checked:font-semibold transition-colors">
                      In Stock
                    </span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer rounded-xl px-3 py-2.5 transition-colors hover:bg-gray-50">
                    <input
                      type="radio"
                      name="availability"
                      value="outOfStock"
                      checked={availability === "outOfStock"}
                      onChange={(e) => setAvailability(e.target.value)}
                      className="peer accent-primary w-4 h-4 cursor-pointer"
                    />
                    <span className="text-sm text-gray-600 peer-checked:text-gray-900 peer-checked:font-semibold transition-colors">
                      Out of Stock
                    </span>
                  </label>
                </div>
              </div>

              {/* Categories */}
              <div className="border-t border-gray-100 pt-6">
                <p className="text-sm font-semibold text-gray-900 mb-3 tracking-wide">
                  Categories
                </p>

                <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                      selectedCategory === "all"
                        ? "bg-gradient-to-r from-primary to-primary/80 text-white font-medium shadow-md shadow-primary/20"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <span>All Categories</span>
                    <span
                      className={`text-xs rounded-full px-2 py-0.5 ${
                        selectedCategory === "all"
                          ? "bg-white/20"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {products.length}
                    </span>
                  </button>

                  {categories.map((category) => {
                    const categoryCount = products.filter(
                      (product) => product.category === category
                    ).length;

                    return (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                          selectedCategory === category
                            ? "bg-gradient-to-r from-primary to-primary/80 text-white font-medium shadow-md shadow-primary/20"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <span className="capitalize">{category}</span>
                        <span
                          className={`text-xs rounded-full px-2 py-0.5 ${
                            selectedCategory === category
                              ? "bg-white/20"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {categoryCount}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT PRODUCTS AREA */}
        <main className="flex-1 min-w-0">
          {/* Sort Bar */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-4 md:p-5 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-[0_2px_16px_-6px_rgba(0,0,0,0.07)]">
            <div>
              <p className="font-semibold text-gray-900">
                {showCategoryWise
                  ? "Browse by Category"
                  : `${filteredProducts.length} Products Found`}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Premium Products selected for you
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 whitespace-nowrap">
                Sort by:
              </span>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none border border-gray-200 rounded-xl pl-3.5 pr-9 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 bg-white cursor-pointer transition-colors"
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

          {/* CATEGORY-WISE DEFAULT VIEW */}
          {showCategoryWise ? (
            <div className="space-y-14">
              {categories.map((category) => {
                const categoryProducts = products.filter(
                  (product) => product.category === category
                );

                if (categoryProducts.length === 0) return null;

                return (
                  <section key={category}>
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <p className="text-xs tracking-[2px] uppercase text-primary font-semibold">
                          Collection
                        </p>
                        <h2 className="font-serif text-2xl text-gray-900 capitalize mt-1">
                          {category}
                        </h2>
                      </div>

                      <button
                        onClick={() => setSelectedCategory(category)}
                        className="group text-sm font-semibold text-primary border border-primary/30 rounded-full px-4 py-2 hover:bg-primary hover:text-white hover:border-primary transition-colors flex items-center gap-1.5"
                      >
                        View All
                        <span className="transition-transform group-hover:translate-x-0.5">
                          →
                        </span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
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
          ) : (
            <>
              {/* FILTERED PRODUCTS */}
              {paginatedProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
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
                <div className="bg-white border border-gray-200/80 rounded-3xl py-20 text-center shadow-[0_2px_16px_-6px_rgba(0,0,0,0.06)]">
                  <div className="mx-auto mb-5 w-14 h-14 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-6 h-6 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <circle cx="11" cy="11" r="7" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </div>
                  <p className="text-xl font-serif text-gray-900">
                    No Products found
                  </p>
                  <p className="text-gray-500 mt-2">
                    Try changing your selected filters.
                  </p>

                  <button
                    onClick={clearFilters}
                    className="mt-6 px-5 py-2.5 bg-primary text-white rounded-full text-sm font-medium hover:opacity-90 transition-opacity shadow-md shadow-primary/20"
                  >
                    Clear Filters
                  </button>
                </div>
              )}

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="flex flex-wrap items-center justify-center gap-2 mt-12">
                  <button
                    onClick={() =>
                      setCurrentPage((previous) =>
                        previous > 1 ? previous - 1 : previous
                      )
                    }
                    disabled={currentPage === 1}
                    className="px-4 py-2.5 border border-gray-200 rounded-full text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary hover:text-primary transition-colors"
                  >
                    ← Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => setCurrentPage(index + 1)}
                      className={`w-10 h-10 rounded-full text-sm font-medium transition-all duration-200 ${
                        currentPage === index + 1
                          ? "bg-primary text-white shadow-md shadow-primary/30 scale-105"
                          : "bg-white border border-gray-200 text-gray-700 hover:border-primary hover:text-primary"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}

                  <button
                    onClick={() =>
                      setCurrentPage((previous) =>
                        previous < totalPages ? previous + 1 : previous
                      )
                    }
                    disabled={currentPage === totalPages}
                    className="px-4 py-2.5 border border-gray-200 rounded-full text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary hover:text-primary transition-colors"
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
  );
};

export default AllProducts;