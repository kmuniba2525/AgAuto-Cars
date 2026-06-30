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
  } = useAppContext();

  const [showAddress, setShowAddress] = useState(false);
  const [cartArray, setCartArray] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentOption, setPaymentOption] = useState("COD");
  const [loading, setLoading] = useState(false);

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
    if (!selectedAddress) return toast.error("Please select an address");

    setLoading(true);

    const payload = {
      items: cartArray.map((item) => ({
        product: item._id,
        quantity: item.quantity,
      })),
      address: selectedAddress._id,
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
          navigate("/my-orders");
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
                  <div className="flex items-center gap-2 mt-1">
                    <p>Qty:</p>
                    <select
                      value={product.quantity}
                      onChange={(e) =>
                        updateCartItems(product._id, Number(e.target.value))
                      }
                      className="border rounded px-1 py-0.5"
                    >
                      {Array(9)
                        .fill("")
                        .map((_, i) => (
                          <option key={i} value={i + 1}>
                            {i + 1}
                          </option>
                        ))}
                    </select>
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

          {/* Delivery address */}
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