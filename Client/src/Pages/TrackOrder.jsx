import React, { useEffect, useState } from "react";
import {
  PackageCheck,
  ChefHat,
  Truck,
  Home,
} from "lucide-react";

import { useParams } from "react-router-dom";
import { useAppContext } from "../Context/AppContext";
import { useTranslation } from "react-i18next";
import { getLocalizedText } from "../utils/getLocalizedText";

const TrackOrder = () => {
  const { t, i18n } = useTranslation();
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
      const { data } = await axios.get(`/api/order/${id}`, {
        withCredentials: true,
      });

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
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-medium">
        {t("track_order.loading")}
      </div>
    );
  }

  const currentStep = orderSteps.indexOf(order.status);

  const trackerSteps = [
    { title: t("track_order.steps.order_placed"), icon: <PackageCheck size={20} /> },
    { title: t("track_order.steps.preparing"), icon: <ChefHat size={20} /> },
    { title: t("track_order.steps.shipped"), icon: <Truck size={20} /> },
    { title: t("track_order.steps.delivered"), icon: <Home size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] py-6 md:py-10 px-3 sm:px-5">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl md:rounded-[35px] shadow-xl border border-gray-100 p-5 sm:p-7 md:p-10">

        {/* TOP */}
        <div className="flex flex-col lg:flex-row justify-between gap-8">

          {/* LEFT */}
          <div className="flex-1">
            <p className="text-sm text-primary font-medium tracking-wide">
              {t("track_order.tracking_order")}
            </p>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mt-2 break-all">
              #{order._id.slice(-6)}
            </h1>

            <p className="text-sm sm:text-base text-gray-500 mt-3">
              {t("track_order.ordered_on")}{" "}
              {order.createdAt
                ? new Date(order.createdAt).toLocaleDateString(i18n.language)
                : t("track_order.na")}
            </p>

            {/* ADDRESS */}
            <div className="mt-8">
              <h2 className="font-semibold text-lg sm:text-xl text-gray-800">
                {t("track_order.delivery_address")}
              </h2>

              <div className="mt-3 text-sm sm:text-base text-gray-600 leading-7 break-words">
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
          <div className="bg-primary/5 rounded-3xl p-5 sm:p-6 md:p-8 w-full lg:max-w-sm">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              {t("track_order.order_summary")}
            </h2>

            <div className="mt-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">{t("track_order.payment")}</span>
                <span className="font-medium">
                  {order.paymentType}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">{t("track_order.status")}</span>
                <span className="text-primary font-medium">
                  {t(`payment_success.status.${order.status}`, order.status)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">{t("track_order.total")}</span>
                <span className="font-bold text-lg sm:text-xl">
                  {currency}
                  {order.amount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* TRACKER */}
        <div className="mt-12 overflow-x-auto">
          <div className="flex items-center justify-between relative min-w-[620px] pb-4">

            {trackerSteps.map((step, index) => (
              <div
                key={index}
                className="flex-1 flex flex-col items-center relative z-10"
              >
                {index !== 3 && (
                  <div
                    className={`absolute top-5 left-[55%] h-1 w-full ${
                      currentStep > index
                        ? "bg-primary"
                        : "bg-gray-200"
                    }`}
                  />
                )}

                <div
                  className={`w-11 h-11 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                    currentStep >= index
                      ? "bg-primary text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step.icon}
                </div>

                <p className="mt-3 text-xs sm:text-sm md:text-base font-medium text-center">
                  {step.title}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* PRODUCTS */}
        <div className="mt-16">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            {t("track_order.ordered_items")}
          </h2>

          <div className="mt-8 space-y-4">
            {(order.items || []).map((item, index) => {
              const localizedName = getLocalizedText(item.product?.name, i18n.language);

              return (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border border-gray-200 rounded-2xl p-4 sm:p-5 hover:shadow-md transition-all duration-300"
                >
                  {/* LEFT */}
                  <div className="flex items-center gap-4">
                    <img
                      src={item.product?.image?.[0]}
                      alt={localizedName}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover flex-shrink-0"
                    />

                    <div className="min-w-0">
                      <h2 className="text-base sm:text-lg font-semibold text-gray-800 break-words">
                        {localizedName}
                      </h2>

                      <p className="text-sm text-gray-500 mt-1">
                        {t("track_order.quantity", { count: item.quantity })}
                      </p>

                      <p className="text-sm text-gray-500">
                        {t("track_order.price", { currency, amount: item.product?.offerPrice })}
                      </p>
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="self-end sm:self-auto">
                    <p className="font-bold text-primary text-base sm:text-lg">
                      {currency}
                      {(item.product?.offerPrice || 0) * item.quantity}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default TrackOrder;