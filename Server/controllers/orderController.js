import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { errorResponse, successResponse } from "../utils/response.js";
import Stripe from "stripe";

// Place Order COD
export const placeOrderCOD = async (req, res) => {
  try {
    const { items, address } = req.body;
    const userId = req.user.id;

    // VALIDATION
    if (!address || !items || items.length === 0) {
      return errorResponse(res, 400, "Invalid Data");
    }

    // GET PRODUCTS
    const productIds = items.map((item) => item.product);

    const products = await Product.find({
      _id: { $in: productIds },
    });

    // PRODUCT MAP
    const productMap = {};

    products.forEach((product) => {
      productMap[product._id.toString()] = product;
    });

    // CALCULATE TOTAL
    let amount = 0;

    for (const item of items) {
      const product = productMap[item.product];

      if (!product) continue;

      // STOCK CHECK
      if (product.stock < item.quantity) {
        return errorResponse(
          res,
          400,
          `${product.name} has insufficient stock`
        );
      }

      amount += product.offerPrice * item.quantity;
    }

    // TAX
    const tax = amount * 0.02;
    amount += Math.floor(tax);

    // CREATE ORDER
    const order = await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "COD",
      isPaid: true,
    });

    // REDUCE STOCK
    for (const item of items) {
      const product = productMap[item.product];

      if (!product) continue;

      product.stock -= item.quantity;

      await product.save();

      // LOW STOCK ALERT
      if (product.stock === 5) {
        await Notification.create({
          title: "Low Stock Alert",
          message: `Only ${product.stock} ${product.name} left in inventory`,
          type: "stock",
        });
      }

      // OUT OF STOCK ALERT
      if (product.stock === 0) {
        await Notification.create({
          title: "Out Of Stock",
          message: `${product.name} is now out of stock`,
          type: "stock",
        });
      }
    }

    // ORDER SUMMARY
    const itemSummary = items
      .map((item) => {
        const product = productMap[item.product];

        return `${item.quantity}x ${product.name}`;
      })
      .join(", ");

    // CREATE ORDER NOTIFICATION
    await Notification.create({
      title: "New Order Received",
      message: itemSummary,
      type: "order",
    });

    // CLEAR CART
    await User.findByIdAndUpdate(userId, {
      cartItems: {},
    });

    return successResponse(
      res,
      200,
      "Order Placed Successfully"
    );

  } catch (error) {
    console.log(error.message);

    return errorResponse(res, 500, error.message);
  }
};

// Place Order STRIPE
export const placeOrderStripe = async (req, res) => {
  try {
    const { items, address } = req.body;

    const userId = req.user.id;

    const { origin } = req.headers;

    // VALIDATION
    if (!address || !items || items.length === 0) {
      return errorResponse(res, 400, "Invalid Data");
    }

    // GET PRODUCTS
    const productIds = items.map((item) => item.product);

    const products = await Product.find({
      _id: { $in: productIds },
    });

    // PRODUCT MAP
    const productMap = {};

    products.forEach((product) => {
      productMap[product._id.toString()] = product;
    });

    let amount = 0;
    let productData = [];

    // CALCULATE TOTAL
    for (const item of items) {
      const product = productMap[item.product];

      if (!product) continue;

      // STOCK CHECK
      if (product.stock < item.quantity) {
        return errorResponse(
          res,
          400,
          `${product.name} has insufficient stock`
        );
      }

      amount += product.offerPrice * item.quantity;

      productData.push({
        name: product.name,
        price: product.offerPrice,
        quantity: item.quantity,
      });
    }

    // TAX
    const tax = amount * 0.02;
    amount += Math.floor(tax);

    // CREATE ORDER
    const order = await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "Online",
    });

    // REDUCE STOCK
    for (const item of items) {
      const product = productMap[item.product];

      if (!product) continue;

      product.stock -= item.quantity;

      await product.save();

      // LOW STOCK ALERT
      if (product.stock === 5) {
        await Notification.create({
          title: "Low Stock Alert",
          message: `Only ${product.stock} ${product.name} left in inventory`,
          type: "stock",
        });
      }

      // OUT OF STOCK ALERT
      if (product.stock === 0) {
        await Notification.create({
          title: "Out Of Stock",
          message: `${product.name} is now out of stock`,
          type: "stock",
        });
      }
    }

    // ORDER SUMMARY
    const itemSummary = items
      .map((item) => {
        const product = productMap[item.product];

        return `${item.quantity}x ${product.name}`;
      })
      .join(", ");

    // ORDER NOTIFICATION
    await Notification.create({
      title: "New Online Order",
      message: itemSummary,
      type: "order",
    });

    // STRIPE
    const stripeInstance = new Stripe(
      process.env.STRIPE_SECRET_KEY
    );

    const line_items = productData.map((item) => {
      const finalPrice = item.price * 1.02;

      return {
        price_data: {
          currency: "pkr",

          product_data: {
            name: item.name,
          },

          unit_amount: Math.floor(finalPrice * 100),
        },

        quantity: item.quantity,
      };
    });

    const session =
      await stripeInstance.checkout.sessions.create({
        line_items,

        mode: "payment",

        success_url: `${origin}/loader?next=my-orders`,

        cancel_url: `${origin}/cart`,

        metadata: {
          orderId: order._id.toString(),
          userId,
        },
      });

    return res.json({
      success: true,
      url: session.url,
    });

  } catch (error) {
    console.log(error.message);

    return errorResponse(res, 500, error.message);
  }
};

// STRIPE WEBHOOK
export const stripeWebhooks = async (request, response) => {
  const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

  const sig = request.headers["stripe-signature"];
  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return response
      .status(400)
      .send(`Webhook Error: ${error.message}`);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const { orderId, userId } = session.metadata;
      await Order.findByIdAndUpdate(orderId, { isPaid: true });
      await User.findByIdAndUpdate(userId, { cartItems: {} });
      break;
    }
    case "checkout.session.async_payment_failed": {
      const session = event.data.object;
      const { orderId } = session.metadata;
      await Order.findByIdAndDelete(orderId);
      break;
    }
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object;
      const { orderId, userId } = paymentIntent.metadata;
      if (orderId) {
        await Order.findByIdAndUpdate(orderId, { isPaid: true });
        await User.findByIdAndUpdate(userId, { cartItems: {} });
        const order = await Order.findById(orderId);
        const productIds = order.items.map((item) => item.product);
        const products = await Product.find({ _id: { $in: productIds } });
        const productMap = {};
        products.forEach((p) => (productMap[p._id.toString()] = p));
        for (const item of order.items) {
          const product = productMap[item.product.toString()];
          if (!product) continue;
          product.stock -= item.quantity;
          await product.save();
          if (product.stock === 5) {
            await Notification.create({
              title: "Low Stock Alert",
              message: `Only ${product.stock} ${product.name} left in inventory`,
              type: "stock",
            });
          }
          if (product.stock === 0) {
            await Notification.create({
              title: "Out Of Stock",
              message: `${product.name} is now out of stock`,
              type: "stock",
            });
          }
        }
        const itemSummary = order.items
          .map((item) => {
            const product = productMap[item.product.toString()];
            return `${item.quantity}x ${product?.name ?? "item"}`;
          })
          .join(", ");
        await Notification.create({
          title: "New Online Order",
          message: itemSummary,
          type: "order",
        });
      }
      break;
    }
    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object;
      const { orderId } = paymentIntent.metadata;
      if (orderId) {
        await Order.findByIdAndDelete(orderId);
      }
      break;
    }
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  response.json({ received: true });
};

// Get all orders by UserId
export const getUserOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.find({
      userId,
      
    })
      .populate("items.product address")
      .sort({ createdAt: -1 });

    return successResponse(res, 200, orders);
  } catch (error) {
    console.log(error.message);
    return errorResponse(res, 500, error.message);
  }
};

//details of every single order
export const getSingleOrder = async (req, res) => {
  try {

    const order = await Order.findById(req.params.id)
      .populate("items.product")
      .populate("address");

    if (!order) {
      return res.json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      order,
    });

  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Get all orders (Admin/Seller)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("items.product")
      .populate("address")
      .sort({ createdAt: -1 });

    // console.log("REQ.USER:", req.user);

    return successResponse(res, 200, orders);
  } catch (error) {
    console.log(error.message);
    return errorResponse(res, 500, error.message);
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    await Order.findByIdAndUpdate(req.params.id, {
      status,
    });

    res.json({
      success: true,
      message: "Status updated",
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};


// To get Analytics
export const getAnalytics = async (req, res) => {
  try {

    const { range } = req.query;

    let filter = {};

    // CURRENT DATE
    const now = new Date();

    // TODAY
    if (range === "today") {

      const start = new Date();
      start.setHours(0, 0, 0, 0);

      const end = new Date();
      end.setHours(23, 59, 59, 999);

      filter.createdAt = {
        $gte: start,
        $lte: end,
      };
    }

    // WEEK
    else if (range === "week") {

      const start = new Date();
      start.setDate(now.getDate() - 7);

      filter.createdAt = {
        $gte: start,
      };
    }

    // MONTH
    else if (range === "month") {

      const start = new Date();
      start.setMonth(now.getMonth() - 1);

      filter.createdAt = {
        $gte: start,
      };
    }

    // FETCH ORDERS
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 });

    // TOTAL REVENUE
    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.amount,
      0
    );

    res.json({
      success: true,
      totalOrders: orders.length,
      totalRevenue,
      orders,
    });

  } catch (error) {

    console.log(error);

    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Place Order STRIPE — Payment Intent version (for custom Payment Element UI)
export const placeOrderStripeIntent = async (req, res) => {
  try {
    const { items, address } = req.body;
    const userId = req.user.id;

    if (!address || !items || items.length === 0) {
      return errorResponse(res, 400, "Invalid Data");
    }

    const productIds = items.map((item) => item.product);
    const products = await Product.find({ _id: { $in: productIds } });

    const productMap = {};
    products.forEach((product) => {
      productMap[product._id.toString()] = product;
    });

    let amount = 0;

    for (const item of items) {
      const product = productMap[item.product];
      if (!product) continue;

      if (product.stock < item.quantity) {
        return errorResponse(res, 400, `${product.name} has insufficient stock`);
      }

      amount += product.offerPrice * item.quantity;
    }

    const tax = amount * 0.02;
    amount += Math.floor(tax);

    const order = await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "Online",
      isPaid: false,
    });

    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "eur",
      automatic_payment_methods: { enabled: true },
      metadata: {
        orderId: order._id.toString(),
        userId,
      },
    });

    return res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      orderId: order._id,
       amount,
    });
  } catch (error) {
    console.log(error.message);
    return errorResponse(res, 500, error.message);
  }
};