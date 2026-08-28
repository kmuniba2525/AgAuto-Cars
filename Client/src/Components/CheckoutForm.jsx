import { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

export default function CheckoutForm({ amount, currency = 'sek' }) {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const formattedAmount = new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${import.meta.env.VITE_APP_URL}/payment-success`,
      },
    });

    if (error) setMessage(error.message);
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md mx-auto bg-primary border border-secondary/30 rounded-xl p-4 sm:p-6"
    >
      <h2 className="font-semibold text-white text-base sm:text-lg mb-3 sm:mb-4">
        Complete your payment
      </h2>

      <div className="max-h-[45vh] sm:max-h-[50vh] overflow-y-auto pr-1">
        <PaymentElement />
      </div>

      <button
        disabled={!stripe || loading}
        className="w-full bg-accent hover:bg-accent-dull disabled:opacity-60 disabled:cursor-not-allowed text-primary rounded-lg py-2.5 sm:py-3 text-sm sm:text-base font-semibold mt-4 transition-colors"
      >
        {loading ? 'Processing…' : `Pay ${formattedAmount}`}
      </button>

      {message && (
        <p className="text-red-400 text-xs sm:text-sm mt-2 break-words">{message}</p>
      )}

      <p className="text-center text-secondary/70 text-[11px] sm:text-xs mt-3">
        Secured by Stripe
      </p>
    </form>
  );
}
