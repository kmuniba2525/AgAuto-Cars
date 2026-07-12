import React, { useEffect, useState } from 'react'
import { useAppContext } from '../Context/AppContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getLocalizedText } from '../utils/getLocalizedText';

const statusStyles = {
  Delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Shipped: "bg-blue-50 text-blue-700 border-blue-200",
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Processing: "bg-amber-50 text-amber-700 border-amber-200",
  Cancelled: "bg-red-50 text-red-700 border-red-200",
};

const MyOrder = () => {
  const { t, i18n } = useTranslation();
  const [myOrders, setMyOrders] = useState([]);
  const { currency, axios, user } = useAppContext();
  const navigate = useNavigate();

  const fetchMyOrders = async () => {
    try {
      const { data } = await axios.get('/api/order/user', {
        withCredentials: true
      });

      if (data.success) {
        setMyOrders(data.message || []);
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (user) {
      fetchMyOrders()
    }
  }, [user])

  return (
    <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 pb-16'>

      {/* Header */}
      <div className='mb-8 sm:mb-10'>
        <p className='text-[11px] font-semibold tracking-[3px] text-primary uppercase flex items-center gap-2'>
          <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
          {t('my_order.order_history')}
        </p>
        <h1 className='text-2xl sm:text-3xl font-semibold text-gray-900 mt-1.5'>
          {t('my_order.title')}
        </h1>
        <div className='h-[3px] w-12 mt-3 rounded-full bg-gradient-to-r from-primary to-primary/20' />
      </div>

      {/* Empty state */}
      {myOrders.length === 0 && (
        <div className="bg-white border border-gray-200/80 rounded-2xl px-6 py-16 text-center shadow-[0_2px_16px_-6px_rgba(0,0,0,0.06)]">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-900">{t('my_order.empty_title')}</p>
          <p className="text-gray-500 mt-1.5 text-sm">{t('my_order.empty_subtitle')}</p>
        </div>
      )}

      {/* Orders */}
      <div className="space-y-6 sm:space-y-7">
        {myOrders.map((order, index) => (
          <div
            key={index}
            className='bg-white border border-gray-200/80 rounded-2xl shadow-[0_2px_16px_-6px_rgba(0,0,0,0.06)] overflow-hidden'
          >
            {/* Order Header */}
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 bg-gray-50/80 border-b border-gray-200/80 px-4 sm:px-6 py-3.5 text-xs sm:text-sm'>
              <span className='text-gray-500 truncate'>
                {t('my_order.order_id')} <span className="text-gray-700 font-medium">#{order._id?.slice(-8)}</span>
              </span>
              <span className='text-gray-500'>
                {t('my_order.payment')} <span className="text-gray-700 font-medium">{order.paymentType}</span>
              </span>
              <span className='text-gray-900 font-semibold'>
                {currency}{order.amount}
              </span>
            </div>

            {/* Items */}
            <div>
              {order.items?.map((item, i) => {
                const localizedName = getLocalizedText(item.product?.name, i18n.language) || t('my_order.product_fallback');

                return (
                  <div
                    key={i}
                    className={`flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 px-4 sm:px-6 py-5
                      ${i !== order.items.length - 1 ? "border-b border-gray-100" : ""}`}
                  >
                    {/* Left: Product Info */}
                    <div className='flex items-center gap-3.5 sm:gap-4 min-w-0'>
                      <div className='bg-primary/5 border border-primary/10 p-2.5 sm:p-3 rounded-xl shrink-0'>
                        <img
                          src={item.product?.image?.[0]}
                          alt={localizedName}
                          className='w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-md'
                        />
                      </div>

                      <div className="min-w-0">
                        <h2 className='text-sm sm:text-base font-medium text-gray-900 truncate'>
                          {localizedName}
                        </h2>
                        <p className='text-xs sm:text-sm text-gray-500 mt-0.5'>
                          {item.product?.category || t('my_order.na')}
                        </p>
                        <p className='text-xs sm:text-sm text-gray-500 mt-0.5'>
                          {t('my_order.qty_date', {
                            count: item.quantity ?? 1,
                            date: new Date(order.createdAt).toLocaleDateString(i18n.language)
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Right: Status + Price + Track */}
                    <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 md:gap-2 shrink-0">
                      <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${statusStyles[order.status] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                        {t(`payment_success.status.${order.status}`, order.status)}
                      </span>

                      <p className='text-primary text-sm sm:text-base font-semibold'>
                        {currency}{(item.product?.offerPrice || 0) * (item.quantity || 1)}
                      </p>

                      <button
                        onClick={() => navigate(`/track-order/${order._id}`)}
                        className="text-xs sm:text-sm border border-primary text-primary px-3 py-1.5 rounded-lg font-medium hover:bg-primary hover:text-white transition-colors duration-200"
                      >
                        {t('my_order.track_order')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MyOrder;