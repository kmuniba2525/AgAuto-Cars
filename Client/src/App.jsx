import React, { Suspense, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import Login from "./Components/Login";
import Loading from "./Components/Loading";
import LanguageDialog from "./Components/LanguageDialog";

// ================= LAZY-LOADED PAGES =================
// Each page becomes its own JS chunk, fetched only when the user actually
// navigates there — instead of one giant bundle downloaded up front on
// first visit. This is the single biggest lever for initial load time:
// a shopper landing on "/" no longer pays for the seller dashboard,
// CKEditor (pulled in by AddProduct), Stripe checkout code, etc.
const Home = React.lazy(() => import("./Pages/Home"));
const AllProducts = React.lazy(() => import("./Pages/AllProducts"));
const ProductCategory = React.lazy(() => import("./Pages/ProductCategory"));
const ProductDetail = React.lazy(() => import("./Pages/ProductDetail"));
const Cart = React.lazy(() => import("./Pages/Cart"));
const AddAddress = React.lazy(() => import("./Pages/AddAddress"));
const MyOrder = React.lazy(() => import("./Pages/MyOrders"));
const TrackOrder = React.lazy(() => import("./Pages/TrackOrder"));
const Checkout = React.lazy(() => import("./Pages/Checkout"));
const PaymentSuccess = React.lazy(() => import("./Pages/PaymentSuccess"));
const RedirectLoader = React.lazy(() => import("./Pages/RedirectLoader"));

const SellerLogin = React.lazy(() => import("./Components/Seller/SellerLogin"));
const SellerLayout = React.lazy(() => import("./Pages/Seller/SellerLayout"));
const AddProduct = React.lazy(() => import("./Pages/Seller/AddProduct"));
const EditProduct = React.lazy(() => import("./Pages/Seller/EditProduct"));
const ProductList = React.lazy(() => import("./Pages/Seller/ProductList"));
const Orders = React.lazy(() => import("./Pages/Seller/Orders"));
const Analytics = React.lazy(() => import("./Pages/Seller/Analytics"));

import { useAppContext } from "./Context/AppContext";

// ================= NAVBAR / FOOTER VISIBILITY =================
// Single source of truth for which routes hide the storefront chrome.
// - Exact paths match precisely ("/checkout" only matches "/checkout").
// - Prefixes match the path and everything under it ("/seller" also
//   hides it on "/seller/orders", "/seller/product-list", etc.).
// Add or remove entries here — nothing else needs to change.
const HIDE_CHROME_EXACT = ["/checkout", "/payment-success"];
const HIDE_CHROME_PREFIXES = ["/seller"];

const shouldHideChrome = (pathname) =>
  HIDE_CHROME_EXACT.includes(pathname) ||
  HIDE_CHROME_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

const App = () => {
  const { pathname } = useLocation();
  const hideChrome = shouldHideChrome(pathname);

  const { showUserLogin, isSeller } = useAppContext();

  const [showLangDialog, setShowLangDialog] = useState(
    !localStorage.getItem("selectedLanguage")
  );

  return (
    <div className="text-default min-h-screen text-gray-700">

      {/* Language Dialog */}
      {showLangDialog && (
        <LanguageDialog onClose={() => setShowLangDialog(false)} />
      )}

      {/* Navbar */}
      {!hideChrome && <Navbar />}

      {/* Login Modal */}
      {showUserLogin && <Login />}

      {/* Toast Notifications */}
      <Toaster position="top-right" />

      {/* Routes */}
      {/* IMPORTANT: <Loading /> here is the Suspense fallback shown while a
          lazy route chunk is still downloading — e.g. on a hard reload of
          /seller. It must stay a plain spinner with no navigate() calls.
          The old version of Loading.jsx redirected to "/" on mount, which
          meant every hard reload of a lazy route bounced back to home
          before its chunk even finished loading. That redirect-with-delay
          behavior now lives only in Pages/RedirectLoader.jsx, used below
          at the dedicated /loader route. */}
      <Suspense fallback={<Loading />}>
        <Routes>

          {/* Default page */}
          <Route path="/" element={<AllProducts />} />

          {/* Home Page */}
          <Route path="/home" element={<Home />} />

          {/* Products */}
          <Route path="/products" element={<AllProducts />} />
          <Route path="/products/:category" element={<ProductCategory />} />
          <Route path="/products/:category/:id" element={<ProductDetail />} />

          {/* Cart & Orders */}
          <Route path="/cart" element={<Cart />} />
          <Route path="/add-address" element={<AddAddress />} />
          <Route path="/my-orders" element={<MyOrder />} />
          <Route path="/track-order/:id" element={<TrackOrder />} />

          {/* Payment */}
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />

          {/* Redirect helper (spinner + delayed navigate, e.g. /loader?next=my-orders) */}
          <Route path="/loader" element={<RedirectLoader />} />

          {/* Seller */}
          <Route
            path="/seller"
            element={isSeller ? <SellerLayout /> : <SellerLogin />}
          >
            <Route index element={isSeller ? <AddProduct /> : null} />
            <Route path="edit-product/:id" element={<EditProduct />} />
            <Route path="product-list" element={<ProductList />} />
            <Route path="orders" element={<Orders />} />
            <Route path="analytics" element={<Analytics />} />
          </Route>

        </Routes>
      </Suspense>

      {/* Footer */}
      {!hideChrome && <Footer />}
    </div>
  );
};

export default App;
