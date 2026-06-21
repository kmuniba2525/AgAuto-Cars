import React, { useEffect, useState } from "react";
import {
  PackageCheck,
  ChefHat,
  Truck,
  Home,
} from "lucide-react";

import { useParams } from "react-router-dom";
import { useAppContext } from "../Context/AppContext";

const TrackOrder = () => {
  const { id } = useParams();
  const { axios, currency } = useAppContext();

  const [order, setOrder] = useState(null);

  const orderSteps = [
    "Order Placed",
    "Preparing",
    "Shipped",
    "Delivered",
  ];

  const fetchOrder = async () => {
    try {
      console.log(id);

      const { data } = await axios.get(`/api/order/${id}`, {
        withCredentials: true,
      });

      console.log(data);

      if (data.success) {
        setOrder(data.order);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  if (!order) {
    return <div className="mt-20 text-center">Loading...</div>;
  }

  const currentStep = orderSteps.indexOf(order.status);

  return (
    <div className="min-h-screen bg-[#f8fafc] py-10 px-4">

      <div className="max-w-5xl mx-auto bg-white rounded-[35px] shadow-xl border border-gray-100 p-8 md:p-12">

        {/* TOP */}
        <div className="flex flex-col lg:flex-row justify-between gap-10">

          {/* LEFT */}
          <div>
            <p className="text-sm text-primary font-medium">
              TRACKING ORDER
            </p>

            <h1 className="text-4xl font-bold text-gray-800 mt-2">
              #{order._id.slice(-6)}
            </h1>

            <p className="text-gray-500 mt-3">
              Ordered on{" "}
              {order.createdAt
                ? new Date(order.createdAt).toLocaleDateString()
                : "N/A"}
            </p>

            {/* ADDRESS */}
            <div className="mt-8">
              <h2 className="font-semibold text-xl text-gray-800">
                Delivery Address
              </h2>

              <div className="mt-3 text-gray-600 leading-8">
                <p>{order.address?.firstName}</p>
                <p>{order.address?.street}</p>
                <p>
                  {order.address?.city}, {order.address?.country}
                </p>
                <p>{order.address?.phone}</p>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="bg-primary/5 rounded-3xl p-8 min-w-[280px]">
            <h2 className="text-2xl font-bold text-gray-800">
              Order Summary
            </h2>

            <div className="mt-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Payment</span>
                <span className="font-medium">
                  {order.paymentType}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="text-primary font-medium">
                  {order.status}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Total</span>
                <span className="font-bold text-xl">
                  {currency}
                  {order.amount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* TRACKER */}
        <div className="mt-16 flex items-center justify-between relative">

          {[
            {
              title: "Order Placed",
              icon: <PackageCheck size={20} />,
            },
            {
              title: "Preparing",
              icon: <ChefHat size={20} />,
            },
            {
              title: "Shipped",
              icon: <Truck size={20} />,
            },
            {
              title: "Delivered",
              icon: <Home size={20} />,
            },
          ].map((step, index) => (
            <div
              key={index}
              className="flex-1 flex flex-col items-center relative z-10"
            >
              {/* LINE */}
              {index !== 3 && (
                <div
                  className={`absolute top-5 left-[55%] h-1 w-full ${
                    currentStep > index
                      ? "bg-primary"
                      : "bg-gray-200"
                  }`}
                />
              )}

              {/* ICON */}
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg ${
                  currentStep >= index
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {step.icon}
              </div>

              <p className="mt-4 font-medium text-center">
                {step.title}
              </p>
            </div>
          ))}
        </div>

        {/* PRODUCTS */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-gray-800">
            Ordered Items
          </h2>

          <div className="mt-8 space-y-5">
            {(order.items || []).map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between border rounded-2xl p-5"
              >
                <div className="flex items-center gap-5">
                  <img
                    src={item.product?.image?.[0]}
                    alt=""
                    className="w-20 h-20 rounded-xl object-cover"
                  />

                  <div>
                    <h2 className="text-lg font-semibold">
                      {item.product?.name}
                    </h2>

                    <p className="text-gray-500 mt-1">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                </div>

                <p className="font-bold text-primary text-lg">
                  {currency}
                  {(item.product?.offerPrice || 0) * item.quantity}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default TrackOrder;