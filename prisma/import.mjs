/**
 * Import AppSheet data into the inventory app.
 *
 * Usage:
 *   DATABASE_URL=<neon-url> BLOB_READ_WRITE_TOKEN=<token> \
 *     node prisma/import.mjs --stock=stock.csv --sales=sales.csv --photos=./Inventory_Images
 *
 * --photos is optional. Point it at the folder you downloaded from Google Drive.
 * --stock and --sales are also individually optional.
 *
 * CSV format expected:
 *   Stock:  SKU ID, Category, Item Name, Buying Price, Quantity, Photo, Status, Date Added, Sold Quantity
 *   Sales:  Sale ID, SKU ID, Sale Date, Selling Price, Sold Quantity, Customer Name
 */

import { readFileSync, existsSync, readdirSync } from "fs";
import { join, extname, basename } from "path";
import { PrismaNeonHttp } from "@prisma/adapter-neon";
import { PrismaClient } from "../app/generated/prisma/index.js";
import { put } from "@vercel/blob";

// ── Prisma setup ─────────────────────────────────────────────────────────────
const adapter = new PrismaNeonHttp(process.env.DATABASE_URL, {});
const prisma = new PrismaClient({ adapter });

// ── CSV parser ───────────────────────────────────────────────────────────────
function parseCSV(filePath) {
  const text = readFileSync(filePath, "utf8");
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values = [];
    let inQuote = false;
    let cur = "";
    for (const ch of line) {
      if (ch === '"') { inQuote = !inQuote; continue; }
      if (ch === "," && !inQuote) { values.push(cur.trim()); cur = ""; continue; }
      cur += ch;
    }
    values.push(cur.trim());
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]));
  });
}

// ── Date parser — handles YYYY-MM-DD and DD/MM/YYYY ─────────────────────────
function parseDate(str) {
  if (!str || !str.trim()) return new Date();
  const s = str.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(s);
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
    const [d, m, y] = s.split("/");
    return new Date(`${y}-${m}-${d}`);
  }
  const d = new Date(s);
  if (!isNaN(d)) return d;
  console.warn(`  ⚠ Could not parse date "${str}", using today`);
  return new Date();
}

// ── Arg parser ───────────────────────────────────────────────────────────────
function getArg(name) {
  const arg = process.argv.find((a) => a.startsWith(`--${name}=`));
  return arg ? arg.split("=").slice(1).join("=") : null;
}

// ── Infer itemType from category name ────────────────────────────────────────
function inferItemType(categoryName) {
  const n = categoryName.toLowerCase();
  if (n.includes("saree") || n.includes("sari") || n.includes("silk") || n.includes("cotton")) return "SAREE";
  if (n.includes("necklace") || n.includes("earring") || n.includes("ring") || n.includes("bangle") ||
      n.includes("bracelet") || n.includes("anklet") || n.includes("jewel") || n.includes("gold") ||
      n.includes("silver") || n.includes("diamond") || n.includes("pendant") || n.includes("chain")) return "JEWELLERY";
  return "OTHER";
}

// ── Build photo lookup: SKU → local file path ─────────────────────────────────
// AppSheet photo column value looks like: Inventory_Images/MOH7001.Photo.113209.jpg
// The actual filename on disk after download is:          MOH7001.Photo.113209.jpg
// We index all files in the photos folder by their base filename (lowercased).
function buildPhotoIndex(photosDir) {
  if (!photosDir || !existsSync(photosDir)) return new Map();
  const index = new Map();
  const imageExts = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
  for (const file of readdirSync(photosDir)) {
    if (imageExts.has(extname(file).toLowerCase())) {
      index.set(file.toLowerCase(), join(photosDir, file));
    }
  }
  console.log(`  Photo index built: ${index.size} images found in "${photosDir}"`);
  return index;
}

// ── Resolve photo path: try exact filename, then SKU prefix match ─────────────
function resolvePhoto(photoColumn, sku, photoIndex) {
  if (!photoIndex.size) return null;

  // Try exact filename match (strip the folder prefix from CSV value)
  if (photoColumn) {
    const csvFilename = basename(photoColumn).toLowerCase();
    if (photoIndex.has(csvFilename)) return photoIndex.get(csvFilename);
  }

  // Fallback: find any file whose name starts with the SKU (case-insensitive)
  if (sku) {
    const skuLower = sku.toLowerCase();
    for (const [filename, fullPath] of photoIndex) {
      if (filename.startsWith(skuLower)) return fullPath;
    }
  }

  return null;
}

// ── Upload a local file to Vercel Blob ────────────────────────────────────────
async function uploadPhoto(localPath, sku) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.warn(`  ⚠ BLOB_READ_WRITE_TOKEN not set — photo for ${sku} skipped`);
    return null;
  }
  try {
    const fileBuffer = readFileSync(localPath);
    const ext = extname(localPath).toLowerCase() || ".jpg";
    const blobName = `products/${sku}-${Date.now()}${ext}`;
    const blob = await put(blobName, fileBuffer, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType: ext === ".png" ? "image/png" : "image/jpeg",
    });
    return blob.url;
  } catch (err) {
    console.warn(`  ⚠ Upload failed for ${sku}: ${err.message}`);
    return null;
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const stockFile  = getArg("stock");
  const salesFile  = getArg("sales");
  const photosDir  = getArg("photos");

  if (!stockFile && !salesFile) {
    console.error("Usage: node prisma/import.mjs --stock=stock.csv --sales=sales.csv [--photos=./Inventory_Images]");
    process.exit(1);
  }

  const stockRows = stockFile ? parseCSV(stockFile) : [];
  const salesRows = salesFile ? parseCSV(salesFile) : [];
  const photoIndex = buildPhotoIndex(photosDir);

  console.log(`Parsed ${stockRows.length} stock rows, ${salesRows.length} sales rows`);
  if (photosDir && !photoIndex.size) {
    console.warn(`  ⚠ No images found in "${photosDir}" — check the folder path`);
  }

  // ── Build sellingPrice map from sales data ────────────────────────────────
  const sellingPriceBySku = new Map();
  for (const row of salesRows) {
    const sku   = row["SKU ID"]?.trim();
    const price = parseFloat(row["Selling Price"]);
    if (sku && !isNaN(price)) {
      const existing = sellingPriceBySku.get(sku) ?? 0;
      if (price > existing) sellingPriceBySku.set(sku, price);
    }
  }

  // ── Ensure default vendor exists ─────────────────────────────────────────
  const DEFAULT_VENDOR = "Imported (Unknown Vendor)";
  let vendor = await prisma.vendor.findUnique({ where: { name: DEFAULT_VENDOR } });
  if (!vendor) vendor = await prisma.vendor.create({ data: { name: DEFAULT_VENDOR } });
  console.log(`Vendor: "${DEFAULT_VENDOR}" ready (id: ${vendor.id})`);

  // ── Import stock items ────────────────────────────────────────────────────
  const skuToItemId = new Map();

  if (stockRows.length > 0) {
    console.log("\n── Importing stock items ─────────────────────────────────");
    let created = 0, skipped = 0;

    for (const row of stockRows) {
      const sku       = row["SKU ID"]?.trim();
      const catName   = row["Category"]?.trim() || "Uncategorized";
      const itemName  = row["Item Name"]?.trim();
      const buyPrice  = parseFloat(row["Buying Price"]);
      const qty       = parseInt(row["Quantity"], 10);
      const dateAdded = parseDate(row["Date Added"]);
      const soldQty   = parseInt(row["Sold Quantity"], 10) || 0;
      const photoCol  = row["Photo"]?.trim();

      if (!itemName) { console.warn(`  ⚠ Skipping row with no Item Name (SKU: ${sku})`); skipped++; continue; }
      if (isNaN(buyPrice)) { console.warn(`  ⚠ Skipping "${itemName}" — invalid Buying Price`); skipped++; continue; }
      if (isNaN(qty) || qty < 1) { console.warn(`  ⚠ Skipping "${itemName}" — invalid Quantity`); skipped++; continue; }

      const sellPrice = sellingPriceBySku.get(sku) ?? Math.round(buyPrice * 1.5);

      // Find or create category
      const itemType = inferItemType(catName);
      let category = await prisma.category.findUnique({ where: { name: catName } });
      if (!category) category = await prisma.category.create({ data: { name: catName, itemType } });

      // Skip if already imported (matched by SKU in notes)
      const existing = await prisma.item.findFirst({
        where: { notes: { contains: sku, mode: "insensitive" } },
      });
      if (existing) {
        console.log(`  ↩ Already exists: ${sku} "${itemName}"`);
        skuToItemId.set(sku, existing.id);
        skipped++;
        continue;
      }

      // Resolve and upload photo
      let photoUrl = null;
      const localPhoto = resolvePhoto(photoCol, sku, photoIndex);
      if (localPhoto) {
        process.stdout.write(`  📷 Uploading photo for ${sku}… `);
        photoUrl = await uploadPhoto(localPhoto, sku);
        console.log(photoUrl ? `✓ ${photoUrl}` : "failed");
      } else if (photoCol) {
        console.log(`  ⚠ Photo not found locally for ${sku} (CSV: "${photoCol}")`);
      }

      const item = await prisma.item.create({
        data: {
          name: itemName,
          categoryId: category.id,
          vendorId: vendor.id,
          purchaseDate: dateAdded,
          quantityBought: qty,
          buyingPrice: buyPrice,
          sellingPrice: sellPrice,
          quantitySold: soldQty,
          photoUrl,
          notes: sku ? `SKU: ${sku}` : undefined,
        },
      });

      skuToItemId.set(sku, item.id);
      console.log(`  ✓ ${sku} "${itemName}" — qty ${qty}, buy ₹${buyPrice}, sell ₹${sellPrice}${photoUrl ? ", photo ✓" : ""}`);
      created++;
    }

    console.log(`\nStock: ${created} created, ${skipped} skipped`);
  }

  // ── Import sales ──────────────────────────────────────────────────────────
  if (salesRows.length > 0) {
    console.log("\n── Importing sales ───────────────────────────────────────");

    if (stockRows.length === 0) {
      console.log("  (loading SKU map from existing DB items...)");
      const allItems = await prisma.item.findMany({ select: { id: true, notes: true } });
      for (const it of allItems) {
        const match = it.notes?.match(/SKU:\s*(\S+)/i);
        if (match) skuToItemId.set(match[1], it.id);
      }
    }

    let created = 0, skipped = 0;

    for (const row of salesRows) {
      const sku       = row["SKU ID"]?.trim();
      const saleDate  = parseDate(row["Sale Date"]);
      const salePrice = parseFloat(row["Selling Price"]);
      const qty       = parseInt(row["Sold Quantity"], 10);
      const buyerName = row["Customer Name"]?.trim() || "Unknown";
      const saleId    = row["Sale ID"]?.trim();

      if (!sku) { console.warn(`  ⚠ Skipping sale with no SKU`); skipped++; continue; }
      if (isNaN(salePrice) || salePrice <= 0) { console.warn(`  ⚠ Skipping sale ${saleId} — invalid price`); skipped++; continue; }
      if (isNaN(qty) || qty < 1) { console.warn(`  ⚠ Skipping sale ${saleId} — invalid qty`); skipped++; continue; }

      const itemId = skuToItemId.get(sku);
      if (!itemId) {
        console.warn(`  ⚠ Skipping sale ${saleId} — SKU "${sku}" not found in DB`);
        skipped++;
        continue;
      }

      const item = await prisma.item.findUnique({ where: { id: itemId } });
      const newSold = (item?.quantitySold ?? 0) + qty;
      const isNegative = newSold > (item?.quantityBought ?? 0);

      await prisma.sale.create({
        data: { itemId, buyerName, quantity: qty, salePrice, saleDate, isNegative },
      });
      await prisma.item.update({
        where: { id: itemId },
        data: { quantitySold: newSold },
      });

      console.log(`  ✓ Sale ${saleId || "(no id)"} — SKU ${sku}, qty ${qty}, ₹${salePrice}, buyer: ${buyerName}`);
      created++;
    }

    console.log(`\nSales: ${created} created, ${skipped} skipped`);
  }

  console.log("\n✅ Import complete!");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
