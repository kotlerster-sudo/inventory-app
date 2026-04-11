/**
 * Recalculates quantitySold on all items from actual sale records.
 * Fixes double-counting caused by import setting quantitySold from
 * the stock CSV and then incrementing it again when importing sales.
 *
 * Usage:
 *   DATABASE_URL=<neon-url> node prisma/recalc.mjs
 */

import { PrismaNeonHttp } from "@prisma/adapter-neon";
import { PrismaClient } from "../app/generated/prisma/index.js";

const adapter = new PrismaNeonHttp(process.env.DATABASE_URL, {});
const prisma = new PrismaClient({ adapter });

async function main() {
  const items = await prisma.item.findMany({
    include: {
      sales: { where: { voided: false } },
    },
  });

  console.log(`Recalculating quantitySold for ${items.length} items…`);
  let fixed = 0;

  for (const item of items) {
    const actualSold = item.sales.reduce((sum, s) => sum + s.quantity, 0);
    if (item.quantitySold !== actualSold) {
      await prisma.item.update({
        where: { id: item.id },
        data: { quantitySold: actualSold },
      });
      console.log(`  ✓ ${item.name}: ${item.quantitySold} → ${actualSold}`);
      fixed++;
    }
  }

  console.log(`\nDone. ${fixed} items corrected, ${items.length - fixed} already correct.`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
