"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createItem(data: {
  name: string;
  categoryId: string;
  vendorId: string;
  purchaseDate: string;
  quantityBought: number;
  buyingPrice: number;
  sellingPrice: number;
  photoUrl?: string;
  notes?: string;
}) {
  await prisma.item.create({
    data: {
      ...data,
      purchaseDate: new Date(data.purchaseDate),
    },
  });
  revalidatePath("/stock");
  revalidatePath("/dashboard");
}

export async function updateItem(
  id: string,
  data: {
    name?: string;
    categoryId?: string;
    vendorId?: string;
    purchaseDate?: string;
    quantityBought?: number;
    buyingPrice?: number;
    sellingPrice?: number;
    photoUrl?: string;
    notes?: string;
  }
) {
  await prisma.item.update({
    where: { id },
    data: {
      ...data,
      purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
    },
  });
  revalidatePath("/stock");
  revalidatePath(`/stock/${id}`);
  revalidatePath("/dashboard");
}

export async function deleteItem(id: string) {
  await prisma.item.delete({ where: { id } });
  revalidatePath("/stock");
  revalidatePath("/dashboard");
}

export async function getItems(filters?: {
  categoryId?: string;
  vendorId?: string;
  search?: string;
}) {
  return prisma.item.findMany({
    where: {
      categoryId: filters?.categoryId || undefined,
      vendorId: filters?.vendorId || undefined,
      name: filters?.search
        ? { contains: filters.search, mode: "insensitive" }
        : undefined,
    },
    include: { category: true, vendor: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getItem(id: string) {
  return prisma.item.findUnique({
    where: { id },
    include: {
      category: true,
      vendor: true,
      sales: { orderBy: { saleDate: "desc" } },
    },
  });
}

export async function searchItems(query: string) {
  const items = await prisma.item.findMany({
    where: query.trim()
      ? { name: { contains: query, mode: "insensitive" } }
      : undefined,                          // empty query → return all items
    include: { category: true },
    take: 30,
    orderBy: { createdAt: "desc" },         // newest first so recent additions appear at top
  });
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category.name,
    available: item.quantityBought - item.quantitySold,
    sellingPrice: item.sellingPrice,
    buyingPrice: item.buyingPrice,
  }));
}
