// Resolves customer contact + shipping details for an order regardless of
// whether it was placed by a registered user (order.address — a populated
// Address doc) or a guest (order.guestInfo + order.guestAddress, stored
// directly on the order since guests have no account to save an address to).
export const getOrderCustomer = (order) => {
  if (order?.isGuestOrder) {
    return {
      name: order?.guestInfo?.name || "Guest",
      email: order?.guestInfo?.email || "",
      phone: order?.guestInfo?.phone || order?.guestAddress?.phone || "",
      street: order?.guestAddress?.street || "",
      city: order?.guestAddress?.city || "",
      state: order?.guestAddress?.state || "",
      zipcode: order?.guestAddress?.zipcode || "",
      country: order?.guestAddress?.country || "",
      isGuest: true,
    };
  }

  const addr = order?.address || {};
  return {
    name: [addr.firstName, addr.lastName].filter(Boolean).join(" ") || "Customer",
    email: addr.email || "",
    phone: addr.phone || "",
    street: addr.street || "",
    city: addr.city || "",
    state: addr.state || "",
    zipcode: addr.zipcode || "",
    country: addr.country || "",
    isGuest: false,
  };
};