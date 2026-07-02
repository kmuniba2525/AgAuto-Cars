import React from 'react'
import { useAppContext } from '../Context/AppContext';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const Login = () => {
    const { setShowUserLogin, setUser, axios, fetchUser, syncGuestCart } = useAppContext();
    const { t } = useTranslation();

    const [state, setState] = React.useState("login");
    const [name, setName] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [loading, setLoading] = React.useState(false);

    const onSubmitHandler = async (event) => {
        try {
            event.preventDefault();
            setLoading(true);
            const payload = { name, email, password };
            const { data } = await axios.post(`/api/user/${state}`, payload, { withCredentials: true });

            if (data.success) {
                // Pull the full user record (including server-side cartItems)
                await fetchUser();

                // Merge any items added before login
                await syncGuestCart();

                setShowUserLogin(false);
                toast.success(data.message || "Success");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div onClick={() => setShowUserLogin(false)}
            className='fixed top-0 bottom-0 left-0 right-0 z-70 flex items-center justify-center text-sm text-gray-600 bg-black/60 backdrop-blur-sm p-4 animate-[fadeIn_0.15s_ease-out]'>

            <div onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-gray-100 overflow-hidden">

                {/* Header */}
                <div className="flex flex-col items-center pt-8 pb-6 px-8">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dull flex items-center justify-center shadow-lg shadow-primary/30 mb-4">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <p className="text-xl font-semibold text-gray-900">
                        {state === "login" ? t('login.login_title') : t('login.signup_title')}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                        {state === "login" ? "Sign in to continue" : "Join us in just a few seconds"}
                    </p>
                </div>

                {/* Tab switcher — keeps register equally visible, not a buried link */}
                <div className="mx-8 mb-6 relative flex bg-gray-100 rounded-xl p-1">
                    <div
                        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm transition-transform duration-300 ease-out ${
                            state === "register" ? "translate-x-full" : "translate-x-0"
                        }`}
                    />
                    <button
                        type="button"
                        onClick={() => setState("login")}
                        className={`relative z-10 flex-1 py-2 text-sm font-medium rounded-lg transition-colors duration-200 cursor-pointer ${
                            state === "login" ? "text-primary" : "text-gray-400 hover:text-gray-600"
                        }`}
                    >
                        {t('login.login_btn')}
                    </button>
                    <button
                        type="button"
                        onClick={() => setState("register")}
                        className={`relative z-10 flex-1 py-2 text-sm font-medium rounded-lg transition-colors duration-200 cursor-pointer ${
                            state === "register" ? "text-primary" : "text-gray-400 hover:text-gray-600"
                        }`}
                    >
                        {t('login.create_account_btn')}
                    </button>
                </div>

                <form onSubmit={onSubmitHandler} className="flex flex-col gap-4 px-8 pb-8">

                    {state === "register" && (
                        <div className="w-full">
                            <label className="text-xs font-medium text-gray-500">{t('login.name')}</label>
                            <div className="relative mt-1.5">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </span>
                                <input onChange={(e) => setName(e.target.value)} value={name}
                                    placeholder={t('login.placeholder')}
                                    className="border border-gray-200 rounded-xl w-full py-2.5 pl-9 pr-3 outline-none transition-all duration-200 focus:border-primary focus:ring-4 focus:ring-primary/10"
                                    type="text" required />
                            </div>
                        </div>
                    )}

                    <div className="w-full">
                        <label className="text-xs font-medium text-gray-500">{t('login.email')}</label>
                        <div className="relative mt-1.5">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </span>
                            <input onChange={(e) => setEmail(e.target.value)} value={email}
                                placeholder={t('login.placeholder')}
                                className="border border-gray-200 rounded-xl w-full py-2.5 pl-9 pr-3 outline-none transition-all duration-200 focus:border-primary focus:ring-4 focus:ring-primary/10"
                                type="email" required />
                        </div>
                    </div>

                    <div className="w-full">
                        <label className="text-xs font-medium text-gray-500">{t('login.password')}</label>
                        <div className="relative mt-1.5">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 10-8 0v4h8z" />
                                </svg>
                            </span>
                            <input onChange={(e) => setPassword(e.target.value)} value={password}
                                placeholder={t('login.placeholder')}
                                className="border border-gray-200 rounded-xl w-full py-2.5 pl-9 pr-3 outline-none transition-all duration-200 focus:border-primary focus:ring-4 focus:ring-primary/10"
                                type="password" required />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 bg-gradient-to-r from-primary to-primary-dull hover:brightness-105 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 text-white w-full py-2.5 rounded-xl font-medium shadow-lg shadow-primary/25 cursor-pointer"
                    >
                        {loading ? "..." : (state === "register" ? t('login.create_account_btn') : t('login.login_btn'))}
                    </button>

                    {state === "register" ? (
                        <p className="text-center text-xs text-gray-400">
                            {t('login.have_account')}{' '}
                            <span onClick={() => setState("login")} className="text-primary font-medium cursor-pointer hover:underline">
                                {t('login.click_here')}
                            </span>
                        </p>
                    ) : (
                        <p className="text-center text-xs text-gray-400">
                            {t('login.create_account_prompt')}{' '}
                            <span onClick={() => setState("register")} className="text-primary font-medium cursor-pointer hover:underline">
                                {t('login.click_here')}
                            </span>
                        </p>
                    )}
                </form>
            </div>
        </div>
    )
}

export default Login
