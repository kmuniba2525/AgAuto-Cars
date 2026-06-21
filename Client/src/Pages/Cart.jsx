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
    setCartItems // ✅ ADDED
  } = useAppContext();

  const [showAddress, setShowAddress] = useState(false);
  const [cartArray, setCartArray] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentOption, setPaymentOption] = useState("COD");
  const [loading, setLoading] = useState(false);

  // ✅ FIXED CART BUILDER
  const getCart = () => {
    const productMap = {};
    products.forEach((p) => {
      productMap[p._id] = p;
    });

    const tempArray = [];

    for (const key in cartItems) {
      const product = productMap[key];

      if (product && cartItems[key] > 0) {
        tempArray.push({
          ...product,
          quantity: cartItems[key],
        });
      }
    }

    // ✅ FORCE CLEAR UI WHEN EMPTY
    setCartArray(tempArray.length > 0 ? tempArray : []);
  };

  // ✅ Get user addresses
  const getUserAddress = async () => {
    try {
      const { data } = await axios.get("/api/address/get", {
        withCredentials: true,
      });

      if (data.success) {
        const addr = data.addresses || [];
        setAddresses(addr);

        if (addr.length > 0) {
          setSelectedAddress(addr[0]);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // ✅ PLACE ORDER (FIXED)
  const placeOrder = async () => {
    try {
      if (cartArray.length === 0) {
        return toast.error("Cart is empty");
      }

      if (!selectedAddress) {
        return toast.error("Please select an address");
      }

      setLoading(true);

      const payload = {
        items: cartArray.map((item) => ({
          product: item._id,
          quantity: item.quantity,
        })),
        address: selectedAddress._id,
      };

      if (paymentOption === "COD") {
        const { data } = await axios.post(
          "/api/order/cod",
          payload,
          { withCredentials: true }
        );

        if (data.success) {
          toast.success(data.message);

          setCartItems({});
setCartArray([]);

          navigate("/my-orders");
        } else {
          toast.error(data.message);
        }

      } else {
        const { data } = await axios.post(
          "/api/order/stripe",
          payload,
          { withCredentials: true }
        );

        if (data.success && data.url) {
          window.location.replace(data.url);
        } else {
          toast.error(data.message || "Stripe error");
        }
      }

    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ SYNC CART
  useEffect(() => {
    getCart(); // ✅ ALWAYS RUN
  }, [products, cartItems]);

  // ✅ FETCH ADDRESSES
  useEffect(() => {
    if (user) {
      getUserAddress();
    }
  }, [user]);

  // ✅ EMPTY CART UI
  if (cartArray.length === 0) {
    return (
      <div className="mt-16 text-center text-gray-500">
        <h2 className="text-2xl font-medium">Your cart is empty</h2>
        <button
          onClick={() => navigate("/products")}
          className="mt-4 px-4 py-2 bg-primary text-white"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row m-16">
      {/* LEFT SIDE */}
      <div className="flex-1 max-w-4xl">
        <h1 className="text-3xl font-medium mb-6">
          Shopping Cart{" "}
          <span className="text-sm text-primary">
            {getCartCount()} items
          </span>
        </h1>

        <div className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 pb-3">
          <p>Product Details</p>
          <p className="text-center">Subtotal</p>
          <p className="text-center">Action</p>
        </div>

        {cartArray.map((product) => (
          <div
            key={product._id}
            className="grid grid-cols-[2fr_1fr_1fr] items-center pt-3"
          >
            <div className="flex gap-4">
              <div
                onClick={() => {
                  navigate(
                    `/product/${product.category.toLowerCase()}/${product._id}`
                  );
                  scrollTo(0, 0);
                }}
                className="cursor-pointer w-24 h-24 border rounded overflow-hidden"
              >
                <img
                  src={product.image[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <p className="font-semibold">{product.name}</p>

                <div className="text-gray-500">
                  <p>Weight: {product.weight || "N/A"}</p>

                  <div className="flex items-center">
                    <p>Qty:</p>
                    <select
                      value={product.quantity}
                      onChange={(e) =>
                        updateCartItems(
                          product._id,
                          Number(e.target.value)
                        )
                      }
                      className="ml-2"
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
                </div>
              </div>
            </div>

            <p className="text-center">
              {currency}
              {product.offerPrice * product.quantity}
            </p>

            <button
              onClick={() => removeFromCart(product._id)}
              className="mx-auto"
            >
              <img
                src={assets.remove_icon}
                className="w-6 h-6"
                alt="remove"
              />
            </button>
          </div>
        ))}

        <button
          onClick={() => navigate("/products")}
          className="mt-8 text-primary"
        >
          Continue Shopping →
        </button>
      </div>

      {/* RIGHT SIDE */}
      <div className="max-w-[360px] w-full p-5 border mt-10 md:mt-0">
        <h2 className="text-xl font-medium">Order Summary</h2>

        <div className="mt-4">
          <p className="text-sm uppercase">Delivery Address</p>

          <p className="text-gray-500 mt-2">
            {selectedAddress
              ? `${selectedAddress?.street || ""}, ${selectedAddress?.city || ""}, ${selectedAddress?.state || ""}, ${selectedAddress?.country || ""}`
              : "No address found"}
          </p>

          <button
            onClick={() => setShowAddress(!showAddress)}
            className="text-primary"
          >
            Change
          </button>

          {showAddress && (
            <div className="border mt-2 bg-white">
              {addresses.length > 0 ? (
                addresses.map((addr) => (
                  <p
                    key={addr._id}
                    onClick={() => {
                      setSelectedAddress(addr);
                      setShowAddress(false);
                    }}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {addr.street}, {addr.city}
                  </p>
                ))
              ) : (
                <p className="p-2 text-gray-400">
                  No saved addresses
                </p>
              )}

              <p
                onClick={() => navigate("/add-address")}
                className="p-2 text-primary cursor-pointer"
              >
                Add address
              </p>
            </div>
          )}
        </div>

        <div className="mt-4">
          <p className="text-sm uppercase">Payment Method</p>

          <select
            onChange={(e) => setPaymentOption(e.target.value)}
            className="w-full border mt-2 p-2"
          >
            <option value="COD">Cash On Delivery</option>
            <option value="Online">Online Payment</option>
          </select>
        </div>

        <button
          onClick={placeOrder}
          disabled={loading}
          className="w-full mt-4 bg-primary text-white py-2"
        >
          {loading
            ? "Processing..."
            : paymentOption === "COD"
            ? "Place Order"
            : "Proceed to Checkout"}
        </button>
      </div>
    </div>
  );
};

export default Cart;