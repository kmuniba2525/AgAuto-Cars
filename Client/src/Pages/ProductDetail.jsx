import React, { useEffect, useState } from "react";
import { useAppContext } from "../Context/AppContext";
import { Link, useParams } from "react-router-dom";
import ProductCard from "../Components/ProductCard";
import DOMPurify from "dompurify";
import { FaStar } from "react-icons/fa";
import toast from "react-hot-toast";

const ProductDetail = () => {
  const {
    currency,
    addToCart,
    products,
    navigate,
    axios,
    user
  } = useAppContext();

  const { id } = useParams();

  const [ratingInput, setRatingInput] =
    useState(5);

  const [comment, setComment] =
    useState("");

  const [existingReview, setExistingReview] =
    useState(null);

  const [relatedProducts, setRelatedProducts] =
    useState([]);

  const [thumbnail, setThumbnail] =
    useState(null);

  const [localProduct, setLocalProduct] =
    useState(null);

  // =========================
  // FIND PRODUCT
  // =========================

  const product = products.find(
    (item) =>
      item._id?.toString() === id
  );

  // =========================
  // PRODUCT RATING
  // =========================

  const rating =
    localProduct?.rating ||
    product?.rating ||
    0;

  // =========================
  // LOAD PRODUCT
  // =========================

  useEffect(() => {
    if (product) {

      setThumbnail(
        product.image?.[0] || null
      );

      setLocalProduct(product);

      const filtered = products.filter(
        (item) =>
          item.category ===
            product.category &&
          item._id !== product._id
      );

      setRelatedProducts(
        filtered.slice(0, 5)
      );
    }
  }, [products, product]);

  // =========================
  // LOAD USER REVIEW
  // =========================

  // =========================
// LOAD USER REVIEW
// =========================

useEffect(() => {

  if (
    localProduct?.reviews &&
    user
  ) {

    const userReview =
      localProduct.reviews.find(
        (review) =>
          review.user?.toString() ===
          user.id
      );

    if (userReview) {

      setExistingReview(userReview);

      setRatingInput(userReview.rating);

      setComment(userReview.comment);

    } else {

      setExistingReview(null);

      setRatingInput(5);

      setComment("");
    }
  }

}, [localProduct, user]);

  // =========================
  // SUBMIT REVIEW
  // =========================

  const submitReview = async () => {
//  console.log("USER:", user);
  // console.log("PRODUCT:", product);
    try {

      // LOGIN CHECK
console.log("LOGIN CHECK:", !user);
      if (!user) {
  return toast.error("Please login first");
}

      // COMMENT CHECK

      if (!comment.trim()) {
        return toast.error(
          "Comment is required"
        );
      }

      const { data } =
        await axios.post(
          "/api/product/review",
          {
            productId: product._id,
            rating: ratingInput,
            comment,
          },
            {
    withCredentials: true,
  }

        );

      if (data.success) {

        toast.success(
          data.message
        );

        // UPDATE UI

        if (data.product) {

          setLocalProduct(
            data.product
          );

          // FIND UPDATED REVIEW
// FIND UPDATED REVIEW

const userReview =
  data.product.reviews.find(
    (review) =>
      review.user?.toString() ===
      user.id
  );

setExistingReview(userReview);
        }

      } else {
        toast.error(
          data.message
        );
      }

    } catch (error) {

      console.log(error);

      toast.error(
        error.response?.data?.message ||
        error.message
      );
    }
  };

  // =========================
  // LOADING
  // =========================

  if (!product) {
    return (
      <p className="p-6">
        Loading...
      </p>
    );
  }

  return (
    <div className="m-16">

      {/* ========================= */}
      {/* BREADCRUMB */}
      {/* ========================= */}

      <p className="text-sm">

        <Link
          to="/"
          className="hover:underline"
        >
          Home
        </Link>

        {" / "}

        <Link
          to="/products"
          className="hover:underline"
        >
          Products
        </Link>

        {" / "}

        <Link
          to={`/products/${product.category?.toLowerCase()}`}
          className="hover:underline"
        >
          {product.category}
        </Link>

        {" / "}

        <span className="text-primary">
          {product.name}
        </span>

      </p>

      {/* ========================= */}
      {/* PRODUCT SECTION */}
      {/* ========================= */}

      <div className="flex flex-col md:flex-row gap-16 mt-4">

        {/* LEFT */}

        <div className="flex gap-3">

          {/* THUMBNAILS */}

          <div className="flex flex-col gap-3">

            {product.image?.map(
              (img, index) => (
                <div
                  key={index}
                  onClick={() =>
                    setThumbnail(img)
                  }
                  className="border max-w-24 border-gray-500/30 rounded overflow-hidden cursor-pointer"
                >
                  <img
                    src={img}
                    alt={`thumb-${index}`}
                  />
                </div>
              )
            )}

          </div>

          {/* MAIN IMAGE */}

          <div className="border border-gray-500/30 rounded overflow-hidden aspect-square w-[400px]">

            <img
              src={
                thumbnail ||
                product.image?.[0]
              }
              alt={product.name}
              className="w-full h-full object-cover"
            />

          </div>
        </div>

        {/* RIGHT */}

        <div className="text-sm w-full md:w-1/2">

          {/* PRODUCT NAME */}

          <h1 className="text-3xl font-medium">
            {product.name}
          </h1>

          {/* RATING */}

          <div className="flex items-center gap-1 mt-2">

            {[1, 2, 3, 4, 5].map(
              (star) => (
                <FaStar
                  key={star}
                  className={`text-lg ${
                    star <=
                    Math.round(rating)
                      ? "text-red-600"
                      : "text-gray-300"
                  }`}
                />
              )
            )}

            <p className="text-base ml-2">
              (
              {localProduct?.rating?.toFixed(
                1
              ) || "0.0"}
              )
            </p>

            <p className="text-base text-gray-500">
              (
              {localProduct?.numReviews ||
                0}{" "}
              Reviews
              )
            </p>

          </div>

          {/* PRICE */}

          <div className="mt-6">

            <p className="text-gray-500/70 line-through">
              MRP: {currency}
              {product.price}
            </p>

            <p className="text-2xl font-medium">
              {currency}
              {product.offerPrice}
            </p>

            <span className="text-gray-500/70">
              (inclusive of all taxes)
            </span>

          </div>

          {/* DESCRIPTION */}

          <div className="mt-6">

            <p className="text-lg font-medium text-gray-800">
              About Product
            </p>

            <div
              className="mt-3 text-gray-600 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html:
                  DOMPurify.sanitize(
                    typeof product.description ===
                      "string"
                      ? product.description
                      : ""
                  ),
              }}
            />

          </div>

          {/* BUTTONS */}

          <div className="flex items-center mt-10 gap-4 text-base">

            <button
              onClick={() =>
                addToCart(product._id)
              }
              className="w-full py-3.5 font-medium bg-gray-100 text-gray-800/80 hover:bg-gray-200 transition"
            >
              Add to Cart
            </button>

            <button
              onClick={() => {

                addToCart(
                  product._id
                );

                navigate("/cart");

              }}
              className="w-full py-3.5 font-medium bg-primary text-white hover:bg-primary-dull transition"
            >
              Buy Now
            </button>

          </div>
        </div>
      </div>

      {/* ========================= */}
      {/* REVIEW SECTION */}
      {/* ========================= */}

      <div className="mt-16 max-w-3xl">

        <h2 className="text-2xl text-center font-semibold">
          Customer Reviews
        </h2>

        {/* REVIEW FORM */}

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mt-5">

          <h3 className="text-base font-medium mb-3">

            {existingReview
              ? "Update Your Review"
              : "Write a Review"}

          </h3>

          {/* REVIEW NOTICE */}

          {existingReview && (
            <p className="text-sm text-primary mb-3">
              You already reviewed
              this product. You can
              edit it anytime.
            </p>
          )}

          {/* STAR INPUT */}

          <div className="flex items-center gap-2 mb-4">

            {[1, 2, 3, 4, 5].map(
              (star) => (
                <FaStar
                  key={star}
                  onClick={() =>
                    setRatingInput(
                      star
                    )
                  }
                  className={`cursor-pointer text-xl transition ${
                    star <=
                    ratingInput
                      ? "text-red-600 scale-110"
                      : "text-gray-300 hover:text-red-300"
                  }`}
                />
              )
            )}

            <span className="text-sm text-gray-500 ml-2">
              {ratingInput} / 5
            </span>

          </div>

          {/* COMMENT */}

          <textarea
            value={comment}
            onChange={(e) =>
              setComment(
                e.target.value
              )
            }
            placeholder="Share your experience..."
            className="border border-gray-200 focus:border-primary outline-none rounded-lg w-full p-3 h-28 resize-none text-sm"
          />

          {/* SUBMIT BUTTON */}

          <button
            onClick={submitReview}
            className="bg-primary hover:bg-primary-dull text-white px-5 py-2 rounded-lg mt-4 text-sm transition"
          >

            {existingReview
              ? "Update Review"
              : "Submit Review"}

          </button>
        </div>

        {/* ========================= */}
        {/* REVIEWS LIST */}
        {/* ========================= */}

        <div className="mt-8 space-y-4">

          {Array.isArray(
            localProduct?.reviews
          ) &&
          localProduct.reviews.length >
            0 ? (

            [...localProduct.reviews]

              .sort(
                (a, b) =>
                  new Date(
                    b.createdAt
                  ) -
                  new Date(
                    a.createdAt
                  )
              )

              .map((review) => (
                <div
                  key={review._id}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition"
                >

                  {/* TOP */}

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-3">

                      {/* AVATAR */}

                      <div className="w-9 h-9 rounded-full bg-primary/90 text-white flex items-center justify-center text-sm font-semibold">

                        {review.name
                          ?.charAt(0)
                          ?.toUpperCase()}

                      </div>

                      {/* NAME + STARS */}

                      <div>

                        <p className="font-medium text-sm">
                          {review.name}
                        </p>

                        <div className="flex items-center gap-1 mt-1">

                          {[1, 2, 3, 4, 5].map(
                            (star) => (
                              <FaStar
                                key={star}
                                className={`text-xs ${
                                  star <=
                                  review.rating
                                    ? "text-red-600"
                                    : "text-gray-300"
                                }`}
                              />
                            )
                          )}

                        </div>
                      </div>
                    </div>

                    {/* DATE */}

                    <span className="text-xs text-gray-400">

                      {review.createdAt
                        ? new Date(
                            review.createdAt
                          ).toLocaleDateString()
                        : ""}

                    </span>
                  </div>

                  {/* COMMENT */}

                  <p className="text-gray-600 text-sm mt-3 leading-relaxed">

                    {review.comment}

                  </p>

                </div>
              ))

          ) : (

            <p className="text-gray-500 text-sm mt-4">
              No reviews yet
            </p>

          )}

        </div>
      </div>

      {/* ========================= */}
      {/* RELATED PRODUCTS */}
      {/* ========================= */}

      <div className="flex flex-col items-center mt-20">

        <p className="text-3xl font-medium">
          Related Products
        </p>

        <div className="w-20 h-0.5 bg-primary rounded-full mt-2"></div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mt-6 w-full">

          {relatedProducts
            .filter(
              (item) =>
                item.inStock
            )
            .map((item, index) => (
              <ProductCard
                key={index}
                product={item}
              />
            ))}

        </div>

        <button
          onClick={() => {

            navigate("/products");

            scrollTo(0, 0);

          }}
          className="mx-auto px-12 my-16 py-2.5 border rounded text-primary hover:bg-primary/10 transition"
        >
          See More
        </button>

      </div>
    </div>
  );
};

export default ProductDetail;