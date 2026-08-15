import Product from "../models/Product.js";

const CATEGORIES = [
  "Primer", "Clearcoat", "Thinners", "Putty", "Paint",
  "Sanding", "Masking", "Sealant", "Safety", "CarCare",
  "Aerosol", "Workwear",
];

export const generateSitemap = async (req, res) => {
  try {
    const baseUrl = process.env.CLIENT_URL || "https://agautosystemab.com";
    const products = await Product.find({}, "slug category updatedAt");

    const staticUrls = [
      { loc: `${baseUrl}/`, priority: "1.0" },
      { loc: `${baseUrl}/products`, priority: "0.9" },
    ];

    const categoryUrls = CATEGORIES.map((cat) => ({
      loc: `${baseUrl}/products/${cat.toLowerCase()}`,
      priority: "0.7",
    }));

    // ✅ CHANGED: use the SEO-friendly slug instead of the raw MongoDB _id.
    // Any product without a slug yet (shouldn't happen after the backfill,
    // but just in case) is skipped rather than listing a broken URL.
    const productUrls = products
      .filter((p) => p.slug)
      .map((p) => ({
        loc: `${baseUrl}/products/${p.category?.toLowerCase()}/${p.slug}`,
        lastmod: p.updatedAt ? p.updatedAt.toISOString().split("T")[0] : undefined,
        priority: "0.8",
      }));

    const allUrls = [...staticUrls, ...categoryUrls, ...productUrls];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

    res.header("Content-Type", "application/xml");
    res.send(xml);
  } catch (error) {
    console.error("❌ Sitemap generation error:", error.message);
    res.status(500).send("Error generating sitemap");
  }
};