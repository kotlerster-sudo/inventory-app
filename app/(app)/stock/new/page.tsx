export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { StockForm } from "@/components/stock/StockForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewStockPage() {
  const [categories, vendors] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.vendor.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 pt-2">
        <Link href="/stock" className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Add Stock Item</h1>
      </div>
      <StockForm categories={categories} vendors={vendors} />
    </div>
  );
}
