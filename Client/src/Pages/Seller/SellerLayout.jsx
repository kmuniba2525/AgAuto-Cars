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
            <div className="flex items-center justify-between px-4 md:px-8 border-b border-gray-300 py-3 bg-white transition-all duration-300">

                {/* LOGO */}
                <Link to="/">
                    <img
                        src={assets.Logo2}
                        alt="logo"
                        className="cursor-pointer w-34 md:w-38"
                    />
                </Link>

                {/* RIGHT SECTION */}
                <div className="flex items-center gap-5 text-gray-500">

                    {/* ================= NOTIFICATION BELL ================= */}
                    <div
                        className="relative cursor-pointer"
                        onClick={toggleNotifications}
                    >

                        <img
                            src={assets.bell_icon}
                            alt="bell"
                            className="w-6 h-6"
                        />

                        {/* BADGE */}
                        {notifications.length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 rounded-full">
                                {notifications.length}
                            </span>
                        )}

                        {/* ================= DROPDOWN ================= */}
                       {showNotifications && (
    <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto">

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
                    <div className="flex-1">

                        {/* TITLE */}
                        <h3 className="font-semibold text-sm text-gray-800">
                            {note.title}
                        </h3>

                        {/* MESSAGE */}
                        <p className="text-sm text-gray-600 mt-1">
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
                        className="text-gray-400 hover:text-red-500 transition"
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
                    <p>Hi! Admin</p>

                    {/* LOGOUT */}
                    <button
                        onClick={logout}
                        className="border cursor-pointer rounded-full text-sm px-4 py-1 hover:bg-gray-100"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* ================= MAIN LAYOUT ================= */}
            <div className="flex">

                {/* SIDEBAR */}
                <div className="md:w-64 w-16 border-r h-[95vh] text-base border-gray-300 pt-4 flex flex-col">

                    {sidebarLinks.map((item) => (

                        <NavLink
                            to={item.path}
                            key={item.name}
                            end={item.path === "/seller"}
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

                            <p className="md:block hidden text-center">
                                {item.name}
                            </p>

                        </NavLink>

                    ))}
                </div>

                {/* PAGE CONTENT */}
                <Outlet />
            </div>
        </>
    );
};

export default SellerLayout;