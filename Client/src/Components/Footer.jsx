import React from "react";
import { assets } from "../assets/assets";
import { useTranslation } from "react-i18next";

const Footer = () => {
    const { t } = useTranslation();

    const footerLinks = [
        {
            title: t('footer_links.quick_links'),
            links: [
                { text: t('footer_links.home'), url: "#" },
                { text: t('footer_links.best_sellers'), url: "#" },
                { text: t('footer_links.offers_deals'), url: "#" },
                { text: t('footer_links.contact_us'), url: "#" },
                { text: t('footer_links.faqs'), url: "#" },
            ],
        },
        {
            title: t('footer_links.need_help'),
            links: [
                { text: t('footer_links.delivery_info'), url: "#" },
                { text: t('footer_links.return_policy'), url: "#" },
                { text: t('footer_links.payment_methods'), url: "#" },
                { text: t('footer_links.track_order'), url: "#" },
                { text: t('footer_links.contact_us'), url: "#" },
            ],
        },
        {
            title: t('footer_links.follow_us'),
            links: [
                { text: t('footer_links.instagram'), url: "#" },
                { text: t('footer_links.twitter'), url: "#" },
                { text: t('footer_links.facebook'), url: "#" },
                { text: t('footer_links.youtube'), url: "#" },
            ],
        },
    ];

    return (
        <footer className="mt-12 md:mt-24 bg-primary border-t border-primary-dull">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-16 lg:px-24 py-8 sm:py-10 md:py-14">
                <div className="flex flex-col md:flex-row justify-between gap-8 sm:gap-10 md:gap-12 border-b border-primary-dull pb-6 sm:pb-8 md:pb-10">

                    {/* Logo & Description */}
                    <div className="max-w-md">
                        <img src={assets.Logo} alt="Autodex" className="w-40 sm:w-56 md:w-72 h-auto object-contain" />
                        <p className="mt-3 sm:mt-4 md:mt-6 text-gray-400 leading-6 sm:leading-7 text-xs sm:text-sm">
                            {t('footer.description')}
                        </p>
                    </div>

                    {/* Footer Links */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-6 sm:gap-10">
                        {footerLinks.map((section, index) => (
                            <div key={index}>
                                <h3 className="text-white font-semibold text-sm sm:text-base md:text-lg mb-3 sm:mb-4 md:mb-5 uppercase tracking-wide">
                                    {section.title}
                                </h3>
                                <ul className="space-y-2 sm:space-y-3">
                                    {section.links.map((link, i) => (
                                        <li key={i}>
                                            <a href={link.url} className="text-gray-400 hover:text-accent transition duration-300 text-xs sm:text-sm">
                                                {link.text}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                </div>

                {/* Bottom */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4 pt-5 sm:pt-6 md:pt-8">
                    <p className="text-gray-500 text-xs sm:text-sm text-center md:text-left">
                        © {new Date().getFullYear()} <span className="text-accent font-medium">AgAuto</span>. {t('footer.all_rights')}
                    </p>
                    <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm">
                        <a href="#" className="text-gray-400 hover:text-accent-dull transition">{t('footer.privacy')}</a>
                        <a href="#" className="text-gray-400 hover:text-accent-dull transition">{t('footer.terms')}</a>
                    </div>
                </div>

            </div>
        </footer>
    );
};

export default Footer;
