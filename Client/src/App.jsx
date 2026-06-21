import React from 'react'
import Navbar from './Components/Navbar'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './Pages/Home'
import {Toaster} from "react-hot-toast"
import Footer from './Components/Footer'
import { useAppContext } from './Context/AppContext'
import Login from './Components/Login'
import AllProducts from './Pages/AllProducts'
import ProductCategory from './Pages/ProductCategory'
import ProductDetail from './Pages/productDetail'
import Cart from './Pages/Cart'
import AddAddress from './Pages/AddAddress'
import MyOrder from './Pages/MyOrders'
import SellerLogin from './Components/Seller/SellerLogin'
import SellerLayout from './Pages/Seller/SellerLayout'
import AddProduct from './Pages/Seller/AddProduct'
import ProductList from './Pages/Seller/ProductList'
import Orders from './Pages/Seller/Orders'
import Loading from './Components/Loading'
import TrackOrder from './Pages/TrackOrder'
import Analytics from './Pages/Seller/Analytics'
const App = () => {

  const isSellerPath=useLocation().pathname.includes("seller");
  const {showUserLogin,isSeller}=useAppContext();
  return (
    <div className='text-default min-h-screen text-gray-700 bg-white'>
      {isSellerPath?null:<Navbar/>}
      {showUserLogin?<Login/>:null}
    <Toaster position='top-right'/>


      <div>
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/products' element={<AllProducts/>}/>
          <Route path='/products/:category' element={<ProductCategory/>}/>
           <Route path='/products/:category/:id' element={<ProductDetail/>}/>
           <Route path='/cart' element={<Cart/>}/>
           <Route path='/add-address' element={<AddAddress/>}/>
           <Route path='/my-orders' element={<MyOrder/>}/>
            <Route path='/loader' element={<Loading/>}/>
            <Route path="/track-order/:id" element={<TrackOrder/>} />
           <Route path='/seller' element={isSeller?<SellerLayout/>:<SellerLogin/>}>
            <Route index element={isSeller?<AddProduct/>:null} />
            <Route path='product-list' element={<ProductList/>} />
            <Route path='orders' element={<Orders/>} />
            <Route path="analytics" element={<Analytics/>} />
           </Route>
        </Routes>
      </div>

      {!isSellerPath && <Footer/>}
    </div>
  )
}

export default App
