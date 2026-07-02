import React, { useState, useEffect } from "react";
import { useAppContext } from "../Context/AppContext";
import { assets } from "../assets/assets";
import toast from "react-hot-toast";

const Cart = () => {
  const {
    products,
    currency,
    cartItems,
    removeFromCart,
    getCartAmount,
    getCartCount,
    navigate,
    updateCartItems,
    axios,
    user,
    setCartItems,
    setShowUserLogin,
  } = useAppContext();

  const [showAddress, setShowAddress] = useState(false);
  const [cartArray, setCartArray] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentOption, setPaymentOption] = useState("COD");
  const [loading, setLoading] = useState(false);

  // ✅ NEW: guest checkout fields — used only when there's no logged-in user.
  // These are never saved to an Address document, just sent with the order.
  const [guestInfo, setGuestInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [guestAddress, setGuestAddress] = useState({
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
  });

  // ✅ NEW: shown after a guest places a COD order, since guests can't
  // be sent to the login-gated "My Orders" page.
  const [guestOrderConfirmation, setGuestOrderConfirmation] = useState(null);

  const handleGuestInfoChange = (e) => {
    const { name, value } = e.target;
    setGuestInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleGuestAddressChange = (e) => {
    const { name, value } = e.target;
    setGuestAddress((prev) => ({ ...prev, [name]: value }));
  };

  const isGuestFormComplete = () =>
    guestInfo.name.trim() &&
    guestInfo.email.trim() &&
    guestInfo.phone.trim() &&
    guestAddress.street.trim() &&
    guestAddress.city.trim() &&
    guestAddress.state.trim() &&
    guestAddress.zipcode.trim() &&
    guestAddress.country.trim();

  const getCart = () => {
    const productMap = {};
    products.forEach((p) => {
      productMap[p._id] = p;
    });

    const tempArray = [];
    for (const key in cartItems) {
      const product = productMap[key];
      if (product && cartItems[key] > 0) {
        tempArray.push({ ...product, quantity: cartItems[key] });
      }
    }

    setCartArray(tempArray.length > 0 ? tempArray : []);
  };

  const getUserAddress = async () => {
    try {
      const { data } = await axios.get("/api/address/get", {
        withCredentials: true,
      });

      if (data.success) {
        const addr = data.addresses || [];
        setAddresses(addr);
        if (addr.length > 0) setSelectedAddress(addr[0]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const placeOrder = async () => {
    if (cartArray.length === 0) return toast.error("Cart is empty");

    // ✅ CHANGED: validate differently depending on logged-in vs guest
    if (user) {
      if (!selectedAddress) return toast.error("Please select an address");
    } else {
      if (!isGuestFormComplete()) {
        return toast.error("Please fill in your contact and address details");
      }
    }

    setLoading(true);

    // ✅ CHANGED: payload shape depends on whether we have a logged-in user
    const payload = user
      ? {
          items: cartArray.map((item) => ({
            product: item._id,
            quantity: item.quantity,
          })),
          address: selectedAddress._id,
        }
      : {
          items: cartArray.map((item) => ({
            product: item._id,
            quantity: item.quantity,
          })),
          guestInfo,
          guestAddress: { ...guestAddress, phone: guestInfo.phone },
        };

    try {
      if (paymentOption === "COD") {
        const { data } = await axios.post("/api/order/cod", payload, {
          withCredentials: true,
        });

        if (data.success) {
          toast.success(data.message);
          setCartItems({});
          setCartArray([]);

          // ✅ CHANGED: guests have no "My Orders" page to go to
          if (user) {
            navigate("/my-orders");
          } else {
            setGuestOrderConfirmation({ orderId: data.orderId });
          }
        } else {
          toast.error(data.message);
        }
      } else {
        sessionStorage.setItem(
          "pendingOrder",
          JSON.stringify({
            payload,
            amount: getCartAmount(),
          })
        );
        navigate("/checkout");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCart();
  }, [products, cartItems]);

  useEffect(() => {
    if (user) getUserAddress();
  }, [user]);

  // ── Guest order confirmation (after COD) ─────────────────────────
  if (guestOrderConfirmation) {
    return (
      <div className="mt-16 text-center px-4">
        <div className="max-w-md mx-auto bg-[#0d0d0d] border border-white/10 rounded-2xl p-8">
          <div className="w-14 h-14 mx-auto rounded-full bg-red-600/10 border border-red-600/20 flex items-center justify-center text-red-500 text-2xl">
            ✓
          </div>
          <h2 className="text-xl font-semibold text-white mt-4">
            Order Placed Successfully
          </h2>
          <p className="text-gray-400 text-sm mt-2">
            Your order ID is{" "}
            <span className="text-gray-200 font-medium">
              #{guestOrderConfirmation.orderId?.slice(-8)}
            </span>
            . A confirmation has been noted against the phone/email you provided.
          </p>
          <button
            onClick={() => navigate("/products")}
            className="mt-6 w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-2.5 rounded-lg transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // ── Empty cart ─────────────────────────────────────────────────
  if (cartArray.length === 0) {
    return (
      <div className="mt-16 text-center text-gray-500 px-4">
        <h2 className="text-xl sm:text-2xl font-medium">Your cart is empty</h2>
        <button
          onClick={() => navigate("/products")}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm sm:text-base"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 px-4 sm:px-8 lg:px-16 py-8 sm:py-12 lg:py-16 max-w-[1400px] mx-auto">
      {/* ── LEFT SIDE ── */}
      <div className="flex-1 min-w-0 lg:max-w-4xl">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-medium mb-4 sm:mb-6">
          Shopping Cart{" "}
          <span className="text-xs sm:text-sm text-primary">{getCartCount()} items</span>
        </h1>

        {/* Table header — desktop only */}
        <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr] text-gray-500 text-sm pb-3 border-b border-gray-200">
          <p>Product Details</p>
          <p className="text-center">Subtotal</p>
          <p className="text-center">Action</p>
        </div>

        {cartArray.map((product) => (
          <div
            key={product._id}
            className="border-b border-gray-100 sm:border-0 py-4 sm:py-0 sm:grid sm:grid-cols-[2fr_1fr_1fr] sm:items-center sm:pt-4"
          >
            <div className="flex gap-3 sm:gap-4">
              <div
                onClick={() => {
                  navigate(
                    `/products/${product.category.toLowerCase()}/${product._id}`
                  );
                  scrollTo(0, 0);
                }}
                className="cursor-pointer w-20 h-20 sm:w-24 sm:h-24 border rounded-lg overflow-hidden shrink-0"
              >
                <img
                  src={product.image[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
  <p className="font-semibold text-sm sm:text-base truncate">{product.name}</p>
  <div className="text-gray-500 text-xs sm:text-sm mt-1">
    <p>Weight: {product.weight || "N/A"}</p>
    <div className="flex items-center gap-2 mt-2">
      <p>Qty:</p>
      <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
        <button
          type="button"
          onClick={() =>
            product.quantity > 1 &&
            updateCartItems(product._id, product.quantity - 1)
          }
          disabled={product.quantity <= 1}
          className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          −
        </button>
        <span className="w-7 text-center text-sm font-medium text-gray-800 select-none">
          {product.quantity}
        </span>
        <button
          type="button"
          onClick={() =>
            product.quantity < 9 &&
            updateCartItems(product._id, product.quantity + 1)
          }
          disabled={product.quantity >= 9}
          className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          +
        </button>
      </div>
    </div>

    {/* Mobile-only: subtotal + remove inline */}
    <div className="flex items-center justify-between mt-2 sm:hidden">
      <p className="font-medium text-gray-800">
        {currency}
        {product.offerPrice * product.quantity}
      </p>
      <button onClick={() => removeFromCart(product._id)}>
        <img src={assets.remove_icon} className="w-5 h-5" alt="remove" />
      </button>
    </div>
  </div>
</div>
            </div>

            {/* Desktop-only: subtotal + remove in grid columns */}
            <p className="hidden sm:block text-center text-sm">
              {currency}
              {product.offerPrice * product.quantity}
            </p>

            <button
              onClick={() => removeFromCart(product._id)}
              className="hidden sm:flex mx-auto"
            >
              <img src={assets.remove_icon} className="w-6 h-6" alt="remove" />
            </button>
          </div>
        ))}

        <button
          onClick={() => navigate("/products")}
          className="mt-6 sm:mt-8 text-primary text-sm sm:text-base"
        >
          Continue Shopping →
        </button>
      </div>

      {/* ── RIGHT SIDE — ORDER SUMMARY ── */}
      <div className="w-full lg:max-w-[380px] lg:shrink-0">
        <div className="relative bg-[#0d0d0d] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden lg:sticky lg:top-24">
          {/* subtle red glow accent */}
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-red-600/20 blur-3xl rounded-full pointer-events-none" />

          <h2 className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2">
            Order Summary
          </h2>
          <div className="h-px bg-gradient-to-r from-red-600/60 via-white/10 to-transparent mt-3 mb-5" />

          {/* Price breakdown */}
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between text-gray-400">
              <span>Subtotal</span>
              <span className="text-gray-200">{currency}{getCartAmount()}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Shipping</span>
              <span className="text-red-500 font-medium">Free</span>
            </div>
            <div className="flex justify-between items-center pt-3 mt-2 border-t border-white/10">
              <span className="text-white font-semibold">Total</span>
              <span className="text-lg sm:text-xl font-bold text-white">
                {currency}{getCartAmount()}
              </span>
            </div>
          </div>

          {/* ✅ CHANGED: Delivery address — saved-address picker for logged-in
              users, inline guest form for everyone else */}
          {user ? (
            <div className="mt-6">
              <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">
                Delivery Address
              </p>
              <div className="mt-2 bg-white/[0.03] border border-white/10 rounded-lg p-3">
                <p className="text-gray-300 text-sm leading-snug break-words">
                  {selectedAddress
                    ? `${selectedAddress.street || ""}, ${selectedAddress.city || ""}, ${selectedAddress.state || ""}, ${selectedAddress.country || ""}`
                    : "No address found"}
                </p>
                <button
                  onClick={() => setShowAddress(!showAddress)}
                  className="text-red-500 text-xs font-semibold mt-2 hover:text-red-400 transition"
                >
                  Change address
                </button>
              </div>

              {showAddress && (
                <div className="mt-2 bg-[#161616] border border-white/10 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                  {addresses.length > 0 ? (
                    addresses.map((addr) => (
                      <p
                        key={addr._id}
                        onClick={() => {
                          setSelectedAddress(addr);
                          setShowAddress(false);
                        }}
                        className="px-3 py-2 hover:bg-white/5 cursor-pointer text-sm text-gray-300 border-b border-white/5 last:border-0 transition"
                      >
                        {addr.street}, {addr.city}
                      </p>
                    ))
                  ) : (
                    <p className="px-3 py-2 text-gray-500 text-sm">No saved addresses</p>
                  )}
                  <p
                    onClick={() => navigate("/add-address")}
                    className="px-3 py-2 text-red-500 cursor-pointer text-sm font-medium hover:bg-white/5 transition"
                  >
                    + Add new address
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-6">
              <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">
                Your Details
              </p>
              <div className="mt-2 space-y-2">
                <input
                  name="name"
                  value={guestInfo.name}
                  onChange={handleGuestInfoChange}
                  placeholder="Full Name"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600 outline-none focus:border-red-600/60 transition"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    name="email"
                    type="email"
                    value={guestInfo.email}
                    onChange={handleGuestInfoChange}
                    placeholder="Email"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600 outline-none focus:border-red-600/60 transition"
                  />
                  <input
                    name="phone"
                    value={guestInfo.phone}
                    onChange={handleGuestInfoChange}
                    placeholder="Phone"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600 outline-none focus:border-red-600/60 transition"
                  />
                </div>
              </div>

              <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold mt-4">
                Delivery Address
              </p>
              <div className="mt-2 space-y-2">
                <input
                  name="street"
                  value={guestAddress.street}
                  onChange={handleGuestAddressChange}
                  placeholder="Street Address"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600 outline-none focus:border-red-600/60 transition"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    name="city"
                    value={guestAddress.city}
                    onChange={handleGuestAddressChange}
                    placeholder="City"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600 outline-none focus:border-red-600/60 transition"
                  />
                  <input
                    name="state"
                    value={guestAddress.state}
                    onChange={handleGuestAddressChange}
                    placeholder="State"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600 outline-none focus:border-red-600/60 transition"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    name="zipcode"
                    value={guestAddress.zipcode}
                    onChange={handleGuestAddressChange}
                    placeholder="Zip Code"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600 outline-none focus:border-red-600/60 transition"
                  />
                  <input
                    name="country"
                    value={guestAddress.country}
                    onChange={handleGuestAddressChange}
                    placeholder="Country"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600 outline-none focus:border-red-600/60 transition"
                  />
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-3">
                Already have an account?{" "}
                <button
                  onClick={() => setShowUserLogin(true)}
                  className="text-red-500 hover:text-red-400 font-medium"
                >
                  Log in
                </button>{" "}
                to use a saved address.
              </p>
            </div>
          )}

          {/* Payment method */}
          <div className="mt-6">
            <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold mb-2">
              Payment Method
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setPaymentOption("COD")}
                className={`py-2 rounded-lg text-xs sm:text-sm font-medium border transition-all duration-200 ${
                  paymentOption === "COD"
                    ? "border-red-600 text-red-500 bg-red-600/10"
                    : "border-white/10 text-gray-500 bg-transparent hover:border-red-600/50 hover:text-red-400 hover:bg-red-600/5"
                }`}
              >
                Cash on Delivery
              </button>
              <button
                onClick={() => setPaymentOption("Online")}
                className={`py-2 rounded-lg text-xs sm:text-sm font-medium border transition-all duration-200 ${
                  paymentOption === "Online"
                    ? "border-red-600 text-red-500 bg-red-600/10"
                    : "border-white/10 text-gray-500 bg-transparent hover:border-red-600/50 hover:text-red-400 hover:bg-red-600/5"
                }`}
              >
                Online Payment
              </button>
            </div>
          </div>

          {/* Info banner for online payment */}
          {paymentOption === "Online" && (
            <p className="mt-3 text-xs text-gray-400 bg-white/[0.03] border border-white/10 p-3 rounded-lg leading-relaxed">
              You'll be taken to a secure payment page supporting MB Way, Multibanco, Visa, Mastercard, SEPA & Apple/Google Pay.
            </p>
          )}

          <button
            onClick={placeOrder}
            disabled={loading}
            className="w-full mt-4 bg-red-600 hover:bg-red-500 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(220,38,38,0.3)] text-sm sm:text-base"
          >
            {loading
              ? "Processing..."
              : paymentOption === "COD"
              ? "Place Order"
              : "Proceed to Payment →"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
