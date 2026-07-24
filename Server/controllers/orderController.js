import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { errorResponse, successResponse } from "../utils/response.js";
import Stripe from "stripe";

// ✅ NEW: shared helper — validates guest info/address, since guests
// don't have a saved Address document to reference by id.
const buildGuestFields = (guestInfo, guestAddress) => {
  if (
    !guestInfo?.name ||
    !guestInfo?.email ||
    !guestInfo?.phone ||
    !guestAddress?.street ||
    !guestAddress?.city ||
    !guestAddress?.state ||
    !guestAddress?.zipcode ||
    !guestAddress?.country
  ) {
    return null;
  }
  return { guestInfo, guestAddress };
};

// ✅ NEW: only accept language codes the app actually supports — anything
// else (missing field, garbage from a stale client, etc.) silently falls
// back to "en" rather than saving invalid data on the order.
const SUPPORTED_ORDER_LANGUAGES = ["en", "pt", "sv"];
const resolveOrderLanguage = (language) =>
  SUPPORTED_ORDER_LANGUAGES.includes(language) ? language : "en";

// Place Order COD
export const placeOrderCOD = async (req, res) => {
  try {
    const { items, address, guestInfo, guestAddress, language } = req.body; // ✅ CHANGED: + language
    const userId = req.user?.id || null; // ✅ CHANGED: null for guests

    // VALIDATION
    if (!items || items.length === 0) {
      return errorResponse(res, 400, "Invalid Data");
    }

    // ✅ NEW: branch validation based on logged-in vs guest
    let guestFields = null;
    if (userId) {
      if (!address) return errorResponse(res, 400, "Invalid Data");
    } else {
      guestFields = buildGuestFields(guestInfo, guestAddress);
      if (!guestFields) {
        return errorResponse(
          res,
          400,
          "Name, email, phone and full address are required for guest checkout"
        );
      }
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
      address: userId ? address : undefined, // ✅ CHANGED
      isGuestOrder: !userId, // ✅ NEW
      ...(guestFields || {}), // ✅ NEW: spreads guestInfo + guestAddress
      paymentType: "COD",
      isPaid: true,
      language: resolveOrderLanguage(language), // ✅ NEW: invoice language
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

    // CLEAR CART — ✅ CHANGED: only for logged-in users, guests have no cart doc
    if (userId) {
      await User.findByIdAndUpdate(userId, {
        cartItems: {},
      });
    }

    // ✅ CHANGED: return orderId too — guests have no "My Orders" page to
    // fall back on, so the frontend needs the ID to show a confirmation.
    return res.json({
      success: true,
      message: "Order Placed Successfully",
      orderId: order._id,
    });
  } catch (error) {
    console.log(error.message);

    return errorResponse(res, 500, error.message);
  }
};

// Place Order STRIPE
export const placeOrderStripe = async (req, res) => {
  try {
    const { items, address, guestInfo, guestAddress, language } = req.body; // ✅ CHANGED: + language

    const userId = req.user?.id || null; // ✅ CHANGED: null for guests

    const { origin } = req.headers;

    // VALIDATION
    if (!items || items.length === 0) {
      return errorResponse(res, 400, "Invalid Data");
    }

    // ✅ NEW: branch validation based on logged-in vs guest
    let guestFields = null;
    if (userId) {
      if (!address) return errorResponse(res, 400, "Invalid Data");
    } else {
      guestFields = buildGuestFields(guestInfo, guestAddress);
      if (!guestFields) {
        return errorResponse(
          res,
          400,
          "Name, email, phone and full address are required for guest checkout"
        );
      }
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
      address: userId ? address : undefined, // ✅ CHANGED
      isGuestOrder: !userId, // ✅ NEW
      ...(guestFields || {}), // ✅ NEW
      paymentType: "Online",
      language: resolveOrderLanguage(language), // ✅ NEW: invoice language
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
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

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

    const session = await stripeInstance.checkout.sessions.create({
      line_items,

      mode: "payment",

      success_url: `${origin}/loader?next=my-orders`,

      cancel_url: `${origin}/cart`,

      // ✅ CHANGED: Stripe metadata values must be strings — "guest" fallback
      // instead of null so the webhook can safely check for it later.
      customer_email: userId ? undefined : guestInfo.email,
      metadata: {
        orderId: order._id.toString(),
        userId: userId || "guest",
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
    return response.status(400).send(`Webhook Error: ${error.message}`);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const { orderId, userId } = session.metadata;
      await Order.findByIdAndUpdate(orderId, { isPaid: true });
      // ✅ CHANGED: only clear cart for real logged-in users
      if (userId && userId !== "guest") {
        await User.findByIdAndUpdate(userId, { cartItems: {} });
      }
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
        // ✅ CHANGED: only clear cart for real logged-in users
        if (userId && userId !== "guest") {
          await User.findByIdAndUpdate(userId, { cartItems: {} });
        }
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

    // ✅ NEW: if this order belongs to a registered user, only that same
    // logged-in user can view it. Guest orders have no userId, so anyone
    // with the (unguessable) order ID can view them — same pattern most
    // checkout confirmation pages use.
    if (order.userId && (!req.user || req.user.id !== order.userId.toString())) {
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

    const now = new Date();

    if (range === "today") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);

      const end = new Date();
      end.setHours(23, 59, 59, 999);

      filter.createdAt = {
        $gte: start,
        $lte: end,
      };
    } else if (range === "week") {
      const start = new Date();
      start.setDate(now.getDate() - 7);

      filter.createdAt = {
        $gte: start,
      };
    } else if (range === "month") {
      const start = new Date();
      start.setMonth(now.getMonth() - 1);

      filter.createdAt = {
        $gte: start,
      };
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });

    const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0);

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

// ================= ADVANCED ANALYTICS (Seller Dashboard) =================
// Single endpoint that returns everything the analytics page needs:
// KPIs + growth vs previous period, revenue/orders trend, status/payment/
// guest breakdowns, top products, category revenue split, top customers,
// new-vs-returning customers, low stock alerts, and revenue by country.
const LOW_STOCK_THRESHOLD = 5;

const getDateRange = (range, customStart, customEnd) => {
  const now = new Date();
  let start;
  let end = now;

  if (range === "custom" && customStart && customEnd) {
    start = new Date(customStart);
    end = new Date(customEnd);
    end.setHours(23, 59, 59, 999);
  } else if (range === "today") {
    start = new Date();
    start.setHours(0, 0, 0, 0);
  } else if (range === "week") {
    start = new Date();
    start.setDate(now.getDate() - 7);
  } else if (range === "quarter") {
    start = new Date();
    start.setMonth(now.getMonth() - 3);
  } else if (range === "year") {
    start = new Date();
    start.setFullYear(now.getFullYear() - 1);
  } else if (range === "all") {
    start = new Date(2000, 0, 1);
  } else {
    // default: "month"
    start = new Date();
    start.setMonth(now.getMonth() - 1);
  }

  return { start, end };
};

export const getAdvancedAnalytics = async (req, res) => {
  try {
    const { range = "month", startDate, endDate } = req.query;
    const { start, end } = getDateRange(range, startDate, endDate);

    // Comparable previous period (same length) so we can show growth %.
    const durationMs = Math.max(end.getTime() - start.getTime(), 1);
    const prevEnd = new Date(start.getTime() - 1);
    const prevStart = new Date(prevEnd.getTime() - durationMs);

    const dateMatch = { createdAt: { $gte: start, $lte: end } };
    const prevDateMatch = { createdAt: { $gte: prevStart, $lte: prevEnd } };

    // Daily buckets for short windows, monthly buckets once the range
    // gets long enough that a daily chart would just be noise.
    const dayCount = durationMs / (1000 * 60 * 60 * 24);
    const trendFormat = dayCount > 90 ? "%Y-%m" : "%Y-%m-%d";

    const [
      currentSummary,
      prevSummary,
      revenueTrend,
      statusBreakdown,
      paymentBreakdown,
      customerTypeBreakdown,
      topProductsRaw,
      categoryBreakdownRaw,
      topCustomersRaw,
      lowStockProducts,
      geoBreakdownRaw,
    ] = await Promise.all([
      Order.aggregate([
        { $match: dateMatch },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: "$amount" },
            paidOrders: { $sum: { $cond: ["$isPaid", 1, 0] } },
          },
        },
      ]),
      Order.aggregate([
        { $match: prevDateMatch },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: "$amount" },
          },
        },
      ]),
      Order.aggregate([
        { $match: dateMatch },
        {
          $group: {
            _id: { $dateToString: { format: trendFormat, date: "$createdAt" } },
            revenue: { $sum: "$amount" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        { $match: dateMatch },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: dateMatch },
        {
          $group: {
            _id: "$paymentType",
            count: { $sum: 1 },
            revenue: { $sum: "$amount" },
          },
        },
      ]),
      Order.aggregate([
        { $match: dateMatch },
        {
          $group: {
            _id: "$isGuestOrder",
            count: { $sum: 1 },
            revenue: { $sum: "$amount" },
          },
        },
      ]),
      // Top products by units sold. Revenue is estimated using each
      // product's CURRENT offerPrice, since line items only store
      // quantity, not a price snapshot at purchase time.
      Order.aggregate([
        { $match: dateMatch },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.product",
            quantitySold: { $sum: "$items.quantity" },
            orderCount: { $sum: 1 },
          },
        },
        { $sort: { quantitySold: -1 } },
        { $limit: 8 },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
      ]),
      Order.aggregate([
        { $match: dateMatch },
        { $unwind: "$items" },
        {
          $lookup: {
            from: "products",
            localField: "items.product",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: { $ifNull: ["$product.category", "Unknown"] },
            quantitySold: { $sum: "$items.quantity" },
            revenue: {
              $sum: {
                $multiply: [
                  "$items.quantity",
                  { $ifNull: ["$product.offerPrice", 0] },
                ],
              },
            },
          },
        },
        { $sort: { revenue: -1 } },
      ]),
      Order.aggregate([
        { $match: { ...dateMatch, userId: { $ne: null } } },
        {
          $group: {
            _id: "$userId",
            totalSpent: { $sum: "$amount" },
            orderCount: { $sum: 1 },
          },
        },
        { $sort: { totalSpent: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      ]),
      Product.find({ stock: { $lte: LOW_STOCK_THRESHOLD } })
        .select("name category stock image")
        .sort({ stock: 1 })
        .limit(10),
      Order.aggregate([
        { $match: dateMatch },
        {
          $lookup: {
            from: "addresses",
            localField: "address",
            foreignField: "_id",
            as: "addr",
          },
        },
        { $unwind: { path: "$addr", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            country: { $ifNull: ["$addr.country", "$guestAddress.country"] },
            amount: 1,
          },
        },
        {
          $group: {
            _id: { $ifNull: ["$country", "Unknown"] },
            orders: { $sum: 1 },
            revenue: { $sum: "$amount" },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 8 },
      ]),
    ]);

    // New vs returning customers: "new" = their first-ever order (across
    // all time, not just this window) falls inside this window.
    const distinctCustomers = await Order.aggregate([
      { $match: { ...dateMatch, userId: { $ne: null } } },
      { $group: { _id: "$userId" } },
    ]);
    const customerIds = distinctCustomers.map((d) => d._id);

    let newCustomers = 0;
    let returningCustomers = 0;

    if (customerIds.length > 0) {
      const firstOrderDates = await Order.aggregate([
        { $match: { userId: { $in: customerIds } } },
        { $group: { _id: "$userId", firstOrder: { $min: "$createdAt" } } },
      ]);

      firstOrderDates.forEach((c) => {
        if (c.firstOrder >= start) newCustomers += 1;
        else returningCustomers += 1;
      });
    }

    const totalRevenue = currentSummary[0]?.totalRevenue || 0;
    const totalOrders = currentSummary[0]?.totalOrders || 0;
    const paidOrders = currentSummary[0]?.paidOrders || 0;
    const prevRevenue = prevSummary[0]?.totalRevenue || 0;
    const prevOrders = prevSummary[0]?.totalOrders || 0;

    const revenueGrowth =
      prevRevenue > 0
        ? Math.round(((totalRevenue - prevRevenue) / prevRevenue) * 1000) / 10
        : null;

    const orderGrowth =
      prevOrders > 0
        ? Math.round(((totalOrders - prevOrders) / prevOrders) * 1000) / 10
        : null;

    const topProducts = topProductsRaw.map((p) => ({
      productId: p._id,
      name: p.product?.name?.en || "Deleted product",
      category: p.product?.category || "Unknown",
      image: p.product?.image?.[0] || null,
      quantitySold: p.quantitySold,
      revenue: p.quantitySold * (p.product?.offerPrice || 0),
    }));

    const topCustomers = topCustomersRaw.map((c) => ({
      userId: c._id,
      name: c.user?.name || "Unknown",
      email: c.user?.email || "",
      totalSpent: c.totalSpent,
      orderCount: c.orderCount,
    }));

    res.json({
      success: true,
      range,
      period: { start, end },
      kpis: {
        totalRevenue,
        totalOrders,
        avgOrderValue: totalOrders ? Math.round(totalRevenue / totalOrders) : 0,
        paidOrders,
        unpaidOrders: totalOrders - paidOrders,
        revenueGrowth,
        orderGrowth,
        newCustomers,
        returningCustomers,
      },
      revenueTrend: revenueTrend.map((r) => ({
        date: r._id,
        revenue: r.revenue,
        orders: r.orders,
      })),
      statusBreakdown: statusBreakdown.map((s) => ({
        status: s._id,
        count: s.count,
      })),
      paymentBreakdown: paymentBreakdown.map((p) => ({
        type: p._id,
        count: p.count,
        revenue: p.revenue,
      })),
      customerType: customerTypeBreakdown.map((c) => ({
        isGuest: c._id,
        count: c.count,
        revenue: c.revenue,
      })),
      topProducts,
      categoryBreakdown: categoryBreakdownRaw.map((c) => ({
        category: c._id,
        quantitySold: c.quantitySold,
        revenue: c.revenue,
      })),
      topCustomers,
      lowStockProducts: lowStockProducts.map((p) => ({
        id: p._id,
        name: p.name?.en || p.name,
        category: p.category,
        stock: p.stock,
        image: p.image?.[0] || null,
      })),
      geoBreakdown: geoBreakdownRaw.map((g) => ({
        country: g._id,
        orders: g.orders,
        revenue: g.revenue,
      })),
    });
  } catch (error) {
    console.log(error);
    return errorResponse(res, 500, error.message);
  }
};

// Place Order STRIPE — Payment Intent version (for custom Payment Element UI)
export const placeOrderStripeIntent = async (req, res) => {
  try {
    const { items, address, guestInfo, guestAddress, language } = req.body; // ✅ CHANGED: + language
    const userId = req.user?.id || null; // ✅ CHANGED: null for guests

    if (!items || items.length === 0) {
      return errorResponse(res, 400, "Invalid Data");
    }

    // ✅ NEW: branch validation based on logged-in vs guest
    let guestFields = null;
    if (userId) {
      if (!address) return errorResponse(res, 400, "Invalid Data");
    } else {
      guestFields = buildGuestFields(guestInfo, guestAddress);
      if (!guestFields) {
        return errorResponse(
          res,
          400,
          "Name, email, phone and full address are required for guest checkout"
        );
      }
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
        return errorResponse(
          res,
          400,
          `${product.name} has insufficient stock`
        );
      }

      amount += product.offerPrice * item.quantity;
    }

    const tax = amount * 0.02;
    amount += Math.floor(tax);

    const order = await Order.create({
      userId,
      items,
      amount,
      address: userId ? address : undefined, // ✅ CHANGED
      isGuestOrder: !userId, // ✅ NEW
      ...(guestFields || {}), // ✅ NEW
      paymentType: "Online",
      isPaid: false,
      language: resolveOrderLanguage(language), // ✅ NEW: invoice language
    });

    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "eur",
      automatic_payment_methods: { enabled: true },
      receipt_email: userId ? undefined : guestInfo.email, // ✅ NEW
      metadata: {
        orderId: order._id.toString(),
        userId: userId || "guest", // ✅ CHANGED
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
