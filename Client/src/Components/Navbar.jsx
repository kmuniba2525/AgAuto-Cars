import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { assets } from '../assets/assets'
import { useAppContext } from '../Context/AppContext'
import toast from 'react-hot-toast'
import Chatbot from './Chatbox'

const Navbar = () => {
    const [open, setOpen] = useState(false)
    const [openChat, setOpenChat] = useState(false)
    const location = useLocation()

    const {
        user,
        setUser,
        setShowUserLogin,
        navigate,
        searchQuery,
        setSearchQuery,
        getCartCount,
        axios,
        setCartItems
    } = useAppContext()

    const logout = async () => {
        try {
            const { data } = await axios.get('/api/user/logout')
            if (data.success) {
                toast.success(data.message)
                setUser(null)
                setCartItems({})
                navigate('/')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const navLinkClass = ({ isActive }) =>
        `relative pb-1 transition-all duration-300 font-semibold uppercase text-sm tracking-wide
        ${isActive ? "text-red-600" : "text-gray-300 hover:text-red-600"}
        after:absolute after:left-0 after:-bottom-1 after:h-[2px]
        after:bg-red-600
        after:transition-all after:duration-300
        ${isActive ? "after:w-full" : "after:w-0 hover:after:w-full"}`

    return (
        <>
            <nav className="flex items-center px-6 md:px-16 lg:px-24 xl:px-32 h-[78px] border-b border-gray-800 bg-[#111111] sticky top-0 z-50">

                {/* LEFT: LOGO */}
                <div className="flex flex-1 items-center">
                    <NavLink to='/' onClick={() => setOpen(false)} className="flex items-center">
                        <img
    src={assets.Logo}
    alt="Auto Center AB"
    className="h-24 md:h-20 w-auto object-contain"
/>
                    </NavLink>
                </div>

                {/* CENTER: NAV LINKS */}
                <div className="hidden sm:flex flex-1 justify-center">
                    <div className="flex items-center gap-10">
                        <NavLink to='/' className={navLinkClass}>Home</NavLink>
                        <NavLink to='/products' className={navLinkClass}>Products</NavLink>
                        <NavLink to='/contact' className={navLinkClass}>Contact</NavLink>
                    </div>
                </div>

                {/* RIGHT: SEARCH + ICONS */}
                <div className="flex flex-2 items-center justify-end gap-5">

                    {/* SEARCH */}
                    <div className="hidden lg:flex items-center gap-2 border border-gray-700 bg-[#1C1C1C] px-4 py-2 rounded-md w-[260px] focus-within:border-red-600 transition">

                        <input
                            value={searchQuery}
                            onChange={(e) => {
                                const value = e.target.value
                                setSearchQuery(value)

                                if (value.trim().length > 0 && location.pathname !== "/products") {
                                    navigate("/products")
                                }
                            }}
                            className="w-full bg-transparent outline-none text-white placeholder-gray-400 text-sm"
                            type="text"
                            placeholder="Search automotive parts..."
                        />

                        {/* 🔥 bright search icon */}
                        <img
                            src={assets.search_icon}
                            alt="search"
                            className="w-4 h-4 opacity-100 brightness-150"
                        />
                    </div>

                    {/* CART */}
                    <div onClick={() => navigate("/cart")} className="relative cursor-pointer hover:scale-105 transition">
                        <img src={assets.nav_cart_icon} alt="cart" className='w-6 opacity-80' />
                        <span className="absolute -top-2 -right-3 text-[10px] font-bold text-black bg-red-600 w-[18px] h-[18px] rounded-full flex items-center justify-center">
                            {getCartCount()}
                        </span>
                    </div>

                    {/* CHAT */}
                    <button onClick={() => setOpenChat(prev => !prev)}>
                        <img src={assets.chat_icon} className="w-6 opacity-80" />
                    </button>

                    {/* AUTH */}
                    {!user ? (
                        <button
                            onClick={() => setShowUserLogin(true)}
                            className="px-6 py-2 bg-red-600 hover:bg-red-400 transition text-black font-semibold rounded-md text-sm">
                            Login
                        </button>
                    ) : (
                        <div className='relative group'>
                            <img src={assets.profile_icon} alt="profile" className='w-9 cursor-pointer' />

                            <ul className='hidden group-hover:block absolute top-11 right-0 bg-[#1C1C1C] border border-gray-700 py-2 w-32 rounded-lg text-sm z-50 text-white'>
                                <li onClick={() => navigate("/my-orders")} className='px-3 py-2 hover:bg-[#2a2a2a] cursor-pointer'>
                                    My Orders
                                </li>
                                <li onClick={logout} className='px-3 py-2 hover:bg-[#2a2a2a] cursor-pointer'>
                                    Logout
                                </li>
                            </ul>
                        </div>
                    )}
                </div>

                {/* MOBILE ICONS */}
                <div className='flex sm:hidden items-center gap-5'>

                    <div onClick={() => navigate("/cart")} className="relative cursor-pointer">
                        <img src={assets.nav_cart_icon} className='w-6 opacity-80' />
                        <span className="absolute -top-2 -right-3 text-[10px] text-black bg-red-600 w-[18px] h-[18px] rounded-full flex items-center justify-center">
                            {getCartCount()}
                        </span>
                    </div>

                    <button onClick={() => setOpenChat(prev => !prev)}>
                        <img src={assets.chat_icon} className="w-6 opacity-80" />
                    </button>

                    <button onClick={() => setOpen(!open)}>
                        <img src={assets.menu_icon} />
                    </button>
                </div>

                {/* MOBILE MENU */}
                {open && (
                    <div className="absolute top-[72px] left-0 w-full bg-[#111111] border-t border-gray-800 py-5 flex flex-col gap-3 px-6 text-sm md:hidden z-50">

                        <NavLink to='/' onClick={() => setOpen(false)} className={navLinkClass}>
                            Home
                        </NavLink>

                        <NavLink to='/products' onClick={() => setOpen(false)} className={navLinkClass}>
                            All Products
                        </NavLink>

                        <NavLink to='/contact' onClick={() => setOpen(false)} className={navLinkClass}>
                            Contact
                        </NavLink>

                        {!user ? (
                            <button
                                onClick={() => {
                                    setOpen(false)
                                    setShowUserLogin(true)
                                }}
                                className="mt-2 px-5 py-2 bg-red-600 text-black font-semibold rounded-md"
                            >
                                Login
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    setOpen(false)
                                    logout()
                                }}
                                className="mt-2 px-5 py-2 bg-red-600 text-black font-semibold rounded-md"
                            >
                                Logout
                            </button>
                        )}
                    </div>
                )}
            </nav>

            <Chatbot
                isOpen={openChat}
                onClose={() => setOpenChat(false)}
            />
        </>
    )
}

export default Navbar