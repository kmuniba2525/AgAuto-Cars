import React from 'react'
import { useAppContext } from '../Context/AppContext';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const Login = () => {
    const { setShowUserLogin, setUser, axios, fetchUser } = useAppContext();
    const { t } = useTranslation();

    const [state, setState] = React.useState("login");
    const [name, setName] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");

    const onSubmitHandler = async (event) => {
        try {
            event.preventDefault();
            const payload = { name, email, password };
            const { data } = await axios.post(`/api/user/${state}`, payload, { withCredentials: true });

            if (data.success) {
                const userData = data.user || data.data?.user;
                setUser(userData);
                setShowUserLogin(false);
                toast.success(data.message || "Success");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    };

    return (
        <div onClick={() => setShowUserLogin(false)}
            className='fixed top-0 bottom-0 left-0 right-0 z-30 flex items-center text-sm text-gray-600 bg-black/50'>

            <form onSubmit={onSubmitHandler} onClick={(e) => e.stopPropagation()}
                className="flex flex-col gap-4 m-auto items-start p-8 py-12 w-80 sm:w-[352px] text-gray-500 rounded-lg shadow-xl border border-gray-200 bg-white">

                <p className="text-2xl font-medium m-auto">
                    <span className="text-primary">{t('login.user')}</span>{' '}
                    {state === "login" ? t('login.login_title') : t('login.signup_title')}
                </p>

                {state === "register" && (
                    <div className="w-full">
                        <p>{t('login.name')}</p>
                        <input onChange={(e) => setName(e.target.value)} value={name}
                            placeholder={t('login.placeholder')}
                            className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
                            type="text" required />
                    </div>
                )}

                <div className="w-full">
                    <p>{t('login.email')}</p>
                    <input onChange={(e) => setEmail(e.target.value)} value={email}
                        placeholder={t('login.placeholder')}
                        className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
                        type="email" required />
                </div>

                <div className="w-full">
                    <p>{t('login.password')}</p>
                    <input onChange={(e) => setPassword(e.target.value)} value={password}
                        placeholder={t('login.placeholder')}
                        className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
                        type="password" required />
                </div>

                {state === "register" ? (
                    <p>{t('login.have_account')}{' '}
                        <span onClick={() => setState("login")} className="text-primary cursor-pointer">
                            {t('login.click_here')}
                        </span>
                    </p>
                ) : (
                    <p>{t('login.create_account_prompt')}{' '}
                        <span onClick={() => setState("register")} className="text-primary cursor-pointer">
                            {t('login.click_here')}
                        </span>
                    </p>
                )}

                <button className="bg-primary hover:bg-primary-dull transition-all text-white w-full py-2 rounded-md cursor-pointer">
                    {state === "register" ? t('login.create_account_btn') : t('login.login_btn')}
                </button>

            </form>
        </div>
    )
}

export default Login