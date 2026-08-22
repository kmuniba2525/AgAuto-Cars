import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const SUPPORTED_LANGS = ["en", "sv", "fi", "da", "no"]; // keep in sync with App.jsx

const SEO = ({ title, description, image, url }) => {
  const location = useLocation();
  const siteName = "AgAuto";
  const fullTitle = title ? `${title} | ${siteName}` : `${siteName} — Auto Parts Marketplace`;
  const defaultDescription = "Shop quality automotive parts and accessories online at AgAuto.";
  const defaultImage = "/favicon.svg"; // swap for a real 1200x630 social share image later
  const origin = window.location.origin;

  // Derive the current language and the path *without* its lang segment,
  // e.g. "/sv/products/brakes" -> lang "sv", restPath "products/brakes".
  // Falls back to "en" for any route that isn't locale-prefixed (cart,
  // checkout, seller, etc.) so this component is still safe to drop into
  // those pages later without extra setup.
  const segments = location.pathname.split('/').filter(Boolean);
  const hasLangPrefix = SUPPORTED_LANGS.includes(segments[0]);
  const currentLang = hasLangPrefix ? segments[0] : 'en';
  const restPath = (hasLangPrefix ? segments.slice(1) : segments).join('/');

  const buildUrl = (lang) => `${origin}/${lang}${restPath ? `/${restPath}` : ''}`;

  return (
    <Helmet htmlAttributes={{ lang: currentLang }}>
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <link rel="canonical" href={url || window.location.href} />

      {/* hreflang: tells Google which URL to serve for each language/
          country, and prevents your sv/no/da/fi pages from being treated
          as duplicate content of the English version. */}
      {SUPPORTED_LANGS.map((lang) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={buildUrl(lang)} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={buildUrl('en')} />

      {/* Open Graph (Facebook, WhatsApp, LinkedIn previews) */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={image || defaultImage} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url || window.location.href} />
      <meta property="og:locale" content={currentLang} />

      {/* Twitter/X card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={image || defaultImage} />
    </Helmet>
  );
};

export default SEO;
