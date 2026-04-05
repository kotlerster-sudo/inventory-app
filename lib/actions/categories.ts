"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCategory(data: { name: string; itemType: string }) {
  await prisma.category.create({ data });
  revalidatePath("/categories");
  revalidatePath("/stock/new");
}

export async function deleteCategory(id: string) {
  await prisma.category.delete({ where: { id } });
  revalidatePath("/categories");
}

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}
