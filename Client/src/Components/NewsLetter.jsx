import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

const NewsLetter = () => {
    const { t } = useTranslation()
    const [email, setEmail] = useState("")
    const [message, setMessage] = useState("")

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!email.includes("@")) {
            setMessage(t('newsletter.invalid_email'))
            return
        }
        console.log("Subscribed Email:", email)
        setMessage(t('newsletter.success'))
        setEmail("")
    }

    return (
        <div className="flex flex-col items-center justify-center text-center space-y-2 mt-24 pb-14">
            <h1 className="md:text-4xl text-2xl font-semibold">{t('newsletter.title')}</h1>
            <p className="md:text-lg text-gray-500/70 pb-8">{t('newsletter.subtitle')}</p>

            <form onSubmit={handleSubmit} className="flex items-center justify-between max-w-2xl w-full md:h-13 h-12">
                <input
                    className="border border-gray-300 rounded-md h-full border-r-0 outline-none w-full rounded-r-none px-3 text-gray-500"
                    type="email"
                    placeholder={t('newsletter.placeholder')}
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <button type="submit"
                    className="md:px-12 px-8 h-full text-white bg-primary hover:bg-primary-dull transition-all cursor-pointer rounded-md rounded-l-none">
                    {t('newsletter.subscribe')}
                </button>
            </form>

            {message && <p className="text-green-700 text-sm mt-2">{message}</p>}
        </div>
    )
}

export default NewsLetter