import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAppContext } from "../Context/AppContext";
import { Link, useParams } from "react-router-dom";
import ProductCard from "../Components/ProductCard";
import AddReview from "../Components/AddReview";
import DOMPurify from "dompurify";
import { FaStar } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { getLocalizedText } from "../utils/getLocalizedText";

const ProductDetail = () => {
  const { t, i18n } = useTranslation();
  const { currency, addToCart, products, navigate, axios, user } =
    useAppContext();

  const { id } = useParams();

  const [relatedProducts, setRelatedProducts] = useState([]);
  const [thumbnail, setThumbnail] = useState(null);
  const [localProduct, setLocalProduct] = useState(null);

  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const reviewsRef = useRef(null);

  const product = products.find((item) => item._id?.toString() === id);

  // ✅ resolve bilingual name/description for the active language
  const localizedName = getLocalizedText(product?.name, i18n.language);
  const localizedDescription = getLocalizedText(product?.description, i18n.language);

  const variants = useMemo(() => {
    if (!product) return [];
    return product.variants?.length > 0
      ? product.variants
      : [
          {
            label: "Standard",
            price: product.price,
            offerPrice: product.offerPrice,
            stock: product.stock,
          },
        ];
  }, [product]);

  const discountPercent =
    selectedVariant && selectedVariant.price > selectedVariant.offerPrice
      ? Math.round(
          ((selectedVariant.price - selectedVariant.offerPrice) /
            selectedVariant.price) *
            100
        )
      : 0;

  const rating = localProduct?.rating || product?.rating || 0;

  useEffect(() => {
    if (product) {
      setThumbnail(product.image?.[0] || null);
      setLocalProduct(product);

      const filtered = products.filter(
        (item) =>
          item.category === product.category && item._id !== product._id
      );

      setRelatedProducts(filtered.slice(0, 5));
    }
  }, [products, product]);

  useEffect(() => {
    if (variants.length > 0) {
      setSelectedVariant(variants[0]);
      setQuantity(1);
    }
  }, [variants]);

  const scrollToReviews = () => {
    reviewsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (!product || !selectedVariant) {
    return <p className="p-6">{t("product_detail.loading")}</p>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
      {/* BREADCRUMB */}
      <p className="text-xs text-gray-400 font-medium tracking-wide mb-6">
        <Link to="/" className="hover:text-gray-700 transition-colors">
          {t("product_detail.home")}
        </Link>
        {" / "}
        <Link
          to="/products"
          className="hover:text-gray-700 transition-colors"
        >
          {t("product_detail.products")}
        </Link>
        {" / "}
        <Link
          to={`/products/${product.category?.toLowerCase()}`}
          className="hover:text-gray-700 transition-colors"
        >
          {product.category}
        </Link>
        {" / "}
        <span className="text-gray-600">{localizedName}</span>
      </p>

      {/* PRODUCT SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
            {discountPercent > 0 && (
              <span className="absolute top-3 left-3 z-10 bg-accent text-white text-xs font-bold px-2.5 py-1 rounded">
                -{discountPercent}%
              </span>
            )}

            <img
              src={thumbnail || product.image?.[0]}
              alt={localizedName}
              className="w-full h-full object-cover"
            />
          </div>

          {product.image?.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {product.image.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setThumbnail(img)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-colors ${
                    thumbnail === img
                      ? "border-primary"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <img
                    src={img}
                    alt={`thumb-${index}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
            {product.category}
          </p>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-snug">
            {localizedName}
          </h1>

          {/* RATING */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  className={`text-sm ${
                    star <= Math.round(rating)
                      ? "text-accent"
                      : "text-gray-200"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={scrollToReviews}
              className="text-xs text-gray-500 hover:text-accent transition-colors underline underline-offset-2"
            >
              {t("product_detail.reviews_count", { count: localProduct?.numReviews || 0 })}
            </button>
          </div>

          {/* PRICE */}
          <div className="flex items-baseline gap-3 mt-4">
            {selectedVariant.price > selectedVariant.offerPrice && (
              <span className="text-gray-400 line-through text-base">
                {currency}
                {selectedVariant.price}
              </span>
            )}

            <span className="text-2xl sm:text-3xl font-bold text-gray-900">
              {currency}
              {selectedVariant.offerPrice}
            </span>

            {discountPercent > 0 && (
              <span className="text-xs font-bold text-white bg-accent px-2 py-1 rounded">
                -{discountPercent}%
              </span>
            )}
          </div>

          <p className="text-xs text-gray-400 mt-1">{t("product_detail.inclusive_taxes")}</p>

          {/* AVAILABILITY */}
          <div className="flex items-center gap-2 mt-3 text-sm font-medium">
            <span
              className={`w-2 h-2 rounded-full ${
                selectedVariant.stock > 0 ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span
              className={
                selectedVariant.stock > 0
                  ? "text-green-700"
                  : "text-red-600"
              }
            >
              {selectedVariant.stock > 0
                ? t("product_detail.in_stock")
                : t("product_detail.out_of_stock")}
            </span>
          </div>

          <hr className="my-5 border-gray-100" />

          {/* DESCRIPTION */}
          <div
            className="text-sm text-gray-600 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(localizedDescription),
            }}
          />

          {/* SIZE + QUANTITY */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                {t("product_detail.size")}
              </label>

              <div className="relative">
                <select
                  value={selectedVariant.label}
                  onChange={(e) => {
                    const v = variants.find(
                      (item) => item.label === e.target.value
                    );
                    setSelectedVariant(v);
                    setQuantity(1);
                  }}
                  className="w-full appearance-none border border-gray-300 rounded-lg px-4 py-3 pr-10 text-sm font-medium text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                >
                  {variants.map((v) => (
                    <option
                      key={v.label}
                      value={v.label}
                      disabled={v.stock <= 0}
                    >
                      {v.label}
                      {v.stock <= 0
                        ? ` ${t("product_detail.out_of_stock_option")}`
                        : ` — ${currency}${v.offerPrice}`}
                    </option>
                  ))}
                </select>

                <svg
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                {t("product_detail.quantity")}
              </label>

              <div className="inline-flex items-center border border-gray-300 rounded-lg overflow-hidden h-[46px]">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-full flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors text-lg font-bold"
                >
                  −
                </button>
                <span className="w-10 text-center font-semibold text-gray-900 text-sm">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity((q) =>
                      Math.min(selectedVariant.stock || 1, q + 1)
                    )
                  }
                  className="w-10 h-full flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors text-lg font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              onClick={() => addToCart(product._id)}
              disabled={selectedVariant.stock <= 0}
              className="flex-1 py-3.5 rounded-lg font-semibold bg-primary text-white hover:bg-primary-dull transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t("product_detail.add_to_cart")}
            </button>

            <button
              onClick={() => {
                addToCart(product._id);
                navigate("/cart");
              }}
              disabled={selectedVariant.stock <= 0}
              className="flex-1 py-3.5 rounded-lg font-semibold border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t("product_detail.buy_now")}
            </button>
          </div>

          {/* DELIVERY NOTE */}
          <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
            <TruckIcon />
            <span>{t("product_detail.delivery_note")}</span>
          </div>

          {/* TRUST ROW */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-5 pt-5 border-t border-gray-100 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <LockIcon /> {t("product_detail.secure_payment")}
            </span>
            <span className="flex items-center gap-1.5">
              <ReturnIcon /> {t("product_detail.easy_returns")}
            </span>
          </div>
        </div>
      </div>

      {/* RELATED PRODUCTS */}
      {relatedProducts.filter((item) => item.inStock).length > 0 && (
        <div className="mt-20">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 whitespace-nowrap">
              {t("product_detail.you_may_also_like")}
            </h2>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {relatedProducts
              .filter((item) => item.inStock)
              .map((item, index) => (
                <ProductCard key={index} product={item} />
              ))}
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => {
                navigate("/products");
                scrollTo(0, 0);
              }}
              className="mt-10 px-10 py-3 rounded-full border-2 border-gray-900 text-gray-900 font-bold text-sm hover:bg-gray-900 hover:text-white transition-colors"
            >
              {t("product_detail.see_more")}
            </button>
          </div>
        </div>
      )}

      {/* REVIEWS */}
      <div ref={reviewsRef} className="mt-20 max-w-3xl scroll-mt-24">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
          {t("product_detail.customer_reviews")}
        </h2>

        {/* REVIEW FORM — now its own component */}
        <AddReview
          product={localProduct}
          user={user}
          axios={axios}
          onReviewSubmitted={(updatedProduct) => setLocalProduct(updatedProduct)}
        />

        {/* REVIEWS LIST */}
        <div className="mt-8 space-y-4">
          {Array.isArray(localProduct?.reviews) &&
          localProduct.reviews.length > 0 ? (
            [...localProduct.reviews]
              .sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
              )
              .map((review) => (
                <div
                  key={review._id}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/90 text-white flex items-center justify-center text-sm font-bold">
                        {review.name?.charAt(0)?.toUpperCase()}
                      </div>

                      <div>
                        <p className="font-semibold text-sm text-gray-900">
                          {review.name}
                        </p>

                        <div className="flex items-center gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <FaStar
                              key={star}
                              className={`text-xs ${
                                star <= review.rating
                                  ? "text-accent"
                                  : "text-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <span className="text-xs text-gray-400">
                      {review.createdAt
                        ? new Date(review.createdAt).toLocaleDateString()
                        : ""}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mt-3 leading-relaxed">
                    {review.comment}
                  </p>
                </div>
              ))
          ) : (
            <p className="text-gray-400 text-sm mt-4">{t("product_detail.no_reviews_yet")}</p>
          )}
        </div>
      </div>
    </div>
  );
};

const LockIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
    <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 10V7a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

const TruckIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
    <path d="M3 7h11v8H3V7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M14 10h4l3 3v2h-7v-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <circle cx="7" cy="17" r="1.6" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="17" cy="17" r="1.6" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const ReturnIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
    <path d="M4 9a8 8 0 1114 5.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M4 4v5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default ProductDetail;
