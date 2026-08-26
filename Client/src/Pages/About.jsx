import React from 'react'
import { useTranslation } from 'react-i18next'
import SEO from '../Components/SEO'

const About = () => {
  const { t } = useTranslation()

  // Real numbers from the actual catalog/site — update the categories
  // count here if you add/remove a category later.
  const stats = [
    { value: '4', label: t('about.stat_countries') },
    { value: '12+', label: t('about.stat_categories') },
    { value: '5', label: t('about.stat_languages') },
    { value: '🇸🇪🇳🇴🇫🇮🇩🇰', label: t('about.stat_shipping') },
  ]

  const whyItems = [t('about.why_1'), t('about.why_2'), t('about.why_3'), t('about.why_4')]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-12">
      <SEO
        title={t('about.title')}
        description={t('about.tagline')}
      />

      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900">{t('about.title')}</h1>
        <p className="text-gray-500 mt-3 text-lg max-w-2xl mx-auto">{t('about.tagline')}</p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {stats.map((stat, i) => (
          <div key={i} className="text-center border border-gray-200 rounded-lg py-6 px-2">
            <p className="text-2xl font-bold text-accent">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-10">
        {/* Our Story */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">{t('about.story_title')}</h2>
          {/* TODO: swap in the real founding story / company details if this differs */}
          <p className="text-gray-600 leading-7">{t('about.story_body')}</p>
        </section>

        {/* Our Mission */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">{t('about.mission_title')}</h2>
          <p className="text-gray-600 leading-7">{t('about.mission_body')}</p>
        </section>

        {/* What We Offer */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">{t('about.what_title')}</h2>
          <p className="text-gray-600 leading-7">{t('about.what_body')}</p>
        </section>

        {/* Why Choose Us */}
        <section className="bg-primary text-white rounded-lg p-8">
          <h2 className="text-xl font-bold mb-4">{t('about.why_title')}</h2>
          <ul className="flex flex-col gap-3">
            {whyItems.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-300 leading-6">
                <span className="text-accent mt-1">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}

export default About
