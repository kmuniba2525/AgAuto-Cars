import React from "react";
import { useAppContext } from "../../Context/AppContext";
import { assets } from "../../assets/assets";
import { getLocalizedText } from "../../utils/getLocalizedText";
import { getOrderCustomer } from "../../utils/getOrderCustomer";
import { Printer, X } from "lucide-react";

// A printable invoice for a single order. Rendered as an on-screen preview
// modal; when the seller clicks "Print", window.print() fires.
//
// NOTE: the backdrop/sizing here use inline styles rather than Tailwind's
// `bg-black/50` / `max-w-2xl` utilities. Those depend on the project's
// Tailwind build picking up opacity-slash and arbitrary-width classes on a
// brand-new file, which isn't always reliable with hot-reload — if it
// doesn't compile, you get exactly the bug you saw: a transparent backdrop
// and an oversized card. Inline styles always apply, so the modal renders
// correctly regardless of the CSS build. Print behavior uses the same
// belt-and-suspenders approach: a plain <style> tag with `visibility`
// rules, instead of relying only on Tailwind's `print:` variant.
const Invoice = ({ order, onClose }) => {
  const { currency } = useAppContext();

  if (!order) return null;

  const customer = getOrderCustomer(order);

  const invoiceNumber = order._id
    ? order._id.slice(-8).toUpperCase()
    : "N/A";

  const issueDate = order.createdAt
    ? new Date(order.createdAt)
    : new Date();

  const items = order.items || [];

  const lineItems = items.map((item) => {
    const unitPrice = item?.product?.offerPrice ?? item?.product?.price ?? 0;
    const name = getLocalizedText(item?.product?.name, "en") || "Product";
    const quantity = item?.quantity || 0;

    return {
      name,
      quantity,
      unitPrice,
      lineTotal: unitPrice * quantity,
    };
  });

  const subtotal = lineItems.reduce((sum, li) => sum + li.lineTotal, 0);
  const total = order.amount || 0;
  // Line-item prices reflect the CURRENT catalog price, not a snapshot
  // taken at purchase time (the order schema doesn't store one), so an
  // older order can legitimately show a subtotal that no longer matches
  // the amount actually charged if prices changed since.
  const pricesMayHaveChanged = Math.round(subtotal) !== Math.round(total);

  const fmt = (n) => `${currency}${Number(n || 0).toLocaleString()}`;

  return (
    <div
      className="invoice-overlay"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: "rgba(15, 15, 15, 0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        overflowY: "auto",
      }}
    >
      <div
        className="invoice-card bg-white rounded-2xl shadow-xl"
        style={{
          width: "100%",
          maxWidth: "42rem",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* TOOLBAR — hidden when printing */}
        <div className="invoice-no-print flex items-center justify-between px-6 py-4 border-b">
          <h3 className="font-semibold text-gray-800">Invoice Preview</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-primary text-white text-sm px-4 py-2 rounded-lg"
            >
              <Printer size={16} />
              Print
            </button>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-9 h-9 rounded-lg border text-gray-500 hover:bg-gray-50"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* INVOICE BODY */}
        <div className="p-8 print:p-10">
          {/* HEADER */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <img src={assets.Logo2} alt="AG Auto Cars" className="w-36 mb-2" />
              <p className="text-sm text-gray-500">Automotive Parts & Products</p>
            </div>

            <div className="text-right">
              <h1 className="text-2xl font-bold text-gray-800">INVOICE</h1>
              <p className="text-sm text-gray-500 mt-1">
                #{invoiceNumber}
              </p>
              <p className="text-sm text-gray-500">
                {issueDate.toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* BILL TO + STATUS */}
          <div className="flex flex-wrap justify-between gap-6 mb-8">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase mb-1">
                Bill To
              </p>
              <p className="font-semibold text-gray-800">
                {customer.name}
                {customer.isGuest && (
                  <span className="ml-2 text-xs font-normal text-gray-400">
                    (Guest)
                  </span>
                )}
              </p>
              {customer.email && (
                <p className="text-sm text-gray-600">{customer.email}</p>
              )}
              {customer.phone && (
                <p className="text-sm text-gray-600">{customer.phone}</p>
              )}
              <p className="text-sm text-gray-600 mt-1">
                {[customer.street, customer.city].filter(Boolean).join(", ")}
              </p>
              <p className="text-sm text-gray-600">
                {[customer.state, customer.zipcode, customer.country]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-1">
                Status
              </p>
              <p className="font-medium text-gray-800">{order.status}</p>

              <p className="text-xs font-semibold text-gray-400 uppercase mt-3 mb-1">
                Payment
              </p>
              <p className="font-medium text-gray-800">
                {order.paymentType} · {order.isPaid ? "Paid" : "Pending"}
              </p>
            </div>
          </div>

          {/* ITEMS TABLE */}
          <table className="w-full text-sm mb-6">
            <thead>
              <tr className="border-b-2 border-gray-800 text-left text-gray-500">
                <th className="py-2 font-semibold">Item</th>
                <th className="py-2 font-semibold text-center">Qty</th>
                <th className="py-2 font-semibold text-right">Unit Price</th>
                <th className="py-2 font-semibold text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-gray-400">
                    No items on this order
                  </td>
                </tr>
              ) : (
                lineItems.map((li, idx) => (
                  <tr key={idx} className="border-b border-gray-100">
                    <td className="py-3 text-gray-800">{li.name}</td>
                    <td className="py-3 text-center text-gray-600">
                      {li.quantity}
                    </td>
                    <td className="py-3 text-right text-gray-600">
                      {fmt(li.unitPrice)}
                    </td>
                    <td className="py-3 text-right font-medium text-gray-800">
                      {fmt(li.lineTotal)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* SUMMARY */}
          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Items Subtotal</span>
                <span>{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t-2 border-gray-800">
                <span>Total Charged</span>
                <span>{fmt(total)}</span>
              </div>
            </div>
          </div>

          {pricesMayHaveChanged && (
            <p className="text-xs text-gray-400 mt-3 text-right">
              Unit prices reflect current catalog pricing and may differ
              slightly from the price at the time this order was placed.
            </p>
          )}

          {/* FOOTER */}
          <div className="mt-10 pt-6 border-t text-center text-xs text-gray-400">
            Thank you for shopping with AG Auto Cars.
          </div>
        </div>
      </div>

      {/* Print rules as plain CSS, not Tailwind's print: variant — this
          guarantees "print only the invoice" works even if Tailwind's
          print:hidden utility isn't compiling for some reason. The
          visibility trick keeps layout intact (unlike display:none on
          ancestors, which can collapse the invoice's own box too). */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .invoice-overlay,
          .invoice-overlay * {
            visibility: visible;
          }
          .invoice-overlay {
            position: static !important;
            background: none !important;
            display: block !important;
            padding: 0 !important;
            overflow: visible !important;
          }
          .invoice-card {
            max-width: 100% !important;
            max-height: none !important;
            width: 100% !important;
            overflow: visible !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          .invoice-no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Invoice;
