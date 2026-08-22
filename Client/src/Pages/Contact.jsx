import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { useAppContext } from '../Context/AppContext'
import SEO from '../Components/SEO'

const Contact = () => {
  const { t } = useTranslation()
  const { axios } = useAppContext()

  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sending, setSending] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    try {
      // NOTE: requires a matching POST /api/contact route on the server —
      // see the note in chat about wiring this up once your mail setup
      // (nodemailer, etc.) is confirmed.
      const { data } = await axios.post('/api/contact', form)
      if (data.success) {
        toast.success(t('contact.form_success'))
        setForm({ name: '', email: '', message: '' })
      } else {
        toast.error(data.message || t('contact.form_error'))
      }
    } catch (error) {
      toast.error(t('contact.form_error'))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-12">
      <SEO
        title={t('contact.title')}
        description={t('contact.subtitle')}
      />

      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900">{t('contact.title')}</h1>
        <p className="text-gray-500 mt-2">{t('contact.subtitle')}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Contact form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              {t('contact.form_name')}
            </label>
            <input
              type="text"
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2.5 outline-none focus:border-accent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              {t('contact.form_email')}
            </label>
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2.5 outline-none focus:border-accent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              {t('contact.form_message')}
            </label>
            <textarea
              name="message"
              required
              rows={5}
              value={form.message}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2.5 outline-none focus:border-accent transition resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={sending}
            className="mt-2 px-6 py-3 bg-accent hover:brightness-110 transition text-primary font-semibold rounded-md disabled:opacity-60"
          >
            {sending ? t('contact.form_sending') : t('contact.form_submit')}
          </button>
        </form>

        {/* Contact info */}
        <div className="bg-primary text-white rounded-lg p-8 flex flex-col gap-5 h-fit">
          <h2 className="text-xl font-bold">{t('contact.info_title')}</h2>

          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
              {t('contact.email_label')}
            </p>
            {/* TODO: replace with real business email */}
            <p className="font-medium">info@agautosystemab.com</p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
              {t('contact.phone_label')}
            </p>
            {/* TODO: replace with real business phone */}
            <p className="font-medium">+46 00 000 00 00</p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
              {t('contact.address_label')}
            </p>
            {/* TODO: replace with real business address */}
            <p className="font-medium">Sweden</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact
