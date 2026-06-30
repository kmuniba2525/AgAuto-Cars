// src/pages/PaymentSuccess.jsx
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { useAppContext } from '../Context/AppContext';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const statusStyles = {
  Delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Shipped: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Processing: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [order, setOrder] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);

  const { currency, axios, user, navigate, setCartItems } = useAppContext();

  // Poll a few times for the webhook to land (it can take a second or two)
  const fetchLatestOrder = async (attempt = 0) => {
    setOrderLoading(true);
    try {
      const { data } = await axios.get('/api/order/user', {
        withCredentials: true,
      });

      if (data.success && data.message?.length > 0) {
        // most recent order first — adjust if your API isn't sorted desc
        const latest = data.message[0];
        setOrder(latest);
        setOrderLoading(false);
        return;
      }
    } catch (error) {
      console.log(error);
    }

    if (attempt < 4) {
      setTimeout(() => fetchLatestOrder(attempt + 1), 1500);
    } else {
      setOrderLoading(false);
    }
  };

  useEffect(() => {
    const clientSecret = searchParams.get('payment_intent_client_secret');
    if (!clientSecret) {
      setStatus('default');
      return;
    }

    stripePromise.then((stripe) => {
      stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
        setStatus(paymentIntent.status);
      });
    });
  }, []);

  // Clear the cart once payment is confirmed successful
  useEffect(() => {
    if (status === 'succeeded') {
      setCartItems({});
      sessionStorage.removeItem('pendingOrder');
    }
  }, [status]);

  useEffect(() => {
    if (status === 'succeeded' && user) {
      fetchLatestOrder();
    }
  }, [status, user]);

  const content = {
    loading: { icon: <Spinner />, text: 'Checking your payment…', color: '#8C8C8C' },
    succeeded: { icon: <CheckIcon />, text: 'Payment successful! Thank you.', color: '#3DDC84' },
    processing: { icon: <Spinner />, text: 'Payment is processing — we will confirm shortly.', color: '#8C8C8C' },
    requires_action: { icon: <PhoneIcon />, text: 'Please complete the payment on your phone (MB Way).', color: '#E8A317' },
    requires_payment_method: { icon: <ErrorIcon />, text: 'Payment failed. Please try again.', color: '#E24B4A' },
    default: { icon: <ErrorIcon />, text: 'Something went wrong.', color: '#E24B4A' },
  };

  const current = content[status] ?? content.default;

  return (
    <div className="min-h-[80vh] bg-[#0A0A0A] px-4 sm:px-6 py-10 sm:py-16">
      <div className="max-w-2xl mx-auto">
        {/* Status banner */}
        <div className="bg-[#161616] border border-white/10 rounded-2xl px-6 sm:px-8 py-8 sm:py-10 text-center mb-8">
          <div className="mb-4 flex justify-center">{current.icon}</div>
          <p style={{ color: current.color }} className="text-sm sm:text-base font-medium">
            {current.text}
          </p>
        </div>

        {/* Order details — only once payment succeeded */}
        {status === 'succeeded' && (
          <>
            {orderLoading && (
              <div className="bg-[#161616] border border-white/10 rounded-2xl px-6 py-10 text-center text-gray-400 text-sm">
                Fetching your order details…
              </div>
            )}

            {!orderLoading && order && (
              <div className="bg-[#161616] border border-white/10 rounded-2xl overflow-hidden">
                {/* Order header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 bg-white/[0.03] border-b border-white/10 px-5 sm:px-6 py-4 text-xs sm:text-sm">
                  <span className="text-gray-400">
                    Order ID <span className="text-gray-200 font-medium">#{order._id?.slice(-8)}</span>
                  </span>
                  <span className="text-gray-400">
                    Payment <span className="text-gray-200 font-medium">{order.paymentType}</span>
                  </span>
                  <span className="text-white font-semibold">
                    {currency}{order.amount}
                  </span>
                </div>

                {/* Items */}
                <div>
                  {order.items?.map((item, i) => (
                    <div
                      key={i}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 sm:px-6 py-5 ${
                        i !== order.items.length - 1 ? "border-b border-white/5" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="bg-red-600/5 border border-red-600/10 p-2.5 rounded-xl shrink-0">
                          <img
                            src={item.product?.image?.[0]}
                            alt={item.product?.name || "Product"}
                            className="w-14 h-14 object-cover rounded-md"
                          />
                        </div>
                        <div className="min-w-0">
                          <h2 className="text-sm sm:text-base font-medium text-gray-100 truncate">
                            {item.product?.name || "Product"}
                          </h2>
                          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                            {item.product?.category || "N/A"}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                            Qty {item.quantity ?? 1}
                          </p>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                        <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${statusStyles[order.status] || "bg-white/5 text-gray-400 border-white/10"}`}>
                          {order.status}
                        </span>
                        <p className="text-red-500 text-sm sm:text-base font-semibold">
                          {currency}{(item.product?.offerPrice || 0) * (item.quantity || 1)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery address */}
                <div className="px-5 sm:px-6 py-4 border-t border-white/10 text-sm">
                  <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold mb-1.5">
                    Delivery Address
                  </p>
                  <p className="text-gray-300 leading-snug">
                    {order.address
                      ? `${order.address.street || ""}, ${order.address.city || ""}, ${order.address.state || ""}, ${order.address.country || ""}`
                      : "Address not available"}
                  </p>
                </div>
              </div>
            )}

            {!orderLoading && !order && (
              <div className="bg-[#161616] border border-white/10 rounded-2xl px-6 py-10 text-center text-gray-400 text-sm">
                We couldn't load your order yet — check{" "}
                <button onClick={() => navigate('/my-orders')} className="text-red-500 hover:text-red-400 font-medium">
                  My Orders
                </button>{" "}
                in a moment.
              </div>
            )}

            <button
              onClick={() => navigate('/my-orders')}
              className="w-full mt-6 border border-red-600 text-red-500 font-semibold py-2.5 rounded-lg hover:bg-red-600 hover:text-white transition-all duration-200 text-sm sm:text-base"
            >
              View All Orders
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div
      style={{
        width: 32, height: 32, border: '3px solid #2A2A2A',
        borderTopColor: '#E8442C', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function CheckIcon() {
  return (
    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(61, 220, 132, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#3DDC84' }}>✓</div>
  );
}

function ErrorIcon() {
  return (
    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(226, 75, 74, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#E24B4A' }}>✕</div>
  );
}

function PhoneIcon() {
  return (
    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(232, 163, 23, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📱</div>
  );
}
