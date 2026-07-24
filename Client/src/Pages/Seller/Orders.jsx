import React, { useEffect, useState } from "react";
import { useAppContext } from "../../Context/AppContext";
import { assets } from "../../assets/assets";
import toast from "react-hot-toast";
import {
  PackageCheck,
  ChefHat,
  Truck,
  Home,
  Printer,
} from "lucide-react";
import { getLocalizedText } from "../../utils/getLocalizedText";
import { getOrderCustomer } from "../../utils/getOrderCustomer";
import Invoice from "../../Components/Seller/Invoice";
import { formatCurrency } from "../../utils/formatCurrency";
function Orders() {
  const { currency, axios } = useAppContext();
  const [orders, setOrders] = useState([]);
  const [printOrder, setPrintOrder] = useState(null);

  const orderSteps = [
    "Order Placed",
    "Preparing",
    "Shipped",
    "Delivered",
  ];

  const fetchOrder = async () => {
    try {
      const { data } = await axios.get("/api/order/seller", {
        withCredentials: true,
      });

      if (data.success) {
        setOrders(Array.isArray(data.message) ? data.message : []);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const { data } = await axios.put(
        `/api/order/status/${orderId}`,
        { status },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success("Order status updated");

        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId ? { ...order, status } : order
          )
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, []);

  return (
    <>
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-auto bg-[#f8fafc] print:hidden">
      <div className="md:p-10 p-4 space-y-6">

        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Orders Dashboard
          </h2>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Manage and track customer orders
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border text-center">
            <p className="text-gray-500 text-base sm:text-lg">No orders found</p>
          </div>
        ) : (
          orders.map((order, index) => {
            const currentStep = orderSteps.indexOf(order?.status);
            const customer = getOrderCustomer(order);

            return (
              <div
                key={order._id || index}
                className="bg-white rounded-[24px] sm:rounded-[30px] p-4 sm:p-6 md:p-8 border border-gray-100 shadow-md"
              >

                {/* TOP SECTION */}
                <div className="flex flex-col xl:flex-row items-start gap-6 xl:gap-8">

                  {/* LEFT */}
                  <div className="flex gap-4 sm:gap-5 flex-1 w-full">

                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                      <img
                        className="w-8 sm:w-10 opacity-70"
                        src={assets.box_icon}
                        alt="boxIcon"
                      />
                    </div>

                    <div className="min-w-0">

                      <div className="space-y-1">
                        {order.items?.length ? (
                          order.items.map((item, idx) => (
                            <p
                              key={idx}
                              className="text-base sm:text-lg font-semibold text-gray-800 break-words"
                            >
                              {getLocalizedText(item?.product?.name, "en") ||
                                "Product"}
                              <span className="text-primary ml-1">
                                x {item?.quantity || 0}
                              </span>
                            </p>
                          ))
                        ) : (
                          <p className="text-sm text-gray-400">No items</p>
                        )}
                      </div>

                      <div className="mt-4 sm:mt-5 space-y-1 text-sm sm:text-base text-gray-600">
                        <p className="font-semibold text-gray-800">
                          {customer.name}
                          {customer.isGuest && (
                            <span className="ml-2 text-xs font-normal text-gray-400">
                              (Guest)
                            </span>
                          )}
                        </p>
                        <p>
                          {customer.street}
                          {customer.street && customer.city ? ", " : ""}
                          {customer.city}
                        </p>
                        <p>
                          {[customer.state, customer.zipcode, customer.country]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                        <p>{customer.phone}</p>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="flex flex-col w-full xl:w-auto items-start xl:items-end gap-2">

                    <div className="text-left xl:text-right">
                      <h1 className="text-3xl sm:text-4xl font-bold text-primary">
                        {formatCurrency(order?.amount, currency)}
                      </h1>
                      <p className="text-gray-500 mt-1 text-sm sm:text-base">
                        {order?.paymentType}
                      </p>
                    </div>

                    <span
                      className={`px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium ${
                        order?.status === "Delivered"
                          ? "bg-green-100 text-green-700"
                          : order?.status === "Shipped"
                          ? "bg-purple-100 text-purple-700"
                          : order?.status === "Preparing"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {order?.status}
                    </span>

                    <div className="text-xs sm:text-sm text-gray-500 text-left xl:text-right mt-2">
                      <p>
                        Date:{" "}
                        {order?.createdAt
                          ? new Date(order.createdAt).toLocaleDateString()
                          : "N/A"}
                      </p>
                      <p>
                        Payment: {order?.isPaid ? "Paid" : "Pending"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* PROGRESS TRACKER */}
                <div className="mt-8 sm:mt-10 flex items-center justify-between relative overflow-x-auto no-scrollbar">

                  {[
                    { title: "Order Placed", icon: <PackageCheck size={16} className="sm:w-5 sm:h-5" /> },
                    { title: "Preparing", icon: <ChefHat size={16} className="sm:w-5 sm:h-5" /> },
                    { title: "Shipped", icon: <Truck size={16} className="sm:w-5 sm:h-5" /> },
                    { title: "Delivered", icon: <Home size={16} className="sm:w-5 sm:h-5" /> },
                  ].map((step, stepIndex) => (
                    <div
                      key={stepIndex}
                      className="flex-1 flex flex-col items-center relative min-w-[70px]"
                    >

                      {stepIndex !== 3 && (
                        <div
                          className={`absolute top-4 sm:top-5 left-[55%] h-1 w-full ${
                            currentStep > stepIndex
                              ? "bg-primary"
                              : "bg-gray-200"
                          }`}
                        />
                      )}

                      <div
                        className={`w-9 h-9 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${
                          currentStep >= stepIndex
                            ? "bg-primary text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {step.icon}
                      </div>

                      <p className="mt-2 sm:mt-3 text-[11px] sm:text-sm font-medium text-center">
                        {step.title}
                      </p>
                    </div>
                  ))}
                </div>

                {/* ACTIONS */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 mt-8">

                  <select
                    value={order?.status}
                    onChange={(e) =>
                      updateOrderStatus(order._id, e.target.value)
                    }
                    className="w-full sm:w-auto px-4 py-2.5 rounded-lg border"
                  >
                    {orderSteps.map((status, idx) => (
                      <option key={idx} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>

                  <button className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-primary text-white">
                    Track Order
                  </button>

                  <button
                    onClick={() => setPrintOrder(order)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <Printer size={16} />
                    Print Invoice
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>

    {printOrder && (
      <Invoice order={printOrder} onClose={() => setPrintOrder(null)} />
    )}
    </>
  );
}

export default Orders;