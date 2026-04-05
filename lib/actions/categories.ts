"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";

export const getCategories = unstable_cache(
  async () => prisma.category.findMany({ orderBy: { name: "asc" } }),
  ["categories"],
  { tags: ["categories"] }
);

export async function createCategory(data: { name: string; itemType: string }) {
  await prisma.category.create({ data });
  revalidateTag("categories", {});
  revalidatePath("/categories");
  revalidatePath("/stock/new");
}

export async function deleteCategory(id: string) {
  await prisma.category.delete({ where: { id } });
  revalidateTag("categories", {});
  revalidatePath("/categories");
}
