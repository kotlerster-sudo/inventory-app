"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createVendor(data: { name: string; phone?: string }) {
  await prisma.vendor.create({ data });
  revalidatePath("/vendors");
  revalidatePath("/stock/new");
}

export async function deleteVendor(id: string) {
  await prisma.vendor.delete({ where: { id } });
  revalidatePath("/vendors");
}

export async function getVendors() {
  return prisma.vendor.findMany({ orderBy: { name: "asc" } });
}
