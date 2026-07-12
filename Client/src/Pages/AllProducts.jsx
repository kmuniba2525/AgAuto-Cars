import React, { useEffect, useMemo, useState } from "react";
import { useAppContext } from "../Context/AppContext";
import FilterSidebar from "../Components/ProductPage/FilterSidebar";
import SortBar from "../Components/ProductPage/SortBar";
import ProductGrid from "../Components/ProductPage/ProductGrid";
import { useTranslation } from "react-i18next";
import { getLocalizedText } from "../utils/getLocalizedText";

const PRODUCTS_PER_PAGE = 24;

export const CATEGORIES_RAW = [
  { key: "categories.primer", path: "Primer" },
  { key: "categories.clearcoat", path: "Clearcoat" },
  { key: "categories.thinners", path: "Thinners" },
  { key: "categories.putty", path: "Putty" },
  { key: "categories.paint", path: "Paint" },
  { key: "categories.sanding", path: "Sanding" },
  { key: "categories.masking", path: "Masking" },
  { key: "categories.sealant", path: "Sealant" },
  { key: "categories.safety", path: "Safety" },
  { key: "categories.carcare", path: "CarCare" },
  { key: "categories.aerosol", path: "Aerosol" },
  { key: "categories.workwear", path: "Workwear" },
];

const AllProducts = () => {
  const { t, i18n } = useTranslation();
  const { products, searchQuery } = useAppContext();

  const [availability, setAvailability] = useState("all");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortBy, setSortBy] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const CATEGORIES = useMemo(
    () => CATEGORIES_RAW.map((c) => ({ text: t(c.key), path: c.path })),
    [t]
  );

  const toggleCategory = (path) => {
    setSelectedCategories((prev) =>
      prev.includes(path)
        ? prev.filter((c) => c !== path)
        : [...prev, path]
    );
  };

  const clearAllCategories = () => setSelectedCategories([]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // ✅ CHANGED: name is now { en, pt } — search across both languages
    // regardless of the active UI language, so users find products even
    // if they type in the "other" language than the one they're browsing in.
    if (searchQuery?.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((product) => {
        const nameEn = (product.name?.en || (typeof product.name === "string" ? product.name : "")).toLowerCase();
        const namePt = (product.name?.pt || "").toLowerCase();
        return nameEn.includes(query) || namePt.includes(query);
      });
    }

    if (availability === "inStock") {
      result = result.filter((product) => product.inStock === true);
    }

    if (availability === "outOfStock") {
      result = result.filter((product) => product.inStock === false);
    }

    if (selectedCategories.length > 0) {
      result = result.filter((product) =>
        selectedCategories.some(
          (category) =>
            product.category?.toLowerCase() === category.toLowerCase()
        )
      );
    }

    // ✅ CHANGED: name sorting now uses the localized display name for the
    // active language, via the shared getLocalizedText helper.
    if (sortBy === "priceLow") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    }
    if (sortBy === "priceHigh") {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    }
    if (sortBy === "nameAZ") {
      result.sort((a, b) =>
        getLocalizedText(a.name, i18n.language).localeCompare(getLocalizedText(b.name, i18n.language))
      );
    }
    if (sortBy === "nameZA") {
      result.sort((a, b) =>
        getLocalizedText(b.name, i18n.language).localeCompare(getLocalizedText(a.name, i18n.language))
      );
    }
    if (sortBy === "newest") {
      result.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
    }

    return result;
  }, [products, searchQuery, availability, selectedCategories, sortBy, i18n.language]);

  useEffect(() => {
    setCurrentPage(1);
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

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    availability !== "all" ||
    sortBy !== "default";

  return (
    <div className="bg-gradient-to-b from-white via-[#f9fafb] to-[#f2f3f6] min-h-screen">
      {/* Mobile Backdrop */}
      {mobileFilterOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileFilterOpen(false)}
        />
      )}

      {/* Mobile Filter Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-[90vw] max-w-[380px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${
          mobileFilterOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <FilterSidebar
          products={products}
          categories={CATEGORIES}
          availability={availability}
          setAvailability={setAvailability}
          selectedCategories={selectedCategories}
          toggleCategory={toggleCategory}
          clearAllCategories={clearAllCategories}
          clearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
          filteredProducts={filteredProducts}
          onClose={() => setMobileFilterOpen(false)}
        />
      </div>

      <div className="px-4 sm:px-6 lg:px-10 xl:px-12 py-5 sm:py-8 lg:py-10">
        {/* Header */}
        <div className="max-w-[1600px] mx-auto mb-6 sm:mb-10 relative">
          <div className="pointer-events-none absolute -top-10 right-0 w-48 sm:w-72 h-48 sm:h-72 bg-primary/10 rounded-full blur-3xl" />

          <p className="relative text-xs font-semibold tracking-[3px] text-primary uppercase flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
            {t("all_products.explore_collection")}
          </p>

          <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mt-2 sm:mt-3">
            <div>
              <h1 className="font-serif text-[28px] sm:text-4xl lg:text-[3rem] leading-tight tracking-tight text-gray-900">
                {t("all_products.title")}
              </h1>

              <div className="h-[3px] w-12 sm:w-16 mt-2 sm:mt-3 rounded-full bg-gradient-to-r from-primary to-primary/20" />

              <p className="text-gray-500 mt-2 sm:mt-3 text-sm sm:text-[15px]">
                {t("all_products.subtitle")}
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-5 lg:gap-7">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-[260px] xl:w-[280px] shrink-0">
            <div className="bg-white border border-gray-200/80 rounded-3xl shadow-[0_4px_24px_-6px_rgba(0,0,0,0.07)] overflow-hidden lg:sticky lg:top-24">
              <FilterSidebar
                products={products}
                categories={CATEGORIES}
                availability={availability}
                setAvailability={setAvailability}
                selectedCategories={selectedCategories}
                toggleCategory={toggleCategory}
                clearAllCategories={clearAllCategories}
                clearFilters={clearFilters}
                hasActiveFilters={hasActiveFilters}
                filteredProducts={filteredProducts}
              />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <SortBar
              filteredProducts={filteredProducts}
              sortBy={sortBy}
              setSortBy={setSortBy}
              hasActiveFilters={hasActiveFilters}
              selectedCategories={selectedCategories}
              availability={availability}
              setMobileFilterOpen={setMobileFilterOpen}
              categories={CATEGORIES}
              toggleCategory={toggleCategory}
              clearFilters={clearFilters}
            />

            <ProductGrid
              paginatedProducts={paginatedProducts}
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
              clearFilters={clearFilters}
            />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AllProducts;