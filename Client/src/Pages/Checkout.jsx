// src/pages/Checkout.jsx
import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../Components/CheckoutForm';

// ✅ FIX
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState('');


// convert euros to cents for Stripe

  // ✅ FIX — use the actual amount from sessionStorage
useEffect(() => {
  const { payload, amount } = JSON.parse(sessionStorage.getItem("pendingOrder") || "{}");
  const amountInCents = Math.round((amount || 0) * 100);

  fetch('/api/create-payment-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: amountInCents }),
  })
    .then(res => res.json())
    .then(data => setClientSecret(data.clientSecret));
}, []);

  return (
    <div>
      <h2>Complete your payment</h2>
      {clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm />
        </Elements>
      )}
    </div>
  );
}