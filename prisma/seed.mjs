// Plain JS seed — run with: node prisma/seed.mjs
// Requires DATABASE_URL env var to be set (Neon connection string)
import { neon } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../app/generated/prisma/index.js";

const sql = neon(process.env.DATABASE_URL);
const adapter = new PrismaNeon(sql);
const prisma = new PrismaClient({ adapter });

const categories = [
  { name: "Kanjivaram Silk", itemType: "SAREE" },
  { name: "Banarasi Silk", itemType: "SAREE" },
  { name: "Cotton Saree", itemType: "SAREE" },
  { name: "Patola Saree", itemType: "SAREE" },
  { name: "Gold Necklace", itemType: "JEWELLERY" },
  { name: "Gold Bangle", itemType: "JEWELLERY" },
  { name: "Silver Anklet", itemType: "JEWELLERY" },
  { name: "Diamond Ring", itemType: "JEWELLERY" },
  { name: "Earrings", itemType: "JEWELLERY" },
];

const vendors = [
  { name: "Ravi Textiles", phone: "+91 98400 12345" },
  { name: "Chennai Silks", phone: "+91 98400 67890" },
  { name: "Lakshmi Jewellers", phone: "+91 98765 43210" },
];

async function main() {
  for (const cat of categories) {
    await prisma.category.upsert({ where: { name: cat.name }, update: {}, create: cat });
  }
  for (const v of vendors) {
    await prisma.vendor.upsert({ where: { name: v.name }, update: {}, create: v });
  }
  console.log("Seed complete ✓");
}

main().catch(console.error).finally(() => prisma.$disconnect());
