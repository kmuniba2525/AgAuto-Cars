import React from "react";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  return (
    <div className="mb-6 space-y-3">
      {/* Main Sort Bar */}
      <div className="bg-white border border-gray-200/80 rounded-2xl px-4 sm:px-5 py-3 shadow-lg shadow-black/[0.03] flex items-center justify-between gap-3">
        {/* Left Side */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all cursor-pointer hover:border-gray-300"
            >
              <option value="default">{t("sort_bar.sort_default")}</option>
              <option value="priceLow">{t("sort_bar.price_low_high")}</option>
              <option value="priceHigh">{t("sort_bar.price_high_low")}</option>
              <option value="nameAZ">{t("sort_bar.name_az")}</option>
              <option value="nameZA">{t("sort_bar.name_za")}</option>
              <option value="newest">{t("sort_bar.newest_first")}</option>
            </select>

            <svg
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Right Side */}
        <button
          onClick={() => setMobileFilterOpen(true)}
          className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-700 hover:border-primary hover:text-primary transition-colors relative shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M7 10h10M11 16h2" />
          </svg>
          {t("sort_bar.filters")}
          {hasActiveFilters && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {selectedCategories.length + (availability !== "all" ? 1 : 0)}
            </span>
          )}
        </button>
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
                className="flex items-center gap-2 bg-slate-800 text-white text-xs sm:text-sm font-medium pl-3 pr-2 py-1.5 rounded-full hover:bg-black transition-colors max-w-[160px] sm:max-w-none"
              >
                <span className="truncate">{cat?.text || path}</span>
                <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-xs leading-none shrink-0">
                  ✕
                </span>
              </button>
            );
          })}

          <button
            onClick={clearFilters}
            className="text-xs sm:text-sm text-gray-500 hover:text-gray-800 underline underline-offset-2 transition-colors shrink-0"
          >
            {t("sort_bar.clear_all")}
          </button>
        </div>
      )}
    </div>
  );
};

export default SortBar;