"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { createItem } from "@/lib/actions/items";
import { PhotoPicker } from "./PhotoPicker";
import { Loader2 } from "lucide-react";

type Category = { id: string; name: string; itemType: string };
type Vendor = { id: string; name: string };

export function StockForm({ categories, vendors }: { categories: Category[]; vendors: Vendor[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const name = fd.get("name") as string;
    const categoryId = fd.get("categoryId") as string;
    const vendorId = fd.get("vendorId") as string;
    const purchaseDate = fd.get("purchaseDate") as string;
    const quantityBought = Number(fd.get("quantityBought"));
    const buyingPrice = Number(fd.get("buyingPrice"));
    const sellingPrice = Number(fd.get("sellingPrice"));
    const notes = fd.get("notes") as string;

    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Name is required";
    if (!categoryId) errs.categoryId = "Select a category";
    if (!vendorId) errs.vendorId = "Select a vendor";
    if (!purchaseDate) errs.purchaseDate = "Date is required";
    if (!quantityBought || quantityBought < 1) errs.quantityBought = "Enter quantity ≥ 1";
    if (!buyingPrice || buyingPrice <= 0) errs.buyingPrice = "Enter a valid price";
    if (!sellingPrice || sellingPrice <= 0) errs.sellingPrice = "Enter a valid price";

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});

    startTransition(async () => {
      await createItem({
        name,
        categoryId,
        vendorId,
        purchaseDate,
        quantityBought,
        buyingPrice,
        sellingPrice,
        photoUrl: photoUrl ?? undefined,
        notes: notes || undefined,
      });
      router.push("/stock");
    });
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4">
        <PhotoPicker
          photoUrl={photoUrl}
          uploading={uploading}
          uploadStatus={uploadStatus}
          onPhotoChange={setPhotoUrl}
          onClear={() => setPhotoUrl(null)}
          onUploadStart={(s) => { setUploading(true); setUploadStatus(s); }}
          onUploadEnd={() => { setUploading(false); setUploadStatus(""); }}
        />

        <Input label="Item Name" name="name" placeholder="e.g. Kanjivaram Silk Saree – Red" error={errors.name} />

        <div className="grid grid-cols-2 gap-3">
          <Select label="Category" name="categoryId" error={errors.categoryId}>
            <option value="">Select...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
          <Select label="Vendor" name="vendorId" error={errors.vendorId}>
            <option value="">Select...</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </Select>
        </div>

        <Input label="Purchase Date" name="purchaseDate" type="date" defaultValue={today} error={errors.purchaseDate} />

        <div className="grid grid-cols-3 gap-3">
          <Input label="Quantity" name="quantityBought" type="number" min="1" placeholder="1" error={errors.quantityBought} />
          <Input label="Buying Price (₹)" name="buyingPrice" type="number" min="0" step="0.01" placeholder="0.00" error={errors.buyingPrice} />
          <Input label="Selling Price (₹)" name="sellingPrice" type="number" min="0" step="0.01" placeholder="0.00" error={errors.sellingPrice} />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Notes (optional)</label>
          <textarea
            name="notes"
            rows={2}
            placeholder="Any additional details..."
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition resize-none"
          />
        </div>

        {categories.length === 0 || vendors.length === 0 ? (
          <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
            {categories.length === 0 && <p>No categories yet — <a href="/categories" className="underline font-medium">add one first</a>.</p>}
            {vendors.length === 0 && <p>No vendors yet — <a href="/vendors" className="underline font-medium">add one first</a>.</p>}
          </div>
        ) : null}

        <Button type="submit" className="w-full" disabled={isPending || uploading}>
          {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Save Item"}
        </Button>
      </form>
    </Card>
  );
}
