import React, { useEffect, useState } from "react";
import { useAppContext } from "../../Context/AppContext";
import { assets } from "../../assets/assets";
import { Link, NavLink, Outlet } from "react-router-dom";
import toast from "react-hot-toast";

const SellerLayout = () => {

    const { axios, navigate } = useAppContext();

    // ================= LOGOUT =================
    const logout = async () => {
        try {

            const { data } = await axios.get(
                "/api/seller/logout"
            );

            if (data.success) {
                toast.success(data.message);
                navigate("/");
            } else {
                toast.error(data.message);
            }

        } catch (error) {
            toast.error(error.message);
        }
    };

    // ================= NOTIFICATIONS =================
    const [showNotifications, setShowNotifications] =
        useState(false);

    const [notifications, setNotifications] =
        useState([]);

    // ================= FETCH NOTIFICATIONS =================
    const fetchNotifications = async () => {
        try {

            const { data } = await axios.get(
                "/api/notification"
            );

            if (data.success) {
                setNotifications(data.notifications);
            }

        } catch (error) {
            console.log(error.message);
        }
    };

    // ================= AUTO LOAD =================
    useEffect(() => {

        fetchNotifications();

        // auto refresh every 5 sec
        const interval = setInterval(() => {
            fetchNotifications();
        }, 5000);

        return () => clearInterval(interval);

    }, []);

    // ================= TOGGLE DROPDOWN =================
    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
    };

    // ================= DELETE NOTIFICATION =================
    const clearNotification = async (id) => {
        try {

            const { data } = await axios.delete(
                `/api/notification/${id}`
            );

            if (data.success) {

                setNotifications((prev) =>
                    prev.filter(
                        (item) => item._id !== id
                    )
                );

                toast.success("Notification removed");

            }

        } catch (error) {
            console.log(error.message);
        }
    };

    // ================= SIDEBAR OPEN/CLOSE (mobile) =================
    // On md+ screens the sidebar is always visible (static, icon-only or
    // full width). Below md it's an off-canvas drawer controlled by this
    // flag, opened via the hamburger button in the topbar and closed via
    // the backdrop, the X button, or picking a link.
    const [showSidebar, setShowSidebar] = useState(false);
    const closeSidebar = () => setShowSidebar(false);

    // ================= SIDEBAR LINKS =================
    const sidebarLinks = [
        {
            name: "Add Product",
            path: "/seller",
            icon: assets.add_icon,
        },
        {
            name: "Product List",
            path: "/seller/product-list",
            icon: assets.product_list_icon,
        },
        {
            name: "Orders",
            path: "/seller/orders",
            icon: assets.order_icon,
        },
        {
  name: "Analytics",
  path: "/seller/analytics",
  icon: assets.chart_icon,
},
    ];

    return (
        <>
            {/* ================= TOPBAR ================= */}
            <div className="flex items-center justify-between px-4 md:px-8 border-b border-primary-dull py-2 bg-primary transition-all duration-300">

                {/* LEFT: HAMBURGER (mobile only) + LOGO */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowSidebar(true)}
                        className="md:hidden -ml-1 p-1.5 rounded hover:bg-white/10 text-gray-300"
                        aria-label="Open menu"
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    </button>

                    <Link to="/" className="hidden md:block">
                        <img
                            src={assets.Logo2}
                            alt="logo"
                            className="cursor-pointer w-24 sm:w-28 md:w-32"
                        />
                    </Link>
                </div>

                {/* RIGHT SECTION */}
                <div className="flex items-center gap-3 sm:gap-5 text-gray-300">

                    {/* ================= NOTIFICATION BELL ================= */}
                    <div
                        className="relative cursor-pointer"
                        onClick={toggleNotifications}
                    >

                        <img
                            src={assets.bell_icon}
                            alt="bell"
                            className="w-6 h-6 brightness-0 invert opacity-80"
                        />

                        {/* BADGE */}
                        {notifications.length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 rounded-full">
                                {notifications.length}
                            </span>
                        )}

                        {/* ================= DROPDOWN ================= */}
                       {showNotifications && (
    <div className="absolute right-0 mt-3 w-72 sm:w-80 max-w-[90vw] bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto">

        {/* HEADER */}
        <div className="p-3 border-b sticky top-0 bg-white">
            <h2 className="font-semibold text-gray-700">
                Notifications
            </h2>
        </div>

        {/* EMPTY */}
        {notifications.length === 0 ? (

            <p className="p-4 text-sm text-gray-400 text-center">
                No notifications
            </p>

        ) : (

            notifications.map((note) => (

                <div
                    key={note._id}
                    className={`flex justify-between items-start gap-3 p-4 border-b transition-all duration-200 hover:bg-gray-50
                        
                        ${
                            note.type === "stock"
                                ? "bg-red-50"
                                : note.type === "order"
                                ? "bg-green-50"
                                : "bg-blue-50"
                        }
                    `}
                >

                    {/* LEFT */}
                    <div className="flex-1 min-w-0">

                        {/* TITLE */}
                        <h3 className="font-semibold text-sm text-gray-800">
                            {note.title}
                        </h3>

                        {/* MESSAGE */}
                        <p className="text-sm text-gray-600 mt-1 break-words">
                            {note.message}
                        </p>

                        {/* TIME */}
                        <p className="text-xs text-gray-400 mt-2">
                            {new Date(
                                note.createdAt
                            ).toLocaleString()}
                        </p>
                    </div>

                    {/* DELETE BUTTON */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();

                            clearNotification(note._id);
                        }}
                        className="text-gray-400 hover:text-red-500 transition shrink-0"
                    >
                        ✕
                    </button>
                </div>

            ))
        )}
    </div>
)}
                    </div>

                    {/* ADMIN */}
                    <p className="hidden sm:block text-gray-200">Hi! Admin</p>

                    {/* LOGOUT */}
                    <button
                        onClick={logout}
                        className="border border-white/30 text-white cursor-pointer rounded-full text-sm px-3 sm:px-4 py-1 hover:bg-white/10 whitespace-nowrap transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* ================= MAIN LAYOUT ================= */}
            <div className="flex relative">

                {/* BACKDROP — mobile only, closes drawer on tap */}
                {showSidebar && (
                    <div
                        onClick={closeSidebar}
                        className="fixed inset-0 bg-black/40 z-30 md:hidden"
                    />
                )}

                {/* SIDEBAR */}
                <div
                    className={`fixed md:static top-0 left-0 z-40 h-full md:h-[95vh] w-64 md:w-64
                        border-r text-base border-gray-300 pt-4 flex flex-col bg-white
                        transform transition-transform duration-300 ease-in-out
                        ${showSidebar ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
                >
                    {/* Close button — mobile only, inside the drawer */}
                    <button
                        onClick={closeSidebar}
                        className="md:hidden self-end mr-4 mb-2 p-1 text-gray-400 hover:text-gray-700"
                        aria-label="Close menu"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>

                    {sidebarLinks.map((item) => (

                        <NavLink
                            to={item.path}
                            key={item.name}
                            end={item.path === "/seller"}
                            onClick={closeSidebar}
                            className={({ isActive }) =>
                                `flex items-center py-3 px-4 gap-3
                                ${
                                    isActive
                                        ? "border-r-4 md:border-r-[6px] bg-primary/10 border-primary text-primary"
                                        : "hover:bg-gray-100/90 border-white"
                                }`
                            }
                        >

                            <img
                                src={item.icon}
                                alt=""
                                className="w-7 h-7"
                            />

                            <p className="block text-center">
                                {item.name}
                            </p>

                        </NavLink>

                    ))}
                </div>

                {/* Spacer to keep desktop content from sliding under the
                    static sidebar's collapsed (icon-only) width is no
                    longer needed on mobile since the sidebar is off-canvas
                    there; md: keeps the original static layout untouched. */}

                {/* PAGE CONTENT */}
                <div className="flex-1 min-w-0">
                    <Outlet />
                </div>
            </div>
        </>
    );
};

export default SellerLayout;
