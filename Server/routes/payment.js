import express from 'express';
import Stripe from 'stripe';

const router = express.Router();
const stripe =new Stripe(process.env.STRIPE_SECRET_KEY);

// Create a payment intent
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount } = req.body; // amount in cents, e.g. 1000 = €10.00

    const paymentIntent = await stripe.paymentIntents.create({
  amount,
  currency: 'eur',
  automatic_payment_methods: { enabled: true },
});

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;