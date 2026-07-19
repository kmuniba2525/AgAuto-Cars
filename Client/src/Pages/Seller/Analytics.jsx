import React, { useEffect, useMemo, useState } from "react";
import { useAppContext } from "../../Context/AppContext";
import toast from "react-hot-toast";
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Wallet,
  Users,
  Receipt,
  AlertTriangle,
  Globe2,
  UserPlus,
  Repeat,
} from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const RANGES = [
  { key: "today", label: "Today" },
  { key: "week", label: "7D" },
  { key: "month", label: "30D" },
  { key: "quarter", label: "3M" },
  { key: "year", label: "1Y" },
  { key: "all", label: "All" },
];

const STATUS_COLORS = {
  "Order Placed": "#f59e0b",
  Preparing: "#3b82f6",
  Shipped: "#8b5cf6",
  Delivered: "#22c55e",
};

const PAYMENT_COLORS = ["#111827", "#f59e0b"];
const CATEGORY_COLORS = [
  "#111827",
  "#f59e0b",
  "#3b82f6",
  "#22c55e",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
];

const formatDateLabel = (value) => {
  // value is "YYYY-MM-DD" or "YYYY-MM"
  if (!value) return "";
  const parts = value.split("-");
  if (parts.length === 3) {
    const d = new Date(value);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }
  const d = new Date(`${value}-01`);
  return d.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
};

const KpiCard = ({ icon: Icon, label, value, growth, accent }) => (
  <div className="bg-white p-3 sm:p-4 rounded-xl shadow flex flex-col gap-2">
    <div className="flex items-center justify-between">
      <p className="text-gray-500 text-xs sm:text-sm">{label}</p>
      <div
        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shrink-0 ${accent}`}
      >
        <Icon className="w-4 h-4 text-white" />
      </div>
    </div>

    <h2 className="text-xl sm:text-2xl font-bold break-words">{value}</h2>

    {growth !== undefined && growth !== null && (
      <div
        className={`flex items-center gap-1 text-xs font-medium ${
          growth >= 0 ? "text-green-600" : "text-red-500"
        }`}
      >
        {growth >= 0 ? (
          <TrendingUp className="w-3.5 h-3.5" />
        ) : (
          <TrendingDown className="w-3.5 h-3.5" />
        )}
        <span>
          {Math.abs(growth)}% vs previous period
        </span>
      </div>
    )}
  </div>
);

const Section = ({ title, children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow p-3 sm:p-4 ${className}`}>
    <h2 className="text-base sm:text-lg font-semibold mb-4">{title}</h2>
    {children}
  </div>
);

const Analytics = () => {
  const { axios, currency } = useAppContext();

  const [range, setRange] = useState("month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAnalytics = async (opts = {}) => {
    const selectedRange = opts.range ?? range;

    try {
      setLoading(true);

      const params = new URLSearchParams({ range: selectedRange });
      if (selectedRange === "custom") {
        params.set("startDate", opts.startDate ?? customStart);
        params.set("endDate", opts.endDate ?? customEnd);
      }

      const { data: res } = await axios.get(
        `/api/order/analytics/advanced?${params.toString()}`
      );

      if (res.success) {
        setData(res);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRangeClick = (key) => {
    setRange(key);
    setShowCustom(false);
    fetchAnalytics({ range: key });
  };

  const handleCustomApply = () => {
    if (!customStart || !customEnd) {
      toast.error("Pick both a start and end date");
      return;
    }
    setRange("custom");
    fetchAnalytics({ range: "custom", startDate: customStart, endDate: customEnd });
  };

  const trendData = useMemo(
    () =>
      (data?.revenueTrend || []).map((d) => ({
        ...d,
        label: formatDateLabel(d.date),
      })),
    [data]
  );

  const statusData = data?.statusBreakdown || [];
  const paymentData = data?.paymentBreakdown || [];
  const categoryData = data?.categoryBreakdown || [];
  const topProducts = data?.topProducts || [];
  const topCustomers = data?.topCustomers || [];
  const lowStock = data?.lowStockProducts || [];
  const geo = data?.geoBreakdown || [];
  const kpis = data?.kpis || {};

  const fmtMoney = (n) => `${currency}${Math.round(n || 0).toLocaleString()}`;

  return (
    <div className="flex-1 h-[95vh] overflow-y-scroll p-4 sm:p-6 bg-gray-50">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">📊 Analytics Dashboard</h1>

        <div className="flex flex-wrap items-center gap-2">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => handleRangeClick(r.key)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition ${
                range === r.key
                  ? "bg-black text-white"
                  : "bg-white border hover:bg-gray-50"
              }`}
            >
              {r.label}
            </button>
          ))}

          <button
            onClick={() => setShowCustom((s) => !s)}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition ${
              range === "custom"
                ? "bg-black text-white"
                : "bg-white border hover:bg-gray-50"
            }`}
          >
            Custom
          </button>
        </div>
      </div>

      {showCustom && (
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-end gap-3 bg-white p-4 rounded-xl shadow mb-6">
          <div className="flex flex-col w-full sm:w-auto">
            <label className="text-xs text-gray-500 mb-1">Start date</label>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm w-full sm:w-auto"
            />
          </div>
          <div className="flex flex-col w-full sm:w-auto">
            <label className="text-xs text-gray-500 mb-1">End date</label>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm w-full sm:w-auto"
            />
          </div>
          <button
            onClick={handleCustomApply}
            className="bg-black text-white text-sm px-4 py-2 rounded-lg w-full sm:w-auto"
          >
            Apply
          </button>
        </div>
      )}

      {loading && !data ? (
        <p className="text-gray-500">Loading analytics...</p>
      ) : (
        <>
          {/* KPI CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <KpiCard
              icon={Wallet}
              label="Total Revenue"
              value={fmtMoney(kpis.totalRevenue)}
              growth={kpis.revenueGrowth}
              accent="bg-black"
            />
            <KpiCard
              icon={ShoppingBag}
              label="Total Orders"
              value={kpis.totalOrders ?? 0}
              growth={kpis.orderGrowth}
              accent="bg-amber-500"
            />
            <KpiCard
              icon={Receipt}
              label="Avg Order Value"
              value={fmtMoney(kpis.avgOrderValue)}
              accent="bg-blue-500"
            />
            <KpiCard
              icon={Users}
              label="Paid / Unpaid Orders"
              value={`${kpis.paidOrders ?? 0} / ${kpis.unpaidOrders ?? 0}`}
              accent="bg-purple-500"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl shadow flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                <UserPlus className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-gray-500 text-sm">New Customers</p>
                <h2 className="text-xl font-bold">{kpis.newCustomers ?? 0}</h2>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center shrink-0">
                <Repeat className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-gray-500 text-sm">Returning Customers</p>
                <h2 className="text-xl font-bold">
                  {kpis.returningCustomers ?? 0}
                </h2>
              </div>
            </div>
          </div>

          {/* REVENUE TREND */}
          <Section title="Revenue & Orders Trend" className="mb-6">
            {trendData.length === 0 ? (
              <p className="text-gray-500 text-sm">No data for this period.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280} className="sm:!h-[300px]">
                <ComposedChart data={trendData} margin={{ left: -10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => `${currency}${v}`}
                    width={55}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 11 }}
                    allowDecimals={false}
                    width={35}
                  />
                  <Tooltip
                    formatter={(value, name) =>
                      name === "revenue" ? fmtMoney(value) : value
                    }
                  />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    fill="#f59e0b33"
                    stroke="#f59e0b"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="orders"
                    name="Orders"
                    stroke="#111827"
                    strokeWidth={2}
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </Section>

          {/* TOP PRODUCTS + CATEGORY BREAKDOWN */}
          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
            <Section title="Top Selling Products">
              {topProducts.length === 0 ? (
                <p className="text-gray-500 text-sm">No sales in this period.</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={topProducts}
                    layout="vertical"
                    margin={{ left: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={90}
                      tick={{ fontSize: 10 }}
                    />
                    <Tooltip />
                    <Bar
                      dataKey="quantitySold"
                      name="Units Sold"
                      fill="#111827"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Section>

            <Section title="Revenue by Category">
              {categoryData.length === 0 ? (
                <p className="text-gray-500 text-sm">No data for this period.</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="revenue"
                      nameKey="category"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={2}
                    >
                      {categoryData.map((entry, i) => (
                        <Cell
                          key={entry.category}
                          fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => fmtMoney(v)} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Section>
          </div>

          {/* STATUS + PAYMENT BREAKDOWN */}
          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
            <Section title="Order Status Breakdown">
              {statusData.length === 0 ? (
                <p className="text-gray-500 text-sm">No orders in this period.</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="count"
                      nameKey="status"
                      outerRadius={90}
                      label={(d) => `${d.status}: ${d.count}`}
                    >
                      {statusData.map((entry) => (
                        <Cell
                          key={entry.status}
                          fill={STATUS_COLORS[entry.status] || "#9ca3af"}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Section>

            <Section title="Payment Method">
              {paymentData.length === 0 ? (
                <p className="text-gray-500 text-sm">No orders in this period.</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={paymentData}
                      dataKey="count"
                      nameKey="type"
                      outerRadius={90}
                      label={(d) => `${d.type}: ${d.count}`}
                    >
                      {paymentData.map((entry, i) => (
                        <Cell
                          key={entry.type}
                          fill={PAYMENT_COLORS[i % PAYMENT_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Section>
          </div>

          {/* TOP CUSTOMERS + LOW STOCK */}
          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
            <Section title="Top Customers">
              {topCustomers.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  No registered-customer orders in this period.
                </p>
              ) : (
                <div className="space-y-3">
                  {topCustomers.map((c) => (
                    <div
                      key={c.userId}
                      className="flex justify-between items-center gap-3 border-b pb-2 last:border-0"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{c.name}</p>
                        <p className="text-xs text-gray-500 truncate">{c.email}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-semibold text-sm">
                          {fmtMoney(c.totalSpent)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {c.orderCount} order{c.orderCount === 1 ? "" : "s"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            <Section title="Low Stock Alerts">
              {lowStock.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  Everything is well stocked. 🎉
                </p>
              ) : (
                <div className="space-y-3">
                  {lowStock.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between gap-3 border-b pb-2 last:border-0"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {p.image && (
                          <img
                            src={p.image}
                            alt=""
                            className="w-8 h-8 rounded object-cover shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{p.name}</p>
                          <p className="text-xs text-gray-500 truncate">{p.category}</p>
                        </div>
                      </div>

                      <span
                        className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full shrink-0 ${
                          p.stock === 0
                            ? "bg-red-100 text-red-600"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        <AlertTriangle className="w-3 h-3" />
                        {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </div>

          {/* GEOGRAPHY */}
          <Section title="Orders by Country" className="mb-6">
            {geo.length === 0 ? (
              <p className="text-gray-500 text-sm">No data for this period.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {geo.map((g) => (
                  <div
                    key={g.country}
                    className="border rounded-lg p-3 flex items-center gap-3"
                  >
                    <Globe2 className="w-5 h-5 text-gray-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{g.country}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {g.orders} orders · {fmtMoney(g.revenue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </>
      )}
    </div>
  );
};

export default Analytics;