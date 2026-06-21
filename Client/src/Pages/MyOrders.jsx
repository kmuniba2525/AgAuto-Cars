import React, { useEffect, useState } from 'react'
import { useAppContext } from '../Context/AppContext';
import { useNavigate } from 'react-router-dom';

const MyOrder = () => {

  const [myOrders, setMyOrders] = useState([]);
  const { currency, axios, user } = useAppContext();
  const navigate = useNavigate();

  const fetchMyOrders = async () => {
    try {
      const { data } = await axios.get('/api/order/user', {
        withCredentials: true
      });

      if (data.success) {
        setMyOrders(data.message || []);
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (user) {
      fetchMyOrders()
    }
  }, [user])

  return (
    <div className='m-16 pb-16'>

      <div className='flex flex-col items-end w-max mb-8'>
        <p className='text-2xl font-medium uppercase'>My Orders</p>
        <div className='w-16 h-0.5 bg-primary rounded-full'></div>
      </div>

      {/* Empty state */}
      {myOrders.length === 0 && (
        <p className="text-gray-400">No orders found</p>
      )}

      {myOrders.map((order, index) => (
        <div
          key={index}
          className='border border-gray-300 rounded-lg mb-10 py-5 px-4 max-w-4xl'
        >

          {/* Order Header */}
          <p className='flex justify-between md:items-center text-gray-400 md:font-medium flex-col md:flex-row gap-1 md:gap-0'>
            <span>OrderId: {order._id}</span>
            <span>Payment: {order.paymentType}</span>
            <span>Total Amount: {currency}{order.amount}</span>
          </p>

          {/* Items */}
          {order.items?.map((item, i) => (
            <div
              key={i}
              className={`relative bg-white text-gray-500/70 
              ${i !== order.items.length - 1 ? "border-b" : ""} 
              border-gray-300 flex flex-col md:flex-row md:items-center 
              justify-between p-4 py-5 gap-6 md:gap-16 w-full`}
            >

              {/* Left: Product Info */}
              <div className='flex items-center gap-4 mb-4 md:mb-0'>
                <div className='bg-primary/10 p-3 rounded-lg'>
                  <img
                    src={item.product?.image?.[0]}
                    alt=""
                    className='w-16 h-16 object-cover'
                  />
                </div>

                <div>
                  <h2 className='text-lg md:text-xl font-medium text-gray-800'>
                    {item.product?.name || "Product"}
                  </h2>
                  <p className='text-sm'>
                    Category: {item.product?.category || "N/A"}
                  </p>
                </div>
              </div>

              {/* Middle: Order Info */}
              <div className='flex flex-col justify-center md:ml-8 mb-4 md:mb-0'>
                <p>Quantity: {item.quantity ?? 1}</p>
                <p>Status: {order.status}</p>
                <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
              </div>

              {/* Right: Price + Track Button */}
              <div className="flex flex-col items-start md:items-end gap-2">
                
                <p className='text-primary text-base md:text-lg font-medium'>
                 After Discount: {currency}
                  {(item.product?.offerPrice || 0) * (item.quantity || 1)}
                </p>

                <button
                  onClick={() => navigate(`/track-order/${order._id}`)}
                  className="text-sm border border-primary text-primary px-3 py-1 rounded hover:bg-primary hover:text-white transition"
                >
                  Track Order
                </button>

              </div>

            </div>
          ))}

        </div>
      ))}

    </div>
  )
}

export default MyOrder;