import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { assets } from '../assets/assets'
import { useAppContext } from '../Context/AppContext'
import toast from 'react-hot-toast'
import Chatbot from './Chatbox'
import { useTranslation } from 'react-i18next'

const Navbar = () => {
    const [open, setOpen] = useState(false)
    const [openChat, setOpenChat] = useState(false)
    const location = useLocation()
    const { t, i18n } = useTranslation()

    const {
        user, setUser, setShowUserLogin, navigate,
        searchQuery, setSearchQuery, getCartCount, axios, setCartItems
    } = useAppContext()

    const changeLang = (lang) => {
        i18n.changeLanguage(lang)
        localStorage.setItem('selectedLanguage', lang)
    }

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
        ${isActive ? "text-accent" : "text-gray-300 hover:text-accent"}
        after:absolute after:left-0 after:-bottom-1 after:h-[2px]
        after:bg-accent after:transition-all after:duration-300
        ${isActive ? "after:w-full" : "after:w-0 hover:after:w-full"}`

    return (
        <>
            <nav className="flex items-center px-6 md:px-16 lg:px-24 xl:px-32 h-[95px] border-b border-gray-800 bg-primary sticky top-0 z-50">

                <div className="flex flex-1 items-center">
                    <NavLink to="/" className="flex items-center flex-shrink-0">
                        <img
                            src={assets.Logo}
                            alt="Auto Center AB"
                            className="h-20 sm:h-24 lg:h-32 w-auto max-w-none object-contain"
                        />
                    </NavLink>
                </div>

                {/* CENTER: NAV LINKS */}
                <div className="hidden sm:flex flex-none px-6 justify-center">
                    <div className="flex items-center gap-10">
                        <NavLink to='/home' className={navLinkClass}>{t('navbar.home')}</NavLink>
                        <NavLink to='/products' className={navLinkClass}>{t('navbar.products')}</NavLink>
                        <NavLink to='/contact' className={navLinkClass}>{t('navbar.contact')}</NavLink>
                    </div>
                </div>

                {/* RIGHT: SEARCH + ICONS */}
                <div className="hidden sm:flex flex-1 items-center justify-end gap-3 md:gap-5 lg:gap-8">

                    {/* SEARCH */}
                    <div className="hidden lg:flex items-center gap-2 border border-gray-700 bg-primary-dull px-4 py-2 rounded-md w-[260px] focus-within:border-accent transition">
                        <input
                            value={searchQuery}
                            onChange={(e) => {
                                const value = e.target.value
                                setSearchQuery(value)
                                if (value.trim().length > 0 && location.pathname !== "/products") navigate("/products")
                            }}
                            className="w-full bg-transparent outline-none text-white placeholder-gray-400 text-sm"
                            type="text"
                            placeholder={t('navbar.search_placeholder')}
                        />
                        <img src={assets.search_icon} alt="search" className="w-4 h-4 opacity-100 brightness-150" />
                    </div>

                    {/* CART */}
                    <div onClick={() => navigate("/cart")} className="relative cursor-pointer hover:scale-105 transition shrink-0">
                        <img src={assets.nav_cart_icon} alt="cart" className='w-6 opacity-80' />
                        <span className="absolute -top-2 -right-3 text-[10px] font-bold text-primary bg-accent w-[18px] h-[18px] rounded-full flex items-center justify-center">
                            {getCartCount()}
                        </span>
                    </div>

                    {/* CHAT */}
                    <button onClick={() => setOpenChat(prev => !prev)} className="shrink-0">
                       <img src={assets.chat_icon} alt="chat" className="w-6 opacity-80" />
                    </button>


                    {/* LANGUAGE SWITCHER — GLOBE DROPDOWN */}
                    <div className="relative group shrink-0">
                        <button className="flex items-center gap-1.5 border border-gray-700 rounded-md px-3 py-1.5 text-xs font-semibold hover:border-accent transition">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F5B800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="2" y1="12" x2="22" y2="12" />
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                            </svg>
                            <span className="text-accent">
                                {/* pt commented out for now — Portuguese support paused */}
                                {i18n.language === 'sv' ? 'SV'
                                    : i18n.language === 'fi' ? 'FI'
                                    : i18n.language === 'da' ? 'DA'
                                    : i18n.language === 'no' ? 'NO'
                                    : 'EN'}
                            </span>
                            <span className="text-[10px] text-gray-400">▾</span>
                        </button>

                        {/* invisible bridge so mouse can travel from button to dropdown without it closing */}
                        <div className="absolute right-0 top-8 h-3 w-full" />

                        <ul className="hidden group-hover:block absolute right-0 top-[44px] bg-primary-dull border border-gray-700 rounded-lg py-1 w-24 z-50 text-white text-sm">
                            <li
                                onClick={() => changeLang('en')}
                                className={`px-3 py-2 hover:bg-[#1a2a5e] cursor-pointer flex items-center gap-2 ${i18n.language === 'en' ? 'text-accent font-semibold' : ''}`}
                            >
                                🇬🇧 EN
                            </li>
                            {/* Portuguese commented out for now — Portuguese support paused
                            <li
                                onClick={() => changeLang('pt')}
                                className={`px-3 py-2 hover:bg-[#1a2a5e] cursor-pointer flex items-center gap-2 ${i18n.language === 'pt' ? 'text-accent font-semibold' : ''}`}
                            >
                                🇧🇷 PT
                            </li>
                            */}
                            <li
                                onClick={() => changeLang('sv')}
                                className={`px-3 py-2 hover:bg-[#1a2a5e] cursor-pointer flex items-center gap-2 ${i18n.language === 'sv' ? 'text-accent font-semibold' : ''}`}
                            >
                                🇸🇪 SV
                            </li>
                            <li
                                onClick={() => changeLang('fi')}
                                className={`px-3 py-2 hover:bg-[#1a2a5e] cursor-pointer flex items-center gap-2 ${i18n.language === 'fi' ? 'text-accent font-semibold' : ''}`}
                            >
                                🇫🇮 FI
                            </li>
                            <li
                                onClick={() => changeLang('da')}
                                className={`px-3 py-2 hover:bg-[#1a2a5e] cursor-pointer flex items-center gap-2 ${i18n.language === 'da' ? 'text-accent font-semibold' : ''}`}
                            >
                                🇩🇰 DA
                            </li>
                            <li
                                onClick={() => changeLang('no')}
                                className={`px-3 py-2 hover:bg-[#1a2a5e] cursor-pointer flex items-center gap-2 ${i18n.language === 'no' ? 'text-accent font-semibold' : ''}`}
                            >
                                🇳🇴 NO
                            </li>
                        </ul>
                    </div>

                    {/* AUTH */}
                    {!user ? (
                        <button onClick={() => setShowUserLogin(true)}
                            className="px-4 sm:px-6 py-2 bg-accent hover:brightness-110 transition text-primary font-semibold rounded-md text-xs sm:text-sm whitespace-nowrap shrink-0">
                            {t('navbar.login')}
                        </button>
                    ) : (
                        <div className='relative group shrink-0'>
                            <img src={assets.profile_icon} alt="profile" className='w-9 cursor-pointer' />
                            <ul className='hidden group-hover:block absolute top-11 right-0 bg-primary-dull border border-gray-700 py-2 w-32 rounded-lg text-sm z-50 text-white'>
                                <li onClick={() => navigate("/my-orders")} className='px-3 py-2 hover:bg-[#1a2a5e] cursor-pointer whitespace-nowrap'>
                                    {t('navbar.my_orders')}
                                </li>
                                <li onClick={logout} className='px-3 py-2 hover:bg-[#1a2a5e] cursor-pointer whitespace-nowrap'>
                                    {t('navbar.logout')}
                                </li>
                            </ul>
                        </div>
                    )}
                </div>

                {/* MOBILE ICONS */}
                <div className='flex sm:hidden items-center gap-5'>
                    <div onClick={() => navigate("/cart")} className="relative cursor-pointer">
                        <img src={assets.nav_cart_icon} alt='cart' className='w-6 opacity-80' />
                        <span className="absolute -top-2 -right-3 text-[10px] text-primary bg-accent w-[18px] h-[18px] rounded-full flex items-center justify-center">
                            {getCartCount()}
                        </span>
                    </div>

                    <button onClick={() => setOpenChat(prev => !prev)}>
                        <img src={assets.chat_icon} alt="chat" className="w-6 opacity-80" />
                    </button>

                    <button onClick={() => setOpen(!open)} aria-label="Toggle menu">
                        <img src={assets.menu_icon} className="w-6 h-6 opacity-80" alt="menu" />
                    </button>
                </div>

                {/* MOBILE MENU */}
                {open && (
                    <div className="absolute top-[72px] left-0 w-full bg-primary border-t border-gray-800 py-5 flex flex-col gap-3 px-6 text-sm sm:hidden z-50">

                        {/* MOBILE SEARCH */}
                        <div className="flex items-center gap-2 border border-gray-700 bg-primary-dull px-4 py-2 rounded-md w-full mb-2">
                            <input
                                value={searchQuery}
                                onChange={(e) => {
                                    const value = e.target.value
                                    setSearchQuery(value)
                                    if (value.trim().length > 0 && location.pathname !== "/products") {
                                        setOpen(false)
                                        navigate("/products")
                                    }
                                }}
                                className="w-full bg-transparent outline-none text-white placeholder-gray-400 text-sm"
                                type="text"
                                placeholder={t('navbar.search_placeholder')}
                            />
                            <img src={assets.search_icon} alt="search" className="w-4 h-4 opacity-100 brightness-150" />
                        </div>

                        <NavLink to='/home' onClick={() => setOpen(false)} className={navLinkClass}>{t('navbar.home')}</NavLink>
                        <NavLink to='/products' onClick={() => setOpen(false)} className={navLinkClass}>{t('navbar.all_products')}</NavLink>
                        <NavLink to='/contact' onClick={() => setOpen(false)} className={navLinkClass}>{t('navbar.contact')}</NavLink>

                        {user && (
                            <button onClick={() => { setOpen(false); navigate("/my-orders") }}
                                className="text-left text-gray-300 hover:text-accent font-semibold uppercase text-sm tracking-wide">
                                {t('navbar.my_orders')}
                            </button>
                        )}

                        {/* MOBILE LANGUAGE SWITCHER */}
                        <div className="flex items-center gap-2 pt-1 flex-wrap">
                            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Language:</span>
                            <button
                                onClick={() => changeLang('en')}
                                className={`px-3 py-1 rounded text-xs font-semibold border ${i18n.language === 'en' ? 'bg-accent border-accent text-primary' : 'border-gray-700 text-gray-400'}`}
                            >
                                🇬🇧 EN
                            </button>
                            {/* Portuguese commented out for now — Portuguese support paused
                            <button
                                onClick={() => changeLang('pt')}
                                className={`px-3 py-1 rounded text-xs font-semibold border ${i18n.language === 'pt' ? 'bg-accent border-accent text-primary' : 'border-gray-700 text-gray-400'}`}
                            >
                                🇧🇷 PT
                            </button>
                            */}
                            <button
                                onClick={() => changeLang('sv')}
                                className={`px-3 py-1 rounded text-xs font-semibold border ${i18n.language === 'sv' ? 'bg-accent border-accent text-primary' : 'border-gray-700 text-gray-400'}`}
                            >
                                🇸🇪 SV
                            </button>
                            <button
                                onClick={() => changeLang('fi')}
                                className={`px-3 py-1 rounded text-xs font-semibold border ${i18n.language === 'fi' ? 'bg-accent border-accent text-primary' : 'border-gray-700 text-gray-400'}`}
                            >
                                🇫🇮 FI
                            </button>
                            <button
                                onClick={() => changeLang('da')}
                                className={`px-3 py-1 rounded text-xs font-semibold border ${i18n.language === 'da' ? 'bg-accent border-accent text-primary' : 'border-gray-700 text-gray-400'}`}
                            >
                                🇩🇰 DA
                            </button>
                            <button
                                onClick={() => changeLang('no')}
                                className={`px-3 py-1 rounded text-xs font-semibold border ${i18n.language === 'no' ? 'bg-accent border-accent text-primary' : 'border-gray-700 text-gray-400'}`}
                            >
                                🇳🇴 NO
                            </button>
                        </div>

                        {!user ? (
                            <button onClick={() => { setOpen(false); setShowUserLogin(true) }}
                                className="mt-2 px-5 py-2 bg-accent text-primary font-semibold rounded-md w-full text-center whitespace-nowrap">
                                {t('navbar.login')}
                            </button>
                        ) : (
                            <button onClick={() => { setOpen(false); logout() }}
                                className="mt-2 px-5 py-2 bg-accent text-primary font-semibold rounded-md w-full text-center whitespace-nowrap">
                                {t('navbar.logout')}
                            </button>
                        )}
                    </div>
                )}
            </nav>

            <Chatbot isOpen={openChat} onClose={() => setOpenChat(false)} />
        </>
    )
}

export default Navbar