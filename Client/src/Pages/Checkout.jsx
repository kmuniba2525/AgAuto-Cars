import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import axios from 'axios';
import CheckoutForm from '../Components/CheckoutForm';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const appearance = {
  theme: 'night',
  variables: {
    colorPrimary: '#E8442C',
    colorBackground: '#161616',
    colorText: '#F2F2F2',
    colorTextSecondary: '#8C8C8C',
    colorDanger: '#E24B4A',
    fontFamily: 'system-ui, sans-serif',
    borderRadius: '8px',
    spacingUnit: '3px',
    fontSizeBase: '13px',
  },
  rules: {
    '.Tab': {
      border: '0.5px solid #2A2A2A',
      backgroundColor: '#1E1E1E',
      padding: '8px 10px',
    },
    '.Tab:hover': {
      border: '0.5px solid #444',
    },
    '.Tab--selected': {
      border: '1px solid #E8442C',
      backgroundColor: '#1E1E1E',
    },
    '.Input': {
      backgroundColor: '#1E1E1E',
      border: '0.5px solid #2A2A2A',
      padding: '8px 10px',
    },
    '.Input:focus': {
      border: '1px solid #E8442C',
      boxShadow: '0 0 0 1px #E8442C',
    },
    '.Label': {
      color: '#8C8C8C',
      fontSize: '12px',
    },
  },
};

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState('');
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    const pending = JSON.parse(sessionStorage.getItem("pendingOrder") || "{}");
    console.log("pendingOrder from sessionStorage:", pending);

    // ✅ CHANGED: pull guest fields too, not just address
    const { items, address, guestInfo, guestAddress } = pending.payload || {};

    // ✅ CHANGED: valid if we have items AND either a saved address
    // (logged-in user) or full guest info + address (guest)
    const hasValidAddress = address || (guestInfo && guestAddress);

    if (!items || !hasValidAddress) {
      console.error("Missing items or address in pendingOrder");
      return;
    }

    axios
      .post(
        `${import.meta.env.VITE_BACKEND_URL}/api/order/stripe-intent`,
        {
          items,
          address,
          guestInfo,
          guestAddress,
        },
        { withCredentials: true }
      )
      .then((res) => {
        setClientSecret(res.data.clientSecret);
        setAmount(res.data.amount || 0);

        // ✅ NEW: stash the orderId so the payment-success page can look
        // this exact order up, regardless of whether the person is logged in
        if (res.data.orderId) {
          sessionStorage.setItem("lastOrderId", res.data.orderId);
        }
      })
      .catch((err) => {
        console.error('Payment intent error:', err.response?.data || err.message);
      });
  }, []);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-sm">
        <div className="mb-3">
          <h2 className="text-zinc-100 text-base font-medium leading-tight">
            Complete your payment
          </h2>
          <p className="text-zinc-100 text-2xl font-medium mt-0.5">
            €{amount.toFixed(2)}
          </p>
        </div>

        {clientSecret && (
          <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
            <CheckoutForm amount={amount} />
          </Elements>
        )}
      </div>
    </div>
  );
}
