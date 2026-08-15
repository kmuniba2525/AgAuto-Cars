import "dotenv/config";
import connectDB from "../configs/db.js";
import Product from "../models/Product.js";

const run = async () => {
  await connectDB();

  const products = await Product.find({
    $or: [{ slug: { $exists: false } }, { slug: null }, { slug: "" }],
  });

  console.log(`Found ${products.length} product(s) without a slug.`);

  for (const p of products) {
    await p.save(); // triggers the pre-save hook, generates + saves the slug
    console.log(`✔ ${p.name?.en} → ${p.slug}`);
  }

  console.log("Done.");
  process.exit(0);
};

run().catch((err) => {
  console.error("❌ Backfill error:", err.message);
  process.exit(1);
});