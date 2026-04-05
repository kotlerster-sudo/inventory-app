import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { VoidSaleButton } from "@/components/sell/VoidSaleButton";
import { ExportButton } from "@/components/sell/ExportButton";

export default async function SalesHistoryPage() {
  const sales = await prisma.sale.findMany({
    orderBy: { saleDate: "desc" },
    include: { item: { include: { category: true } } },
  });

  const activeSales = sales.filter((s) => !s.voided);
  const totalRevenue = activeSales.reduce((s, sale) => s + sale.quantity * sale.salePrice, 0);
  const totalUnits = activeSales.reduce((s, sale) => s + sale.quantity, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <Link href="/sell" className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Sales History</h1>
        </div>
        <ExportButton />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="text-center">
          <p className="text-2xl font-bold text-gray-900">{totalUnits}</p>
          <p className="text-xs text-gray-500 mt-0.5">Units Sold</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-teal-600">{formatCurrency(totalRevenue)}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total Revenue</p>
        </Card>
      </div>

      {sales.length === 0 ? (
        <EmptyState
          title="No sales yet"
          description="Record your first sale to see it here."
          action={
            <Link href="/sell" className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-xl">
              Record Sale
            </Link>
          }
        />
      ) : (
        <div className="space-y-2">
          {sales.map((sale) => (
            <Card
              key={sale.id}
              className={`${sale.voided ? "opacity-50" : ""} ${sale.isNegative ? "border-red-200 bg-red-50/30" : ""}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900 text-sm truncate">{sale.item.name}</p>
                    {sale.voided && <Badge variant="gray">Voided</Badge>}
                    {sale.isNegative && !sale.voided && <Badge variant="red">Negative Stock</Badge>}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{sale.item.category.name}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    <span className="font-medium">{sale.buyerName}</span>
                    {" · "}
                    {sale.quantity} unit{sale.quantity > 1 ? "s" : ""}
                    {" · "}
                    {formatCurrency(sale.salePrice)} each
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(sale.saleDate)}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <p className="font-bold text-gray-900 text-sm">
                    {formatCurrency(sale.quantity * sale.salePrice)}
                  </p>
                  {!sale.voided && <VoidSaleButton saleId={sale.id} />}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
