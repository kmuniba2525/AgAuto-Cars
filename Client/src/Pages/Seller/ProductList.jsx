import React from "react";
import { useAppContext } from "../../Context/AppContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getLocalizedText } from "../../utils/getLocalizedText";
import { formatCurrency } from "../../utils/formatCurrency";

const STOCK_CEILING = 20; // gauge treats this as "full" — tune to your typical restock level

const ProductList = () => {
  const navigate = useNavigate();

  const {
    products = [],
    currency,
    axios,
    fetchProducts,
  } = useAppContext();

  const updateStock = async (id, stock) => {
    try {
      const { data } = await axios.post("/api/product/stock", { id, stock });

      if (data.success) {
        toast.success(data.message);
        fetchProducts();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const statusLabel = (stock) =>
    stock === 0 ? "Out of stock" : stock <= 5 ? "Low stock" : "In stock";

  const gaugeColor = (stock) =>
    stock === 0 ? "bg-accent" : stock <= 5 ? "bg-amber-500" : "bg-emerald-500";

  const statusTextColor = (stock) =>
    stock === 0 ? "text-accent" : stock <= 5 ? "text-amber-600" : "text-emerald-600";

  const gaugeWidth = (stock) =>
    `${Math.min(100, Math.round((stock / STOCK_CEILING) * 100))}%`;

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between">
      <div className="w-full md:p-10 p-4">
        <h2 className="pb-5 text-xl font-semibold text-gray-900 tracking-tight">
          Inventory Management
        </h2>

        {/* MOBILE: dashboard-style gauge list (below md) */}
        <div className="md:hidden -mx-4 px-4 border-t border-gray-900/10">
          {Array.isArray(products) &&
            products.map((product) => {
              const displayName = getLocalizedText(product.name, "en");
              const stock = product.stock;

              return (
                <div
                  key={product._id}
                  className="py-3.5 border-b border-gray-900/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 shrink-0 rounded-md overflow-hidden bg-gray-50 border border-gray-900/10">
                      <img
                        src={product.image?.[0]}
                        alt={displayName}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">
                        {displayName}
                      </p>
                      <p className="text-[11px] uppercase tracking-wider text-gray-400 mt-0.5">
                        {product.category}
                      </p>
                    </div>

                    <p className="font-semibold text-sm text-gray-900 shrink-0">
                      {formatCurrency(product.offerPrice, currency)}
                    </p>
                  </div>

                  {/* Stock gauge */}
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex-1 h-1.5 rounded-full bg-gray-900/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${gaugeColor(stock)} transition-all`}
                        style={{ width: gaugeWidth(stock) }}
                      />
                    </div>
                    <span className={`text-[11px] font-medium shrink-0 ${statusTextColor(stock)}`}>
                      {statusLabel(stock)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2.5">
                    <label className="flex items-center gap-2 text-xs text-gray-500">
                      Qty
                      <input
                        type="number"
                        min="0"
                        value={stock}
                        onChange={(e) => updateStock(product._id, e.target.value)}
                        className="border border-gray-900/15 rounded-md px-2 py-1 w-16 outline-none focus:border-primary text-xs font-medium text-gray-900"
                      />
                    </label>

                    <button
                      onClick={() => navigate(`/seller/edit-product/${product._id}`)}
                      className="text-xs font-semibold text-primary underline underline-offset-2 decoration-gray-300 hover:decoration-primary transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              );
            })}
        </div>

        {/* DESKTOP: table (md and up) */}
        <div className="hidden md:flex flex-col items-center max-w-6xl w-full overflow-hidden rounded-xl bg-white border border-gray-200 shadow-sm">
          <table className="md:table-auto table-fixed w-full overflow-hidden">
            <thead className="bg-gray-50 text-gray-700 text-sm text-left">
              <tr>
                <th className="px-4 py-4 font-semibold">Product</th>
                <th className="px-4 py-4 font-semibold">Category</th>
                <th className="px-4 py-4 font-semibold">Selling Price</th>
                <th className="px-4 py-4 font-semibold">Stock</th>
                <th className="px-4 py-4 font-semibold">Status</th>
                <th className="px-4 py-4 font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody className="text-sm text-gray-600">
              {Array.isArray(products) &&
                products.map((product) => {
                  const displayName = getLocalizedText(product.name, "en");

                  return (
                    <tr
                      key={product._id}
                      className="border-t border-gray-200 hover:bg-gray-50 transition"
                    >
                      <td className="md:px-4 pl-2 md:pl-4 py-4 flex items-center gap-3">
                        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                          <img
                            src={product.image?.[0]}
                            alt={displayName}
                            className="w-16 h-16 object-cover"
                          />
                        </div>

                        <div className="flex flex-col">
                          <span className="font-medium text-gray-800">
                            {displayName}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4">{product.category}</td>

                      <td className="px-4 py-4">
                        {formatCurrency(product.offerPrice, currency)}
                      </td>

                      <td className="px-4 py-4">
                        <input
                          type="number"
                          min="0"
                          value={product.stock}
                          onChange={(e) => updateStock(product._id, e.target.value)}
                          className="border border-gray-300 rounded-lg px-3 py-2 w-24 outline-none focus:border-primary"
                        />
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`text-xs font-medium px-3 py-1 rounded-full ${
                            product.stock === 0
                              ? "bg-red-100 text-red-600"
                              : product.stock <= 5
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {statusLabel(product.stock)}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <button
                          onClick={() => navigate(`/seller/edit-product/${product._id}`)}
                          className="text-primary text-xs font-semibold border border-primary/30 rounded-full px-3 py-1.5 hover:bg-primary hover:text-white transition-colors"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductList;