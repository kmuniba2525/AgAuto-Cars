import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

export const AppContext = createContext();

const currency = import.meta.env.VITE_CURRENCY || "Rs.";

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [cartReady, setCartReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // ================= SELLER AUTH =================
  const fetchSeller = async () => {
    try {
      const { data } = await axios.get("/api/seller/is-auth");

      // console.log("🧾 Seller Auth:", data);

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
console.log("FETCH USER RESPONSE:", data);
      // console.log("👤 User Auth Response:", data);

      if (data.success) {
        // const userData = data.data?.user;
        const userData = data.user;

        setUser(userData);

        // ✅ KEEP THIS if you want persistent cart
        setCartItems(userData?.cartItems || {});

        setCartReady(true);
      } else {
        setUser(null);
        setCartItems({});
        setCartReady(true);
      }
    } catch (error) {
      console.log("❌ fetchUser error:", error.message);
      setUser(null);
      setCartItems({});
      setCartReady(true);
    }
  };

  // ================= PRODUCTS =================
  const fetchProducts = async () => {
    try {
      const { data } = await axios.get("/api/product/list");

      // console.log("📦 Products:", data);

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
    const { data } = await axios.post("/api/cart/update", {
      cartItems: guestCart,
    });

    if (data.success) {
      setCartItems(guestCart);
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

    // console.log("✏️ Update Cart:", cartData);

    setCartItems(cartData);

    try {
      await axios.post("/api/cart/update", {
        cartItems: cartData,
      });
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

    // console.log("➖ Remove From Cart:", cartData);

    setCartItems(cartData);

    try {
      await axios.post("/api/cart/update", {
        cartItems: cartData,
      });
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
useEffect(() => {
  const init = async () => {
    

    await new Promise((res) => setTimeout(res, 100)); // ✅ small delay

    await fetchUser();
    await fetchProducts();
    await fetchSeller();

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