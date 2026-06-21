import React from "react";
import { useAppContext } from "../../Context/AppContext";
import toast from "react-hot-toast";

const ProductList = () => {

  const {
    products = [],
    currency,
    axios,
    fetchProducts,
  } = useAppContext();

  // =========================
  // UPDATE STOCK
  // =========================

  const updateStock = async (
    id,
    stock
  ) => {

    try {

      const { data } =
        await axios.post(
          "/api/product/stock",
          {
            id,
            stock,
          }
        );

      if (data.success) {

        toast.success(
          data.message
        );

        fetchProducts();

      } else {

        toast.error(
          data.message
        );

      }

    } catch (error) {

      console.log(error);

      toast.error(
        error.response?.data
          ?.message ||
          error.message
      );

    }
  };

  return (

    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between">

      <div className="w-full md:p-10 p-4">

        {/* TITLE */}
        <h2 className="pb-4 text-xl font-semibold text-gray-800">
          Inventory Management
        </h2>

        {/* TABLE CONTAINER */}
        <div className="flex flex-col items-center max-w-6xl w-full overflow-hidden rounded-xl bg-white border border-gray-200 shadow-sm">

          <table className="md:table-auto table-fixed w-full overflow-hidden">

            {/* ========================= */}
            {/* TABLE HEAD */}
            {/* ========================= */}

            <thead className="bg-gray-50 text-gray-700 text-sm text-left">

              <tr>

                <th className="px-4 py-4 font-semibold">
                  Product
                </th>

                <th className="px-4 py-4 font-semibold">
                  Category
                </th>

                <th className="px-4 py-4 font-semibold hidden md:table-cell">
                  Selling Price
                </th>

                <th className="px-4 py-4 font-semibold">
                  Stock
                </th>

                <th className="px-4 py-4 font-semibold">
                  Status
                </th>

              </tr>

            </thead>

            {/* ========================= */}
            {/* TABLE BODY */}
            {/* ========================= */}

            <tbody className="text-sm text-gray-600">

              {Array.isArray(products) &&
                products.map((product) => (

                  <tr
                    key={product._id}
                    className="border-t border-gray-200 hover:bg-gray-50 transition"
                  >

                    {/* PRODUCT */}
                    <td className="md:px-4 pl-2 md:pl-4 py-4 flex items-center gap-3">

                      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">

                        <img
                          src={
                            product.image?.[0]
                          }
                          alt="Product"
                          className="w-16 h-16 object-cover"
                        />

                      </div>

                      <div className="flex flex-col">

                        <span className="font-medium text-gray-800">
                          {product.name}
                        </span>

                        <span className="text-xs text-gray-400 md:hidden">
                          {currency}
                          {product.offerPrice}
                        </span>

                      </div>

                    </td>

                    {/* CATEGORY */}
                    <td className="px-4 py-4">
                      {product.category}
                    </td>

                    {/* PRICE */}
                    <td className="px-4 py-4 hidden md:table-cell">

                      {currency}
                      {product.offerPrice}

                    </td>

                    {/* STOCK INPUT */}
                    <td className="px-4 py-4">

                      <input
                        type="number"
                        min="0"
                        value={product.stock}
                        onChange={(e) =>
                          updateStock(
                            product._id,
                            e.target.value
                          )
                        }
                        className="border border-gray-300 rounded-lg px-3 py-2 w-24 outline-none focus:border-primary"
                      />

                    </td>

                    {/* STATUS */}
                    <td className="px-4 py-4">

                      <span
                        className={`text-xs font-medium px-3 py-1 rounded-full

                        ${
                          product.stock === 0
                            ? "bg-red-100 text-red-600"

                            : product.stock <= 5
                            ? "bg-red-100 text-red-700"

                            : "bg-green-100 text-green-700"
                        }
                        `}
                      >

                        {
                          product.stock === 0
                            ? "Out Of Stock"

                            : product.stock <= 5
                            ? "Low Stock"

                            : "In Stock"
                        }

                      </span>

                    </td>

                  </tr>

                ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
};

export default ProductList;