"use server";

import { prisma } from "@/lib/prisma";

const ENV_ITEM_TYPE = process.env.NEXT_PUBLIC_ITEM_TYPE;

export async function getDashboardStats(typeFilter?: string) {
  // If env locks to a specific store type, always use that regardless of URL param
  const effectiveType = ENV_ITEM_TYPE || (typeFilter !== "ALL" ? typeFilter : undefined);
  const categoryFilter = effectiveType
    ? { category: { itemType: effectiveType } }
    : undefined;

  const [items, sales, categories] = await Promise.all([
    prisma.item.findMany({
      where: categoryFilter,
      include: { category: true },
    }),
    prisma.sale.findMany({
      where: {
        voided: false,
        item: categoryFilter,
      },
      include: { item: { include: { category: true } } },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const totalQtyBought = items.reduce((s, i) => s + i.quantityBought, 0);
  const totalQtySold = items.reduce((s, i) => s + i.quantitySold, 0);
  const currentStock = totalQtyBought - totalQtySold;
  const totalPurchaseValue = items.reduce(
    (s, i) => s + i.quantityBought * i.buyingPrice,
    0
  );
  const currentStockValue = items.reduce(
    (s, i) => s + (i.quantityBought - i.quantitySold) * i.buyingPrice,
    0
  );
  const totalSalesCount = sales.reduce((s, sale) => s + sale.quantity, 0);
  const totalSaleValue = sales.reduce(
    (s, sale) => s + sale.quantity * sale.salePrice,
    0
  );
  const totalCostOfSales = sales.reduce((s, sale) => {
    const item = items.find((i) => i.id === sale.itemId);
    return s + sale.quantity * (item?.buyingPrice ?? 0);
  }, 0);
  const totalProfit = totalSaleValue - totalCostOfSales;

  // Category breakdown
  const categoryBreakdown = categories
    .filter((cat) => {
      if (!typeFilter || typeFilter === "ALL") return true;
      return cat.itemType === typeFilter;
    })
    .map((cat) => {
      const catItems = items.filter((i) => i.categoryId === cat.id);
      const catSales = sales.filter(
        (s) => s.item.categoryId === cat.id
      );
      const qtyBought = catItems.reduce((s, i) => s + i.quantityBought, 0);
      const qtySold = catItems.reduce((s, i) => s + i.quantitySold, 0);
      const saleValue = catSales.reduce(
        (s, sale) => s + sale.quantity * sale.salePrice,
        0
      );
      const costOfSales = catSales.reduce((s, sale) => {
        const item = catItems.find((i) => i.id === sale.itemId);
        return s + sale.quantity * (item?.buyingPrice ?? 0);
      }, 0);
      return {
        id: cat.id,
        name: cat.name,
        itemType: cat.itemType,
        qtyBought,
        currentStock: qtyBought - qtySold,
        purchaseValue: catItems.reduce(
          (s, i) => s + i.quantityBought * i.buyingPrice,
          0
        ),
        saleValue,
        profit: saleValue - costOfSales,
        itemCount: catItems.length,
      };
    })
    .filter((c) => c.itemCount > 0);

  // Items with issues
  const negativeStockItems = items.filter(
    (i) => i.quantitySold > i.quantityBought
  );
  const lowStockItems = items.filter((i) => {
    const available = i.quantityBought - i.quantitySold;
    return available > 0 && available <= 3;
  });

  return {
    totalQtyBought,
    currentStock,
    totalPurchaseValue,
    currentStockValue,
    totalSalesCount,
    totalSaleValue,
    totalProfit,
    categoryBreakdown,
    negativeStockCount: negativeStockItems.length,
    lowStockCount: lowStockItems.length,
    totalItemCount: items.length,
  };
}
