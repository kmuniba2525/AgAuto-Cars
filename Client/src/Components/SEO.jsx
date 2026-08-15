import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, image, url }) => {
  const siteName = "AgAuto";
  const fullTitle = title ? `${title} | ${siteName}` : `${siteName} — Auto Parts Marketplace`;
  const defaultDescription = "Shop quality automotive parts and accessories online at AgAuto.";
  const defaultImage = "/favicon.svg"; // swap for a real 1200x630 social share image later

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <link rel="canonical" href={url || window.location.href} />

      {/* Open Graph (Facebook, WhatsApp, LinkedIn previews) */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={image || defaultImage} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url || window.location.href} />

      {/* Twitter/X card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={image || defaultImage} />
    </Helmet>
  );
};

export default SEO;