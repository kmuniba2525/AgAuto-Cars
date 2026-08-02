import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

export const AppContext = createContext();

const currency = import.meta.env.VITE_CURRENCY || "Rs.";

// Reads the guest cart persisted in localStorage. Used both to seed the
// initial cartItems state (so a refresh doesn't show an empty cart for a
// split second before the auth check resolves) and to restore it whenever
// fetchUser determines there's no logged-in user.
const getGuestCart = () => {
  try {
    return JSON.parse(localStorage.getItem("guestCart") || "{}");
  } catch {
    return {};
  }
};

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState(() => getGuestCart());
  const [cartReady, setCartReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // ================= SELLER AUTH =================
  const fetchSeller = async () => {
    try {
      const { data } = await axios.get("/api/seller/is-auth");
      setIsSeller(!!data.success);
    } catch (error) {
      console.log("❌ Seller auth failed:", error.message);
      setIsSeller(false);
    }
  };

  // ================= USER AUTH =================
  const fetchUser = async () => {
    try {
      const { data } = await axios.get("/api/user/is-auth");

      if (data.success) {
        const userData = data.user;

        setUser(userData);

        // ✅ KEEP THIS if you want persistent cart
        setCartItems(userData?.cartItems || {});

        setCartReady(true);
      } else {
        setUser(null);
        // Not logged in — fall back to whatever's saved as a guest cart
        // instead of clearing it. Previously this always reset to {},
        // which meant a page refresh silently wiped a guest's cart even
        // though it was still sitting in localStorage.
        setCartItems(getGuestCart());
        setCartReady(true);
      }
    } catch (error) {
      console.log("❌ fetchUser error:", error.message);
      setUser(null);
      // Same fix for the network/error path — don't blow away the guest
      // cart just because the auth check itself failed.
      setCartItems(getGuestCart());
      setCartReady(true);
    }
  };

  // ================= PRODUCTS =================
  const fetchProducts = async () => {
    try {
      const { data } = await axios.get("/api/product/list");

      if (data.success) {
        setProducts(data.products);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // addToCart — allow guests, persist locally
const addToCart = async (itemId) => {
  let cartData = structuredClone(cartItems);
  cartData[itemId] = (cartData[itemId] || 0) + 1;
  setCartItems(cartData);

  if (!user) {
    localStorage.setItem("guestCart", JSON.stringify(cartData));
    toast.success("Added To Cart 🛒");
    return;
  }

  try {
    const { data } = await axios.post("/api/cart/update", { cartItems: cartData });
    if (data.success) {
      toast.success("Added To Cart 🛒");
    } else {
      toast.error(data.message || "Could not add to cart");
    }
  } catch (error) {
    toast.error(error.response?.data?.message || "Could not add to cart");
  }
};

// ================= SYNC GUEST CART ON LOGIN =================
const syncGuestCart = async () => {
  const guestCart = JSON.parse(localStorage.getItem("guestCart") || "{}");

  if (Object.keys(guestCart).length === 0) return;

  try {
    const mergedCart = { ...cartItems };
    for (const itemId in guestCart) {
      mergedCart[itemId] = (mergedCart[itemId] || 0) + guestCart[itemId];
    }

    const { data } = await axios.post("/api/cart/update", {
      cartItems: mergedCart,
    });

    if (data.success) {
      setCartItems(mergedCart);
      localStorage.removeItem("guestCart");
    }
  } catch (error) {
    console.log("❌ Guest cart sync failed:", error.message);
  }
};

  // ================= UPDATE CART =================
  const updateCartItems = async (itemId, quantity) => {
  let cartData = structuredClone(cartItems);
  cartData[itemId] = quantity;
  setCartItems(cartData);

  if (!user) {
    localStorage.setItem("guestCart", JSON.stringify(cartData));
    return;
  }

  try {
    await axios.post("/api/cart/update", { cartItems: cartData });
  } catch (error) {
    console.log("❌ Update cart error:", error.message);
    toast.error(error.message);
  }
};

  // ================= REMOVE FROM CART =================
 const removeFromCart = async (itemId) => {
  let cartData = structuredClone(cartItems);

  if (cartData[itemId]) {
    cartData[itemId] -= 1;
    if (cartData[itemId] === 0) {
      delete cartData[itemId];
    }
  }

  setCartItems(cartData);

  if (!user) {
    localStorage.setItem("guestCart", JSON.stringify(cartData));
    return;
  }

  try {
    await axios.post("/api/cart/update", { cartItems: cartData });
  } catch (error) {
    console.log("❌ Remove cart error:", error.message);
    toast.error(error.message);
  }
};

  // ================= CART COUNT =================
  const getCartCount = () => {
    let totalCount = 0;

    for (const item in cartItems) {
      totalCount += cartItems[item];
    }

    return totalCount;
  };

  // ================= CART TOTAL =================
  const getCartAmount = () => {
    let totalAmount = 0;

    for (const itemId in cartItems) {
      let itemInfo = products.find(
        (product) => product._id === itemId
      );

      if (itemInfo && cartItems[itemId] > 0) {
        totalAmount += itemInfo.offerPrice * cartItems[itemId];
      }
    }

    return Math.floor(totalAmount * 100) / 100;
  };

  // ================= INITIAL LOAD =================
  // These three calls are independent of each other (user auth, product
  // list, seller auth all hit different endpoints and don't depend on one
  // another's result), so they should fire together instead of one after
  // another. The old sequential `await fetchUser(); await fetchProducts();
  // await fetchSeller();` meant total wait time = sum of all three
  // requests; Promise.all makes it = the slowest single one. There was
  // also a hardcoded 100ms artificial delay before anything started,
  // which had no purpose and just added dead time to every page load —
  // removed.
  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchUser(), fetchProducts(), fetchSeller()]);
      setLoading(false);
    };

    init();
  }, []);
  // ================= CONTEXT VALUE =================
  const value = {
    navigate,
    user,
    setUser,
    isSeller,
    setIsSeller,
    showUserLogin,
    setShowUserLogin,
    products,
    addToCart,
    updateCartItems,
    removeFromCart,
    currency,
    cartItems,
    searchQuery,
    setSearchQuery,
    getCartAmount,
    getCartCount,
    axios,
    loading,
    fetchProducts,
    fetchUser,
    fetchSeller,
    cartReady,
    setCartItems,
    syncGuestCart,
  };

  // ================= LOADING SCREEN =================
  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppContext);
};
