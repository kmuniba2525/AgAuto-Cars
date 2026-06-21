import React, { useEffect, useState } from "react";
import { useAppContext } from "../../Context/AppContext";
import toast from "react-hot-toast";
// import { BarChart3 } from "lucide-react";

const Analytics = () => {
  const { axios } = useAppContext();

  const [range, setRange] = useState("today");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAnalytics = async (selectedRange = range) => {
    try {
      setLoading(true);

      const { data } = await axios.get(
        `/api/order/analytics?range=${selectedRange}`
      );

      if (data.success) {
        setData(data);
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="flex-1 h-[95vh] overflow-y-scroll p-6 bg-gray-50">

      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-4">
        📊 Analytics Dashboard
      </h1>

      {/* FILTER BUTTONS */}
      <div className="flex gap-3 mb-6">

        {["today", "week", "month"].map((item) => (
          <button
            key={item}
            onClick={() => {
              setRange(item);
              fetchAnalytics(item);
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition

              ${
                range === item
                  ? "bg-black text-white"
                  : "bg-white border"
              }
            `}
          >
            {item.toUpperCase()}
          </button>
        ))}

      </div>

      {/* STATS CARDS */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-gray-500">Total Orders</p>
          <h2 className="text-2xl font-bold">
            {data?.totalOrders || 0}
          </h2>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-gray-500">Total Revenue</p>
          <h2 className="text-2xl font-bold">
            {data?.totalRevenue || 0} PKR
          </h2>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-gray-500">Average Order</p>
          <h2 className="text-2xl font-bold">
            {data?.orders?.length
              ? Math.round(
                  data.totalRevenue /
                    data.orders.length
                )
              : 0}{" "}
            PKR
          </h2>
        </div>

      </div>

      {/* ORDERS LIST */}
      <div className="bg-white rounded-xl shadow p-4">

        <h2 className="text-lg font-semibold mb-4">
          Orders
        </h2>

        {loading ? (
          <p>Loading...</p>
        ) : data?.orders?.length === 0 ? (
          <p className="text-gray-500">
            No orders found
          </p>
        ) : (
          <div className="space-y-3">

            {data?.orders?.map((order) => (
              <div
                key={order._id}
                className="border p-3 rounded-lg flex justify-between"
              >

                <div>
                  <p className="font-medium">
                    Order #{order._id.slice(-6)}
                  </p>

                  <p className="text-sm text-gray-500">
                    {new Date(
                      order.createdAt
                    ).toLocaleString()}
                  </p>
                </div>

                <p className="font-semibold">
                  {order.amount} PKR
                </p>

              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  );
};

export default Analytics;