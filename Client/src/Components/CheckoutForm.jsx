import { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

export default function CheckoutForm({ amount }) {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

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
      className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"
    >
      <div className="max-h-[50vh] overflow-y-auto pr-1">
        <PaymentElement />
      </div>

      <button
        disabled={!stripe || loading}
        className="w-full bg-[#E8442C] hover:bg-[#d23b25] disabled:opacity-60 text-white rounded-lg py-2.5 text-sm font-medium mt-4 transition-colors"
      >
        {loading ? 'Processing…' : `Pay €${amount.toFixed(2)}`}
      </button>

      {message && (
        <p className="text-red-400 text-xs mt-2">{message}</p>
      )}

      <p className="text-center text-zinc-600 text-[11px] mt-3">
        Secured by Stripe
      </p>
    </form>
  );
}