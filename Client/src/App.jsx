import React, { Suspense, useState, useEffect } from "react";
import {
  Route,
  Routes,
  useLocation,
  useParams,
  Navigate,
  Outlet,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useTranslation } from "react-i18next";

import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import Login from "./Components/Login";
import Loading from "./Components/Loading";
import LanguageDialog from "./Components/LanguageDialog";

// ================= LAZY-LOADED PAGES =================
const Home = React.lazy(() => import("./Pages/Home"));
const About = React.lazy(() => import("./Pages/About"));
const Contact = React.lazy(() => import("./Pages/Contact"));
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

// ================= LOCALE ROUTING =================
const SUPPORTED_LANGS = ["en", "sv", "fi", "da", "no"]; // add "pt" back when re-enabled

const LocaleLayout = () => {
  const { lang } = useParams();
  const { i18n } = useTranslation();

  useEffect(() => {
    if (!SUPPORTED_LANGS.includes(lang)) return; // bail, redirect below handles it
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
    localStorage.setItem("selectedLanguage", lang);
    // <html lang> is now set by SEO.jsx via Helmet's htmlAttributes,
    // so it doesn't need to be set manually here too.
  }, [lang, i18n]);

  if (!SUPPORTED_LANGS.includes(lang)) {
    return <Navigate to="/en" replace />;
  }

  return <Outlet />;
};

const LegacyRedirect = () => {
  const { pathname } = useLocation();
  return <Navigate to={`/en${pathname}`} replace />;
};

// "/contact" and "/about" have no locale-agnostic route of their own (mirrors
// "/products/*" above) -- they go through the same LegacyRedirect so an old
// bookmark or external link to /contact or /about still lands correctly
// rather than 404ing.

// ================= NAVBAR / FOOTER VISIBILITY =================
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
      {showLangDialog && (
        <LanguageDialog onClose={() => setShowLangDialog(false)} />
      )}
      {!hideChrome && <Navbar />}
      {showUserLogin && <Login />}
      <Toaster position="top-right" />

      <Suspense fallback={<Loading />}>
        <Routes>

          {/* ===== Indexable, locale-prefixed routes ===== */}
          <Route path="/:lang" element={<LocaleLayout />}>
            {/* index (e.g. "/en", "/sv") matches original "/" -> AllProducts */}
            <Route index element={<AllProducts />} />
            <Route path="home" element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="products" element={<AllProducts />} />
            <Route path="products/:category" element={<ProductCategory />} />
            <Route path="products/:category/:id" element={<ProductDetail />} />
            <Route path="contact" element={<Contact />} />
          </Route>

          {/* ===== Cart & Orders (non-indexable, no locale prefix needed) ===== */}
          <Route path="/cart" element={<Cart />} />
          <Route path="/add-address" element={<AddAddress />} />
          <Route path="/my-orders" element={<MyOrder />} />
          <Route path="/track-order/:id" element={<TrackOrder />} />

          {/* ===== Payment ===== */}
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />

          <Route path="/loader" element={<RedirectLoader />} />

          {/* ===== Seller ===== */}
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

          {/* ===== Root + legacy unprefixed URLs -> redirect into /en ===== */}
          <Route path="/" element={<Navigate to="/en" replace />} />
          <Route path="/home" element={<Navigate to="/en/home" replace />} />
          <Route path="/products/*" element={<LegacyRedirect />} />
          <Route path="/products" element={<LegacyRedirect />} />
          <Route path="/contact" element={<LegacyRedirect />} />
          <Route path="/about" element={<LegacyRedirect />} />

        </Routes>
      </Suspense>

      {!hideChrome && <Footer />}
    </div>
  );
};

export default App;