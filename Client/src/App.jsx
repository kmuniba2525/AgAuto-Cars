import React, { useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import Login from "./Components/Login";
import Loading from "./Components/Loading";
import LanguageDialog from "./Components/LanguageDialog";

import Home from "./Pages/Home";
import AllProducts from "./Pages/AllProducts";
import ProductCategory from "./Pages/ProductCategory";
import ProductDetail from "./Pages/ProductDetail";
import Cart from "./Pages/Cart";
import AddAddress from "./Pages/AddAddress";
import MyOrder from "./Pages/MyOrders";
import TrackOrder from "./Pages/TrackOrder";
import Checkout from "./Pages/Checkout";               // 👈 new
import PaymentSuccess from "./Pages/PaymentSuccess";   // 👈 new

import SellerLogin from "./Components/Seller/SellerLogin";
import SellerLayout from "./Pages/Seller/SellerLayout";
import AddProduct from "./Pages/Seller/AddProduct";
import ProductList from "./Pages/Seller/ProductList";
import Orders from "./Pages/Seller/Orders";
import Analytics from "./Pages/Seller/Analytics";

import { useAppContext } from "./Context/AppContext";

const App = () => {
  const isSellerPath = useLocation().pathname.includes("seller");

  const { showUserLogin, isSeller } = useAppContext();

  const [showLangDialog, setShowLangDialog] = useState(
    !localStorage.getItem("selectedLanguage")
  );

  return (
    <div className="text-default min-h-screen text-gray-700 bg-white">

      {/* Language Dialog */}
      {showLangDialog && (
        <LanguageDialog onClose={() => setShowLangDialog(false)} />
      )}

      {/* Navbar */}
      {!isSellerPath && <Navbar />}

      {/* Login Modal */}
      {showUserLogin && <Login />}

      {/* Toast Notifications */}
      <Toaster position="top-right" />

      {/* Routes */}
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

        {/* Loader */}
        <Route path="/loader" element={<Loading />} />

        {/* Seller */}
        <Route
          path="/seller"
          element={isSeller ? <SellerLayout /> : <SellerLogin />}
        >
          <Route index element={isSeller ? <AddProduct /> : null} />
          <Route path="product-list" element={<ProductList />} />
          <Route path="orders" element={<Orders />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>

      </Routes>

      {/* Footer */}
      {!isSellerPath && <Footer />}
    </div>
  );
};

export default App;