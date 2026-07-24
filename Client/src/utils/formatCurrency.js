export const formatCurrency = (amount, currency) => {
  const num = Number(amount) || 0;
  return `${num.toLocaleString()} ${currency}`;
};