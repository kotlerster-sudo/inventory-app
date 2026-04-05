import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const sales = await prisma.sale.findMany({
    where: { voided: false },
    orderBy: { saleDate: "desc" },
    include: { item: { include: { category: true, vendor: true } } },
  });

  const rows = [
    ["Date", "Item", "Category", "Vendor", "Buyer", "Qty", "Sale Price", "Total", "Buying Price", "Profit"],
    ...sales.map((s) => [
      s.saleDate.toISOString().split("T")[0],
      s.item.name,
      s.item.category.name,
      s.item.vendor.name,
      s.buyerName,
      s.quantity,
      s.salePrice,
      s.quantity * s.salePrice,
      s.item.buyingPrice,
      (s.salePrice - s.item.buyingPrice) * s.quantity,
    ]),
  ];

  const csv = rows.map((r) => r.map(String).map((v) => `"${v.replace(/"/g, '""')}"`).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="sales-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
