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
        <footer className="mt-24 bg-[#111111] border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-6 md:px-16 lg:px-24 py-14">
                <div className="flex flex-col md:flex-row justify-between gap-12 border-b border-gray-800 pb-10">

                    {/* Logo & Description */}
                    <div className="max-w-md">
                        <img src={assets.Logo} alt="Autodex" className="w-44" />
                        <p className="mt-6 text-gray-400 leading-7 text-sm">
                            {t('footer.description')}
                        </p>
                    </div>

                    {/* Footer Links */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
                        {footerLinks.map((section, index) => (
                            <div key={index}>
                                <h3 className="text-white font-semibold text-lg mb-5 uppercase tracking-wide">
                                    {section.title}
                                </h3>
                                <ul className="space-y-3">
                                    {section.links.map((link, i) => (
                                        <li key={i}>
                                            <a href={link.url} className="text-gray-400 hover:text-red-600 transition duration-300">
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
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8">
                    <p className="text-gray-500 text-sm">
                        © {new Date().getFullYear()} <span className="text-red-600 font-medium">Autodex</span>. {t('footer.all_rights')}
                    </p>
                    <div className="flex gap-6 text-sm">
                        <a href="#" className="text-gray-400 hover:text-red-700 transition">{t('footer.privacy')}</a>
                        <a href="#" className="text-gray-400 hover:text-red-700 transition">{t('footer.terms')}</a>
                    </div>
                </div>

            </div>
        </footer>
    );
};

export default Footer;