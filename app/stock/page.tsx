import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatDate, LOW_STOCK_THRESHOLD, TYPE_LABELS } from "@/lib/utils";
import Link from "next/link";
import { Plus, Camera, ChevronRight } from "lucide-react";
import Image from "next/image";

export default async function StockPage({
  searchParams,
}: {
  searchParams: Promise<{ categoryId?: string; vendorId?: string; filter?: string; q?: string }>;
}) {
  const params = await searchParams;

  const items = await prisma.item.findMany({
    where: {
      categoryId: params.categoryId || undefined,
      vendorId: params.vendorId || undefined,
      name: params.q ? { contains: params.q } : undefined,
    },
    include: { category: true, vendor: true },
    orderBy: { createdAt: "desc" },
  });

  const filtered = params.filter === "negative"
    ? items.filter((i) => i.quantitySold > i.quantityBought)
    : params.filter === "low"
    ? items.filter((i) => {
        const av = i.quantityBought - i.quantitySold;
        return av > 0 && av <= LOW_STOCK_THRESHOLD;
      })
    : items;

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-xl font-bold text-gray-900">Stock Register</h1>
        <Link
          href="/stock/new"
          className="flex items-center gap-1 bg-indigo-600 text-white text-sm font-medium px-3 py-2 rounded-xl hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Item
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <Link
          href="/stock"
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            !params.categoryId && !params.filter ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-500 border-gray-200"
          }`}
        >
          All
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/stock?categoryId=${cat.id}`}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              params.categoryId === cat.id ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-500 border-gray-200"
            }`}
          >
            {cat.name}
          </Link>
        ))}
        <Link
          href="/stock?filter=negative"
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            params.filter === "negative" ? "bg-red-500 text-white border-red-500" : "bg-white text-gray-500 border-gray-200"
          }`}
        >
          Negative
        </Link>
        <Link
          href="/stock?filter=low"
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            params.filter === "low" ? "bg-yellow-500 text-white border-yellow-500" : "bg-white text-gray-500 border-gray-200"
          }`}
        >
          Low Stock
        </Link>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No items found"
          description="Add items to your stock register to see them here."
          action={
            <Link href="/stock/new" className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors">
              Add Item
            </Link>
          }
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => {
            const available = item.quantityBought - item.quantitySold;
            const isNegative = available < 0;
            const isLow = available > 0 && available <= LOW_STOCK_THRESHOLD;
            return (
              <Link key={item.id} href={`/stock/${item.id}`}>
                <Card className={`flex gap-3 items-start cursor-pointer hover:shadow-md transition-shadow ${isNegative ? "border-red-200 bg-red-50/30" : ""}`}>
                  {/* Photo */}
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    {item.photoUrl ? (
                      <Image src={item.photoUrl} alt={item.name} width={56} height={56} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Camera className="w-5 h-5 text-gray-300" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-gray-900 text-sm leading-snug truncate">{item.name}</p>
                      <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <Badge
                        variant={item.category.itemType === "SAREE" ? "purple" : item.category.itemType === "JEWELLERY" ? "yellow" : "gray"}
                      >
                        {item.category.name}
                      </Badge>
                      {isNegative && <Badge variant="red">Negative Stock</Badge>}
                      {isLow && <Badge variant="yellow">Low Stock</Badge>}
                    </div>
                    <div className="flex gap-3 mt-1.5 text-xs text-gray-500">
                      <span>Bought: {item.quantityBought}</span>
                      <span>Sold: {item.quantitySold}</span>
                      <span className={isNegative ? "text-red-600 font-bold" : "font-medium text-gray-700"}>
                        Left: {available}
                      </span>
                    </div>
                    <div className="flex gap-3 mt-0.5 text-xs text-gray-400">
                      <span>Cost: {formatCurrency(item.buyingPrice)}</span>
                      <span>MRP: {formatCurrency(item.sellingPrice)}</span>
                      <span>{formatDate(item.purchaseDate)}</span>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
