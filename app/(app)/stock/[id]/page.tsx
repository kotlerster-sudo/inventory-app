export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate, LOW_STOCK_THRESHOLD, TYPE_LABELS } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, Camera, Edit2 } from "lucide-react";
import Image from "next/image";
import { ItemEditForm } from "@/components/stock/ItemEditForm";

export default async function ItemDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const { id } = await params;
  const { edit } = await searchParams;

  const item = await prisma.item.findUnique({
    where: { id },
    include: {
      category: true,
      vendor: true,
      sales: { where: { voided: false }, orderBy: { saleDate: "desc" } },
    },
  });

  if (!item) notFound();

  const available = item.quantityBought - item.quantitySold;
  const isNegative = available < 0;
  const isLow = available > 0 && available <= LOW_STOCK_THRESHOLD;

  const totalRevenue = item.sales.reduce((s, sale) => s + sale.quantity * sale.salePrice, 0);
  const totalCost = item.quantitySold * item.buyingPrice;
  const profit = totalRevenue - totalCost;

  if (edit === "1") {
    const [categories, vendors] = await Promise.all([
      prisma.category.findMany({ orderBy: { name: "asc" } }),
      prisma.vendor.findMany({ orderBy: { name: "asc" } }),
    ]);
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 pt-2">
          <Link href={`/stock/${id}`} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Edit Item</h1>
        </div>
        <ItemEditForm item={item} categories={categories} vendors={vendors} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <Link href="/stock" className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900 truncate">{item.name}</h1>
        </div>
        <Link href={`/stock/${id}?edit=1`} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <Edit2 className="w-4 h-4 text-gray-500" />
        </Link>
      </div>

      {/* Photo */}
      {item.photoUrl && (
        <div className="w-full aspect-video rounded-2xl overflow-hidden bg-gray-100">
          <Image src={item.photoUrl} alt={item.name} width={600} height={400} className="w-full h-full object-cover" />
        </div>
      )}
      {!item.photoUrl && (
        <div className="w-full h-32 rounded-2xl bg-gray-100 flex items-center justify-center">
          <Camera className="w-8 h-8 text-gray-300" />
        </div>
      )}

      {/* Status badges */}
      <div className="flex flex-wrap gap-2">
        <Badge variant={item.category.itemType === "SAREE" ? "purple" : item.category.itemType === "JEWELLERY" ? "yellow" : "gray"}>
          {item.category.name}
        </Badge>
        <Badge variant="blue">{TYPE_LABELS[item.category.itemType]}</Badge>
        {isNegative && <Badge variant="red">Negative Stock</Badge>}
        {isLow && <Badge variant="yellow">Low Stock</Badge>}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="text-center">
          <p className="text-2xl font-bold text-gray-900">{item.quantityBought}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total Purchased</p>
        </Card>
        <Card className="text-center">
          <p className={`text-2xl font-bold ${isNegative ? "text-red-600" : "text-gray-900"}`}>{available}</p>
          <p className="text-xs text-gray-500 mt-0.5">Available</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-gray-900">{item.quantitySold}</p>
          <p className="text-xs text-gray-500 mt-0.5">Units Sold</p>
        </Card>
        <Card className="text-center">
          <p className={`text-2xl font-bold ${profit >= 0 ? "text-green-600" : "text-red-600"}`}>{formatCurrency(profit)}</p>
          <p className="text-xs text-gray-500 mt-0.5">Profit</p>
        </Card>
      </div>

      {/* Details */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-600 mb-3">Item Details</h2>
        <div className="space-y-2.5">
          {[
            { label: "Vendor", value: item.vendor.name },
            { label: "Purchase Date", value: formatDate(item.purchaseDate) },
            { label: "Buying Price", value: formatCurrency(item.buyingPrice) },
            { label: "Selling Price", value: formatCurrency(item.sellingPrice) },
            { label: "Total Purchase Cost", value: formatCurrency(item.quantityBought * item.buyingPrice) },
            { label: "Total Revenue", value: formatCurrency(totalRevenue) },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center text-sm">
              <span className="text-gray-500">{label}</span>
              <span className="font-medium text-gray-800">{value}</span>
            </div>
          ))}
          {item.notes && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Notes</p>
              <p className="text-sm text-gray-700">{item.notes}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Sale history */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-600">Sale History</h2>
          <Link href={`/sell?itemId=${item.id}`} className="text-xs text-indigo-600 font-medium hover:underline">
            Record Sale
          </Link>
        </div>
        {item.sales.length === 0 ? (
          <Card className="text-center py-6">
            <p className="text-sm text-gray-400">No sales recorded yet.</p>
          </Card>
        ) : (
          <Card className="p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Buyer</th>
                  <th className="text-right px-3 py-2.5 text-xs font-semibold text-gray-500">Qty</th>
                  <th className="text-right px-3 py-2.5 text-xs font-semibold text-gray-500">Price</th>
                  <th className="text-right px-3 py-2.5 text-xs font-semibold text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody>
                {item.sales.map((sale, i) => (
                  <tr key={sale.id} className={`border-b border-gray-50 last:border-0 ${sale.isNegative ? "bg-red-50" : i % 2 !== 0 ? "bg-gray-50/50" : ""}`}>
                    <td className="px-4 py-2.5">
                      <span className="font-medium text-gray-800">{sale.buyerName}</span>
                      {sale.isNegative && <Badge variant="red" className="ml-1.5 text-xs">Neg</Badge>}
                    </td>
                    <td className="px-3 py-2.5 text-right text-gray-700">{sale.quantity}</td>
                    <td className="px-3 py-2.5 text-right text-gray-700">{formatCurrency(sale.salePrice)}</td>
                    <td className="px-3 py-2.5 text-right text-gray-500">{formatDate(sale.saleDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </div>
  );
}
