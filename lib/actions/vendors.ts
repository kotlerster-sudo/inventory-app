"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";

export const getVendors = unstable_cache(
  async () => prisma.vendor.findMany({ orderBy: { name: "asc" } }),
  ["vendors"],
  { tags: ["vendors"] }
);

export async function createVendor(data: { name: string; phone?: string }) {
  await prisma.vendor.create({ data });
  revalidateTag("vendors", {});
  revalidatePath("/vendors");
  revalidatePath("/stock/new");
}

export async function deleteVendor(id: string) {
  await prisma.vendor.delete({ where: { id } });
  revalidateTag("vendors", {});
  revalidatePath("/vendors");
}
