// scripts/migrateProductLanguages.js
//
// ONE-TIME MIGRATION — run this exactly once, then delete or archive it.
//
// Converts existing products where `name` and `description` are still
// plain strings (the old schema shape) into the new bilingual shape:
//   { en: "original text", pt: "original text" }
//
// The Portuguese field is seeded with a COPY of the English text as a
// placeholder — it won't be correct Portuguese, but it prevents the app
// from crashing or showing blank text. Go back into AddProduct/an edit
// page afterward to replace the `pt` field with real translations.
//
// USAGE:
//   node scripts/migrateProductLanguages.js
//
// Make sure your .env has MONGODB_URI (or whatever your connection
// string variable is called — check your server.js/db config file).

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// ✅ IMPORTANT: this script talks to the RAW collection, not through your
// Product model — because your Product model's schema has ALREADY been
// changed to expect { en, pt } objects. If we imported that model and ran
// a normal `.find()` + `.save()`, Mongoose would try to cast the old
// string data against the new schema on the way in, which defeats the
// purpose of the migration. Going through the native driver avoids that.
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not found in .env — aborting.");
  process.exit(1);
}

const run = async () => {
  const client = await mongoose.connect(MONGODB_URI);
  const db = client.connection.db;
  const collection = db.collection("products"); // adjust if your collection name differs

  console.log("🔍 Scanning products collection...");

  const allProducts = await collection.find({}).toArray();
  console.log(`Found ${allProducts.length} total products.`);

  let migratedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const product of allProducts) {
    const updates = {};
    let needsUpdate = false;

    // ---- NAME ----
    if (typeof product.name === "string") {
      updates.name = { en: product.name, pt: product.name };
      needsUpdate = true;
    } else if (
      product.name &&
      typeof product.name === "object" &&
      (!product.name.en || !product.name.pt)
    ) {
      // Partially-shaped object (e.g. only `en` was ever set) — patch the
      // missing side rather than skipping entirely.
      updates.name = {
        en: product.name.en || product.name.pt || "",
        pt: product.name.pt || product.name.en || "",
      };
      needsUpdate = true;
    }

    // ---- DESCRIPTION ----
    if (typeof product.description === "string") {
      updates.description = { en: product.description, pt: product.description };
      needsUpdate = true;
    } else if (
      product.description &&
      typeof product.description === "object" &&
      (!product.description.en || !product.description.pt)
    ) {
      updates.description = {
        en: product.description.en || product.description.pt || "",
        pt: product.description.pt || product.description.en || "",
      };
      needsUpdate = true;
    }

    if (!needsUpdate) {
      skippedCount++;
      continue;
    }

    try {
      await collection.updateOne(
        { _id: product._id },
        { $set: updates }
      );
      migratedCount++;
      console.log(`✅ Migrated: ${product._id} (${updates.name?.en || product.name?.en || "unnamed"})`);
    } catch (err) {
      errorCount++;
      console.error(`❌ Failed to migrate ${product._id}:`, err.message);
    }
  }

  console.log("\n──────── MIGRATION SUMMARY ────────");
  console.log(`Total products scanned : ${allProducts.length}`);
  console.log(`Migrated               : ${migratedCount}`);
  console.log(`Already correct/skipped: ${skippedCount}`);
  console.log(`Errors                 : ${errorCount}`);
  console.log("────────────────────────────────────\n");

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error("❌ Migration script crashed:", err);
  process.exit(1);
});