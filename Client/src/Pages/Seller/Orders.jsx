import React, { useEffect, useState } from "react";
import { useAppContext } from "../../Context/AppContext";
import { assets } from "../../assets/assets";
import toast from "react-hot-toast";
import {
  PackageCheck,
  ChefHat,
  Truck,
  Home,
} from "lucide-react";

function Orders() {
  const { currency, axios } = useAppContext();
  const [orders, setOrders] = useState([]);

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
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-auto bg-[#f8fafc]">
      <div className="md:p-10 p-4 space-y-6">

        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            Orders Dashboard
          </h2>
          <p className="text-gray-500 mt-1">
            Manage and track customer orders
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 shadow-sm border text-center">
            <p className="text-gray-500 text-lg">No orders found</p>
          </div>
        ) : (
          orders.map((order, index) => {
            const currentStep = orderSteps.indexOf(order?.status);

            return (
              <div
                key={order._id || index}
                className="bg-white rounded-[30px] p-6 md:p-8 border border-gray-100 shadow-md"
              >

                {/* TOP SECTION */}
                <div className="flex xl:flex-row items-start gap-8">

                  {/* LEFT */}
                  <div className="flex gap-5 flex-1">

                    <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                      <img
                        className="w-10 opacity-70"
                        src={assets.box_icon}
                        alt="boxIcon"
                      />
                    </div>

                    <div>

                      <div className="space-y-1">
                        {order.items?.length ? (
                          order.items.map((item, idx) => (
                            <p
                              key={idx}
                              className="text-lg font-semibold text-gray-800"
                            >
                              {item?.product?.name || "Product"}
                              <span className="text-primary ml-1">
                                x {item?.quantity || 0}
                              </span>
                            </p>
                          ))
                        ) : (
                          <p className="text-sm text-gray-400">No items</p>
                        )}
                      </div>

                      <div className="mt-5 space-y-1 text-gray-600">
                        <p className="font-semibold text-gray-800">
                          {order?.address?.firstName}
                        </p>
                        <p>
                          {order?.address?.street}, {order?.address?.city}
                        </p>
                        <p>
                          {order?.address?.state},{" "}
                          {order?.address?.zipcode},{" "}
                          {order?.address?.country}
                        </p>
                        <p>{order?.address?.phone}</p>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="flex flex-col md:items-end">

                    <div className="text-left md:text-right">
                      <h1 className="text-4xl font-bold text-primary">
                        {currency}
                        {order?.amount}
                      </h1>
                      <p className="text-gray-500 mt-1">
                        {order?.paymentType}
                      </p>
                    </div>

                    <span
                      className={`px-5 py-2 rounded-full text-sm font-medium ${
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

                    <div className="text-sm text-gray-500 text-left md:text-right mt-2">
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
                <div className="mt-10 flex items-center justify-between relative">

                  {[
                    { title: "Order Placed", icon: <PackageCheck size={20} /> },
                    { title: "Preparing", icon: <ChefHat size={20} /> },
                    { title: "Shipped", icon: <Truck size={20} /> },
                    { title: "Delivered", icon: <Home size={20} /> },
                  ].map((step, stepIndex) => (
                    <div
                      key={stepIndex}
                      className="flex-1 flex flex-col items-center relative z-10"
                    >

                      {stepIndex !== 3 && (
                        <div
                          className={`absolute top-5 left-[55%] h-1 w-full ${
                            currentStep > stepIndex
                              ? "bg-primary"
                              : "bg-gray-200"
                          }`}
                        />
                      )}

                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          currentStep >= stepIndex
                            ? "bg-primary text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {step.icon}
                      </div>

                      <p className="mt-3 text-sm font-medium">
                        {step.title}
                      </p>
                    </div>
                  ))}
                </div>

                {/* ACTIONS */}
                <div className="flex items-center justify-center gap-3 mt-8">

                  <select
                    value={order?.status}
                    onChange={(e) =>
                      updateOrderStatus(order._id, e.target.value)
                    }
                    className="px-4 py-2.5 rounded-lg border"
                  >
                    {orderSteps.map((status, idx) => (
                      <option key={idx} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>

                  <button className="px-5 py-2.5 rounded-lg bg-primary text-white">
                    Track Order
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Orders;