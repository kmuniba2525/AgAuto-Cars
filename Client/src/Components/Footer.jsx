import React from "react";
import { assets } from "../assets/assets";
import { useTranslation } from "react-i18next";

const Footer = () => {
    const { t, i18n } = useTranslation();
    const lang = i18n.language;

    const quickLinks = [
        { text: t('footer_links.home'), url: `/${lang}/home` },
        { text: t('navbar.products'), url: `/${lang}/products` },
        { text: t('navbar.about'), url: `/${lang}/about` },
        { text: t('footer_links.contact_us'), url: `/${lang}/contact` },
        { text: t('footer_links.track_order'), url: "/track-order" },
    ];

    // TODO: replace "#" with real social profile URLs
    const socialLinks = [
        { text: t('footer_links.instagram'), url: "#" },
        { text: t('footer_links.facebook'), url: "#" },
        { text: t('footer_links.twitter'), url: "#" },
        { text: t('footer_links.youtube'), url: "#" },
    ];

    return (
        <footer className="mt-12 md:mt-24 bg-primary border-t border-primary-dull">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-16 lg:px-24 py-8 sm:py-10">
                <div className="flex flex-col md:flex-row justify-between items-start gap-8 md:gap-12 border-b border-primary-dull pb-6 sm:pb-8">

                    {/* Logo & Description */}
                    <div className="max-w-sm">
                        <img src={assets.Logo} alt="Autodex" className="w-40 sm:w-48 h-auto object-contain" />
                        <p className="mt-3 sm:mt-4 text-gray-400 leading-6 text-xs sm:text-sm">
                            {t('footer.description')}
                        </p>
                    </div>

                    {/* Single link column instead of three */}
                    <div className="flex flex-col sm:flex-row gap-8 sm:gap-16">
                        <div>
                            <h3 className="text-white font-semibold text-sm mb-3 uppercase tracking-wide">
                                {t('footer_links.quick_links')}
                            </h3>
                            <ul className="space-y-2">
                                {quickLinks.map((link, i) => (
                                    <li key={i}>
                                        <a href={link.url} className="text-gray-400 hover:text-accent transition duration-300 text-xs sm:text-sm">
                                            {link.text}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Social icons row instead of a spelled-out column */}
                        <div>
                            <h3 className="text-white font-semibold text-sm mb-3 uppercase tracking-wide">
                                {t('footer_links.follow_us')}
                            </h3>
                            <div className="flex gap-3">
                                {socialLinks.map((link, i) => (
                                    <a
                                        key={i}
                                        href={link.url}
                                        aria-label={link.text}
                                        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-700 text-gray-400 hover:text-accent hover:border-accent transition text-xs"
                                    >
                                        {link.text.charAt(0)}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>

                {/* Bottom */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-3 pt-5 sm:pt-6">
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
