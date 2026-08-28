import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import Address from "../models/Address.js"; // needed to look up saved address for tax/shipping info
import { errorResponse, successResponse } from "../utils/response.js";
import { toCountryCode } from "../utils/countryCodes.js"; // normalizes country name/casing to ISO alpha-2
import { getCurrencyForCountry } from "../utils/klarnaCurrency.js"; // currency should match customer's country
import Stripe from "stripe";
import { sendMail } from "../configs/mailer.js";
import { buildOrderConfirmationEmail } from "../utils/emailTemplates/orderConfirmation.js";
// shared helper — validates guest info/address, since guests
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


const SUPPORTED_ORDER_LANGUAGES = [
  "en",
  // "pt", // commented out for now — Portuguese support paused
  "sv",
  "fi",
  "da",
  "no",
];
const resolveOrderLanguage = (language) =>
  SUPPORTED_ORDER_LANGUAGES.includes(language) ? language : "en";


const resolveShippingAndCurrency = async ({ userId, address, guestInfo, guestAddress }) => {
  let shippingAddress = null;
  let rawCountry = null;

  if (userId) {
    const addr = await Address.findById(address);
    if (addr) {
      rawCountry = addr.country;
      shippingAddress = {
        name: addr.name || "Customer",
        address: {
          line1: addr.street,
          city: addr.city,
          state: addr.state,
          postal_code: addr.zipcode,
          country: toCountryCode(addr.country),
        },
      };
    }
  } else {
    rawCountry = guestAddress.country;
    shippingAddress = {
      name: guestInfo.name,
      address: {
        line1: guestAddress.street,
        city: guestAddress.city,
        state: guestAddress.state,
        postal_code: guestAddress.zipcode,
        country: toCountryCode(guestAddress.country),
      },
    };
  }

  let currency = "eur";
  if (rawCountry) {
    const isoCountry = toCountryCode(rawCountry);
    try {
      currency = getCurrencyForCountry(isoCountry);
    } catch (err) {
      currency = "eur";
    }
  }

  return { shippingAddress, currency };
};


const calculateOrderTax = async (stripeInstance, { items, productMap, currency, shippingAddress }) => {
  const taxLineItems = [];
  let subtotal = 0;

  for (const item of items) {
    const product = productMap[item.product];
    if (!product) continue;

    const lineTotal = product.offerPrice * item.quantity;
    subtotal += lineTotal;

    taxLineItems.push({
      amount: Math.round(lineTotal * 100),
      reference: product._id.toString(),
      tax_code: "txcd_99999999", // general tangible goods
    });
  }

  if (!shippingAddress?.address?.country || taxLineItems.length === 0) {
    return { subtotal, taxAmount: 0, taxCalculationId: null };
  }

  const calculation = await stripeInstance.tax.calculations.create({
    currency,
    line_items: taxLineItems,
    customer_details: {
      address: shippingAddress.address,
      address_source: "shipping",
    },
  });

  return {
    subtotal,
    taxAmount: calculation.tax_amount_exclusive / 100,
    taxCalculationId: calculation.id,
  };
};

// Place Order COD
export const placeOrderCOD = async (req, res) => {
  try {
    const { items, address, guestInfo, guestAddress, language } = req.body;
    const userId = req.user?.id || null;

    // VALIDATION
    if (!items || items.length === 0) {
      return errorResponse(res, 400, "Invalid Data");
    }

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
    const products = await Product.find({ _id: { $in: productIds } });

    const productMap = {};
    products.forEach((product) => {
      productMap[product._id.toString()] = product;
    });

    // STOCK CHECK (kept separate from tax calc so we fail fast on stock
    // before ever calling out to Stripe)
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
    }

    // TAX — real Stripe Tax calculation instead of a hardcoded 2%
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

    const { shippingAddress, currency } = await resolveShippingAndCurrency({
      userId,
      address,
      guestInfo,
      guestAddress,
    });

    const { subtotal, taxAmount, taxCalculationId } = await calculateOrderTax(
      stripeInstance,
      { items, productMap, currency, shippingAddress }
    );

    const amount = subtotal + taxAmount;
    const orderLanguage = resolveOrderLanguage(language);

    // CREATE ORDER
    const order = await Order.create({
      userId,
      items,
      amount,
      currency,
      taxAmount,
      address: userId ? address : undefined,
      isGuestOrder: !userId,
      ...(guestFields || {}),
      paymentType: "COD",
      isPaid: true,
      language: orderLanguage,
    });

    // record the tax transaction for reporting/filing now that the order
    // is confirmed paid (COD is considered paid at handoff, same as before)
    if (taxCalculationId) {
      try {
        await stripeInstance.tax.transactions.createFromCalculation({
          calculation: taxCalculationId,
          reference: order._id.toString(),
        });
      } catch (err) {
        console.log("Tax transaction error:", err.message);
      }
    }

    // REDUCE STOCK
    for (const item of items) {
      const product = productMap[item.product];
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

    // ORDER SUMMARY
    const itemSummary = items
      .map((item) => {
        const product = productMap[item.product];
        return `${item.quantity}x ${product.name}`;
      })
      .join(", ");

    await Notification.create({
      title: "New Order Received",
      message: itemSummary,
      type: "order",
    });

    // CLEAR CART — only for logged-in users, guests have no cart doc
    if (userId) {
      await User.findByIdAndUpdate(userId, { cartItems: {} });
    }

    // SEND CONFIRMATION EMAIL — never blocks the response if it fails
    const recipientEmail = userId
      ? (await User.findById(userId))?.email
      : guestInfo?.email;

    if (recipientEmail) {
      const orderForEmail = {
        _id: order._id,
        currency,
        items: items.map((item) => {
          const product = productMap[item.product];
          return {
            name: product?.name?.en || "Item",
            quantity: item.quantity,
            price: product?.offerPrice || 0,
          };
        }),
        totalAmount: amount,
        address: userId ? null : guestAddress, // populate this properly if you want saved addresses shown too
        guestInfo,
      };
      const { subject, html } = buildOrderConfirmationEmail(orderForEmail, orderLanguage);
      sendMail(recipientEmail, subject, html);
    }

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
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object;
      const { orderId, userId, taxCalculationId } = paymentIntent.metadata;
      console.log("Webhook received: payment_intent.succeeded", { orderId, taxCalculationId });

      if (orderId) {
        await Order.findByIdAndUpdate(orderId, { isPaid: true });
        console.log("Order marked as paid:", orderId);

        if (taxCalculationId) {
          try {
            console.log("Attempting tax transaction for calculation:", taxCalculationId);
            const taxTx = await stripeInstance.tax.transactions.createFromCalculation({
              calculation: taxCalculationId,
              reference: orderId,
            });
            console.log("Tax transaction created successfully:", taxTx.id);
          } catch (err) {
            console.log("Tax transaction error:", err.message, err);
          }
        } else {
          console.log("No taxCalculationId in metadata — skipping tax transaction");
        }

        // only clear cart for real logged-in users
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

        // SEND CONFIRMATION EMAIL — never blocks webhook response if it fails
        const recipientEmail =
          userId && userId !== "guest"
            ? (await User.findById(userId))?.email
            : order.guestInfo?.email;

        if (recipientEmail) {
          const orderForEmail = {
            _id: order._id,
            currency: order.currency,
            items: order.items.map((item) => {
              const product = productMap[item.product.toString()];
              return {
                name: product?.name?.en || "Item",
                quantity: item.quantity,
                price: product?.offerPrice || 0,
              };
            }),
            totalAmount: order.amount,
            address: order.isGuestOrder ? order.guestAddress : null,
            guestInfo: order.guestInfo,
          };
          const { subject, html } = buildOrderConfirmationEmail(
            orderForEmail,
            order.language || "en"
          );
          sendMail(recipientEmail, subject, html);
        }
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

    const orders = await Order.find({ userId })
      .populate("items.product address")
      .sort({ createdAt: -1 });

    return successResponse(res, 200, orders);
  } catch (error) {
    console.log(error.message);
    return errorResponse(res, 500, error.message);
  }
};

// details of every single order
export const getSingleOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.product")
      .populate("address");

    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }

    // if this order belongs to a registered user, only that same
    // logged-in user can view it. Guest orders have no userId, so anyone
    // with the (unguessable) order ID can view them — same pattern most
    // checkout confirmation pages use.
    if (order.userId && (!req.user || req.user.id !== order.userId.toString())) {
      return res.json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.json({ success: false, message: error.message });
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
    await Order.findByIdAndUpdate(req.params.id, { status });
    res.json({ success: true, message: "Status updated" });
  } catch (error) {
    res.json({ success: false, message: error.message });
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
      filter.createdAt = { $gte: start, $lte: end };
    } else if (range === "week") {
      const start = new Date();
      start.setDate(now.getDate() - 7);
      filter.createdAt = { $gte: start };
    } else if (range === "month") {
      const start = new Date();
      start.setMonth(now.getMonth() - 1);
      filter.createdAt = { $gte: start };
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
    res.json({ success: false, message: error.message });
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
    start = new Date();
    start.setMonth(now.getMonth() - 1);
  }

  return { start, end };
};

export const getAdvancedAnalytics = async (req, res) => {
  try {
    const { range = "month", startDate, endDate } = req.query;
    const { start, end } = getDateRange(range, startDate, endDate);

    const durationMs = Math.max(end.getTime() - start.getTime(), 1);
    const prevEnd = new Date(start.getTime() - 1);
    const prevStart = new Date(prevEnd.getTime() - durationMs);

    const dateMatch = { createdAt: { $gte: start, $lte: end } };
    const prevDateMatch = { createdAt: { $gte: prevStart, $lte: prevEnd } };

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
    const { items, address, guestInfo, guestAddress, language } = req.body;
    const userId = req.user?.id || null;

    if (!items || items.length === 0) {
      return errorResponse(res, 400, "Invalid Data");
    }

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

    // STOCK CHECK (before we call out to Stripe for tax/payment)
    for (const item of items) {
      const product = productMap[item.product];
      if (!product) continue;
      if (product.stock < item.quantity) {
        return errorResponse(res, 400, `${product.name} has insufficient stock`);
      }
    }

    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

    // resolve shipping address + currency BEFORE calculating tax,
    // since Stripe Tax needs to know where the customer is to pick the right rate.
    const { shippingAddress, currency } = await resolveShippingAndCurrency({
      userId,
      address,
      guestInfo,
      guestAddress,
    });

    const { subtotal, taxAmount, taxCalculationId } = await calculateOrderTax(
      stripeInstance,
      { items, productMap, currency, shippingAddress }
    );

    const amount = subtotal + taxAmount;

    // CREATE ORDER
    const order = await Order.create({
      userId,
      items,
      amount,
      currency,
      taxAmount,
      address: userId ? address : undefined,
      isGuestOrder: !userId,
      ...(guestFields || {}),
      paymentType: "Online",
      isPaid: false,
      language: resolveOrderLanguage(language),
    });

    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      automatic_payment_methods: { enabled: true },
      ...(shippingAddress && { shipping: shippingAddress }),
      receipt_email: userId ? undefined : guestInfo.email,
      metadata: {
        orderId: order._id.toString(),
        userId: userId || "guest",
        taxCalculationId: taxCalculationId || "",
      },
    });

    return res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      orderId: order._id,
      amount,
      currency, // frontend needs this to display/format the correct currency
    });
  } catch (error) {
    console.log(error.message);
    return errorResponse(res, 500, error.message);
  }
};