// src/pages/PaymentSuccess.jsx
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const clientSecret = searchParams.get('payment_intent_client_secret');
    if (!clientSecret) return;

    stripePromise.then(stripe => {
      stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
        setStatus(paymentIntent.status);
      });
    });
  }, []);

  const messages = {
    succeeded:        '✅ Payment successful! Thank you.',
    processing:       '⏳ Payment is processing — we will confirm shortly.',
    requires_action:  '📱 Please complete the payment on your phone (MB Way).',
    default:          '❌ Something went wrong.',
    requires_payment_method: '❌ Payment failed. Please try again.',

  };

  return <p>{messages[status] ?? messages.default}</p>;
}