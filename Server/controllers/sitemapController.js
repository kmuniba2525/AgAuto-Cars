import Product from "../models/Product.js";

const CATEGORIES = [
  "Primer", "Clearcoat", "Thinners", "Putty", "Paint",
  "Sanding", "Masking", "Sealant", "Safety", "CarCare",
  "Aerosol", "Workwear",
];

// Keep in sync with SUPPORTED_LANGS in Client/src/App.jsx and SEO.jsx.
// "pt" stays out until Portuguese support is re-enabled.
const LANGS = ["en", "sv", "fi", "da", "no"];
const DEFAULT_LANG = "en";

export const generateSitemap = async (req, res) => {
  try {
    const baseUrl = process.env.CLIENT_URL || "https://agautosystemab.com";
    const products = await Product.find({}, "slug category updatedAt");

    // Each entry is one *page*, described by its path suffix (no lang, no
    // domain) — e.g. "" for the homepage, "products/paint" for a category.
    // One <url> block per language gets generated from each entry below,
    // and every block lists all language versions as <xhtml:link> alternates
    // so Google can tell they're the same page, not duplicate content.
    const pages = [
      { path: "", priority: "1.0" },
      { path: "products", priority: "0.9" },
      { path: "contact", priority: "0.5" },
      ...CATEGORIES.map((cat) => ({
        path: `products/${cat.toLowerCase()}`,
        priority: "0.7",
      })),
      ...products
        .filter((p) => p.slug)
        .map((p) => ({
          path: `products/${p.category?.toLowerCase()}/${p.slug}`,
          lastmod: p.updatedAt ? p.updatedAt.toISOString().split("T")[0] : undefined,
          priority: "0.8",
        })),
    ];

    const pageUrl = (lang, path) => `${baseUrl}/${lang}${path ? `/${path}` : ""}`;

    const alternateLinks = (path) =>
      LANGS.map(
        (lang) => `    <xhtml:link rel="alternate" hreflang="${lang}" href="${pageUrl(lang, path)}" />`
      ).join("\n") +
      `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${pageUrl(DEFAULT_LANG, path)}" />`;

    const urlBlocks = pages.flatMap(({ path, priority, lastmod }) =>
      LANGS.map(
        (lang) => `  <url>
    <loc>${pageUrl(lang, path)}</loc>
${alternateLinks(path)}
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}
    <priority>${priority}</priority>
  </url>`
      )
    );

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlBlocks.join("\n")}
</urlset>`;

    res.header("Content-Type", "application/xml");
    res.send(xml);
  } catch (error) {
    console.error("❌ Sitemap generation error:", error.message);
    res.status(500).send("Error generating sitemap");
  }
};