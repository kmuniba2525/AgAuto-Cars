// Server/utils/emailTemplates/orderConfirmation.js

const COPY = {
  en: {
    subject: (orderId) => `Order Confirmation - #${orderId}`,
    heading: (name) => `Thank you for your order, ${name}!`,
    confirmed: (orderId) => `Your order #${orderId} has been confirmed.`,
    item: "Item",
    qty: "Qty",
    price: "Price",
    total: "Total",
    footer: "We'll notify you again once your order ships. If you have any questions, reply to this email or contact our support team.",
    signature: "— AgAuto Cars Team",
  },
  sv: {
    subject: (orderId) => `Orderbekräftelse - #${orderId}`,
    heading: (name) => `Tack för din beställning, ${name}!`,
    confirmed: (orderId) => `Din order #${orderId} har bekräftats.`,
    item: "Vara",
    qty: "Antal",
    price: "Pris",
    total: "Totalt",
    footer: "Vi meddelar dig igen när din beställning skickas. Om du har några frågor, svara på detta mejl eller kontakta vår support.",
    signature: "— AgAuto Cars Team",
  },
  fi: {
    subject: (orderId) => `Tilausvahvistus - #${orderId}`,
    heading: (name) => `Kiitos tilauksestasi, ${name}!`,
    confirmed: (orderId) => `Tilauksesi #${orderId} on vahvistettu.`,
    item: "Tuote",
    qty: "Määrä",
    price: "Hinta",
    total: "Yhteensä",
    footer: "Ilmoitamme sinulle uudelleen, kun tilauksesi lähetetään. Jos sinulla on kysyttävää, vastaa tähän sähköpostiin tai ota yhteyttä tukeemme.",
    signature: "— AgAuto Cars Team",
  },
  da: {
    subject: (orderId) => `Ordrebekræftelse - #${orderId}`,
    heading: (name) => `Tak for din ordre, ${name}!`,
    confirmed: (orderId) => `Din ordre #${orderId} er bekræftet.`,
    item: "Vare",
    qty: "Antal",
    price: "Pris",
    total: "Total",
    footer: "Vi giver dig besked igen, når din ordre er afsendt. Har du spørgsmål, så svar på denne e-mail eller kontakt vores support.",
    signature: "— AgAuto Cars Team",
  },
  no: {
    subject: (orderId) => `Ordrebekreftelse - #${orderId}`,
    heading: (name) => `Takk for bestillingen din, ${name}!`,
    confirmed: (orderId) => `Bestillingen din #${orderId} er bekreftet.`,
    item: "Vare",
    qty: "Antall",
    price: "Pris",
    total: "Totalt",
    footer: "Vi varsler deg igjen når bestillingen din sendes. Har du spørsmål, svar på denne e-posten eller kontakt kundeservice.",
    signature: "— AgAuto Cars Team",
  },
};

const formatMoney = (amount, currency = "eur") => {
  const value = Number(amount) || 0;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency?.toUpperCase() || ""}`;
  }
};

/**
 * Builds the subject + HTML body for an order confirmation email.
 * @param {object} order - { _id, items: [{name, quantity, price}], totalAmount, currency }
 * @param {string} language - one of en/sv/fi/da/no, falls back to en
 * @returns {{ subject: string, html: string }}
 */
export const buildOrderConfirmationEmail = (order, language = "en") => {
  const t = COPY[language] || COPY.en;
  const currency = order.currency || "eur";
  const customerName = order.customerName || order.guestInfo?.name || "Customer";

  const itemsHtml = (order.items || [])
    .map(
      (item) => `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #eee;">${item.name}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${formatMoney(item.price, currency)}</td>
        </tr>`
    )
    .join("");

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#1a1a1a;">${t.heading(customerName)}</h2>
      <p>${t.confirmed(order._id)}</p>

      <table style="width:100%;border-collapse:collapse;margin-top:16px;">
        <thead>
          <tr style="background:#f5f5f5;">
            <th style="padding:8px;text-align:left;">${t.item}</th>
            <th style="padding:8px;text-align:center;">${t.qty}</th>
            <th style="padding:8px;text-align:right;">${t.price}</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <p style="margin-top:16px;font-size:16px;">
        <strong>${t.total}: ${formatMoney(order.totalAmount, currency)}</strong>
      </p>

      <p style="margin-top:24px;color:#555;">
        ${t.footer}
      </p>

      <p style="margin-top:32px;color:#999;font-size:12px;">
        ${t.signature}
      </p>
    </div>
  `;

  return { subject: t.subject(order._id), html };
};