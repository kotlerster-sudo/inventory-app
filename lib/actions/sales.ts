"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createSale(data: {
  itemId: string;
  buyerName: string;
  quantity: number;
  salePrice: number;
  saleDate: string;
}) {
  const item = await prisma.item.findUniqueOrThrow({ where: { id: data.itemId } });
  const newSold = item.quantitySold + data.quantity;
  const isNegative = newSold > item.quantityBought;

  // Neon HTTP adapter does not support batched $transaction([]) —
  // use sequential awaits instead (fine for single-user shop load)
  await prisma.sale.create({
    data: {
      itemId: data.itemId,
      buyerName: data.buyerName,
      quantity: data.quantity,
      salePrice: data.salePrice,
      saleDate: new Date(data.saleDate),
      isNegative,
    },
  });
  await prisma.item.update({
    where: { id: data.itemId },
    data: { quantitySold: newSold },
  });

  revalidatePath("/sell/history");
  revalidatePath("/stock");
  revalidatePath("/dashboard");
}

export async function voidSale(saleId: string) {
  const sale = await prisma.sale.findUniqueOrThrow({ where: { id: saleId } });
  if (sale.voided) return;

  await prisma.sale.update({ where: { id: saleId }, data: { voided: true } });
  await prisma.item.update({
    where: { id: sale.itemId },
    data: { quantitySold: { decrement: sale.quantity } },
  });

  revalidatePath("/sell/history");
  revalidatePath("/stock");
  revalidatePath("/dashboard");
}

export async function getSales(filters?: { itemId?: string; voided?: boolean }) {
  return prisma.sale.findMany({
    where: {
      itemId: filters?.itemId || undefined,
      voided: filters?.voided !== undefined ? filters.voided : false,
    },
    include: { item: { include: { category: true } } },
    orderBy: { saleDate: "desc" },
  });
}
