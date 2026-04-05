"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { createSale } from "@/lib/actions/sales";
import { searchItems } from "@/lib/actions/items";
import { formatCurrency } from "@/lib/utils";
import { Search, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";

type SearchResult = {
  id: string;
  name: string;
  category: string;
  available: number;
  sellingPrice: number;
  buyingPrice: number;
};

export function SellForm({ preselectedItemId }: { preselectedItemId?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<SearchResult | null>(null);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // If preselected item, load it
  useEffect(() => {
    if (preselectedItemId) {
      (async () => {
        const res = await searchItems("");
        const item = res.find((i) => i.id === preselectedItemId);
        if (item) setSelected(item);
      })();
    }
  }, [preselectedItemId]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      const res = await searchItems(query);
      setResults(res);
      setSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selected) return;
    const fd = new FormData(e.currentTarget);

    const quantity = Number(fd.get("quantity"));
    const salePrice = Number(fd.get("salePrice"));
    const buyerName = fd.get("buyerName") as string;
    const saleDate = fd.get("saleDate") as string;

    const errs: Record<string, string> = {};
    if (quantity < 1) errs.quantity = "Qty must be ≥ 1";
    if (salePrice <= 0) errs.salePrice = "Enter a valid price";
    if (!buyerName.trim()) errs.buyerName = "Enter buyer name";
    if (!saleDate) errs.saleDate = "Select a date";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});

    startTransition(async () => {
      await createSale({
        itemId: selected.id,
        buyerName,
        quantity,
        salePrice,
        saleDate,
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setSelected(null);
        setQuery("");
      }, 1500);
    });
  }

  const today = new Date().toISOString().split("T")[0];

  if (success) {
    return (
      <Card className="flex flex-col items-center py-12 text-center">
        <CheckCircle2 className="w-12 h-12 text-green-500 mb-3" />
        <p className="text-lg font-bold text-gray-900">Sale Recorded!</p>
        <p className="text-sm text-gray-500 mt-1">Stock has been updated.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Item search */}
      {!selected && (
        <Card>
          <p className="text-sm font-semibold text-gray-700 mb-2">Search Item</p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type item name..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
            />
            {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />}
          </div>

          {results.length > 0 && (
            <div className="mt-2 space-y-1.5">
              {results.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => { setSelected(item); setQuery(""); setResults([]); }}
                  className="w-full text-left flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-indigo-50 border border-gray-100 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.category} · MRP {formatCurrency(item.sellingPrice)}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={item.available < 0 ? "red" : item.available <= 3 ? "yellow" : "green"}>
                      {item.available} left
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          )}

          {query.length > 0 && !searching && results.length === 0 && (
            <p className="text-sm text-gray-400 mt-2 text-center">No items found</p>
          )}
        </Card>
      )}

      {/* Selected item + sale form */}
      {selected && (
        <Card>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="font-semibold text-gray-900">{selected.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{selected.category}</p>
              <div className="flex gap-2 mt-1.5">
                <Badge variant={selected.available < 0 ? "red" : selected.available <= 3 ? "yellow" : "green"}>
                  {selected.available} in stock
                </Badge>
              </div>
              {selected.available < 0 && (
                <div className="flex items-center gap-1.5 mt-2 text-xs text-red-600">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Already in negative stock
                </div>
              )}
            </div>
            <button
              onClick={() => setSelected(null)}
              className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-100"
            >
              Change
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Buyer Name"
              name="buyerName"
              placeholder="Customer name"
              error={errors.buyerName}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Quantity"
                name="quantity"
                type="number"
                min="1"
                defaultValue="1"
                error={errors.quantity}
              />
              <Input
                label="Sale Price (₹)"
                name="salePrice"
                type="number"
                step="0.01"
                defaultValue={selected.sellingPrice}
                error={errors.salePrice}
              />
            </div>

            <Input
              label="Sale Date"
              name="saleDate"
              type="date"
              defaultValue={today}
              error={errors.saleDate}
            />

            <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500 space-y-1">
              <div className="flex justify-between">
                <span>Suggested MRP</span>
                <span className="font-medium text-gray-700">{formatCurrency(selected.sellingPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span>Buying cost</span>
                <span className="font-medium text-gray-700">{formatCurrency(selected.buyingPrice)}</span>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Recording...</> : "Record Sale"}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
