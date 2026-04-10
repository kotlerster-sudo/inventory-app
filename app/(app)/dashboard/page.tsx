export const dynamic = "force-dynamic";
import { getDashboardStats } from "@/lib/actions/dashboard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, TYPE_LABELS } from "@/lib/utils";
import Link from "next/link";
import {
  Package,
  TrendingUp,
  ShoppingBag,
  AlertTriangle,
  ArrowRight,
  IndianRupee,
  BarChart3,
} from "lucide-react";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const ENV_ITEM_TYPE = process.env.NEXT_PUBLIC_ITEM_TYPE;
  const typeFilter = ENV_ITEM_TYPE || type || "ALL";
  const stats = await getDashboardStats(typeFilter === "ALL" ? undefined : typeFilter);

  const kpis = [
    {
      label: "Total Purchased",
      value: stats.totalQtyBought,
      sub: "units",
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Current Stock",
      value: stats.currentStock,
      sub: "units",
      icon: ShoppingBag,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Purchase Value",
      value: formatCurrency(stats.totalPurchaseValue),
      sub: "total cost",
      icon: IndianRupee,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      label: "Stock Value",
      value: formatCurrency(stats.currentStockValue),
      sub: "at cost",
      icon: IndianRupee,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      label: "Units Sold",
      value: stats.totalSalesCount,
      sub: "units",
      icon: TrendingUp,
      color: "text-pink-600",
      bg: "bg-pink-50",
    },
    {
      label: "Sale Revenue",
      value: formatCurrency(stats.totalSaleValue),
      sub: "total",
      icon: TrendingUp,
      color: "text-teal-600",
      bg: "bg-teal-50",
    },
    {
      label: "Gross Profit",
      value: formatCurrency(stats.totalProfit),
      sub: "revenue − cost",
      icon: BarChart3,
      color: stats.totalProfit >= 0 ? "text-green-600" : "text-red-600",
      bg: stats.totalProfit >= 0 ? "bg-green-50" : "bg-red-50",
    },
    {
      label: "Unique Items",
      value: stats.totalItemCount,
      sub: "in catalogue",
      icon: Package,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Alerts */}
      {(stats.negativeStockCount > 0 || stats.lowStockCount > 0) && (
        <div className="space-y-2">
          {stats.negativeStockCount > 0 && (
            <Link href="/stock?filter=negative">
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-3 text-sm">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span className="text-red-700 font-medium">
                  {stats.negativeStockCount} item{stats.negativeStockCount > 1 ? "s" : ""} with negative stock
                </span>
                <ArrowRight className="w-4 h-4 text-red-400 ml-auto" />
              </div>
            </Link>
          )}
          {stats.lowStockCount > 0 && (
            <Link href="/stock?filter=low">
              <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm">
                <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                <span className="text-yellow-700 font-medium">
                  {stats.lowStockCount} item{stats.lowStockCount > 1 ? "s" : ""} low on stock (≤ 3 units)
                </span>
                <ArrowRight className="w-4 h-4 text-yellow-400 ml-auto" />
              </div>
            </Link>
          )}
        </div>
      )}

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-3">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="flex flex-col gap-2">
              <div className={`w-8 h-8 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{kpi.label}</p>
                <p className="text-xl font-bold text-gray-900 leading-tight">{kpi.value}</p>
                <p className="text-xs text-gray-400">{kpi.sub}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Category breakdown */}
      {stats.categoryBreakdown.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
            Category Breakdown
          </h2>
          <Card className="p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Category</th>
                  <th className="text-right px-3 py-2.5 text-xs font-semibold text-gray-500">Stock</th>
                  <th className="text-right px-3 py-2.5 text-xs font-semibold text-gray-500">Revenue</th>
                  <th className="text-right px-3 py-2.5 text-xs font-semibold text-gray-500">Profit</th>
                </tr>
              </thead>
              <tbody>
                {stats.categoryBreakdown.map((cat, i) => (
                  <tr
                    key={cat.id}
                    className={`border-b border-gray-50 last:border-0 ${i % 2 === 0 ? "" : "bg-gray-50/50"}`}
                  >
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/stock?categoryId=${cat.id}`}
                        className="font-medium text-gray-800 hover:text-indigo-600 flex items-center gap-1.5"
                      >
                        {cat.name}
                        <Badge
                          variant={
                            cat.itemType === "SAREE"
                              ? "purple"
                              : cat.itemType === "JEWELLERY"
                              ? "yellow"
                              : "gray"
                          }
                        >
                          {TYPE_LABELS[cat.itemType]}
                        </Badge>
                      </Link>
                      <p className="text-xs text-gray-400">{cat.qtyBought} bought · {cat.currentStock} left</p>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span className={cat.currentStock < 0 ? "text-red-600 font-bold" : "text-gray-700"}>
                        {cat.currentStock}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right text-gray-700">
                      {formatCurrency(cat.saleValue)}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span className={cat.profit >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                        {formatCurrency(cat.profit)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {stats.categoryBreakdown.length === 0 && (
        <Card className="text-center py-10">
          <p className="text-gray-500 text-sm">No data yet. Add items to your stock to see stats.</p>
          <Link
            href="/stock/new"
            className="inline-flex items-center gap-1 text-indigo-600 text-sm font-medium mt-2 hover:underline"
          >
            Add your first item <ArrowRight className="w-4 h-4" />
          </Link>
        </Card>
      )}
    </div>
  );
}
