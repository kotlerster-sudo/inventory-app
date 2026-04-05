"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { createItem } from "@/lib/actions/items";
import { compressImage } from "@/lib/compress";
import { Camera, X, Loader2 } from "lucide-react";
import Image from "next/image";

type Category = { id: string; name: string; itemType: string };
type Vendor = { id: string; name: string };

export function StockForm({ categories, vendors }: { categories: Category[]; vendors: Vendor[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadStatus("Compressing…");
    try {
      const compressed = await compressImage(file, 200);
      const sizeKB = Math.round(compressed.size / 1024);
      setUploadStatus(`Uploading (${sizeKB} KB)…`);
      const fd = new FormData();
      fd.append("file", compressed);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) setPhotoUrl(data.url);
      setUploadStatus("");
    } catch {
      setUploadStatus("Failed to compress");
    } finally {
      setUploading(false);
    }
  }

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
        {/* Photo */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Photo</p>
          <div
            onClick={() => fileRef.current?.click()}
            className="cursor-pointer w-full h-36 rounded-xl border-2 border-dashed border-gray-200 hover:border-indigo-400 transition-colors flex items-center justify-center bg-gray-50 relative overflow-hidden"
          >
            {uploading && (
              <div className="flex flex-col items-center gap-1">
                <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                {uploadStatus && <p className="text-xs text-indigo-500">{uploadStatus}</p>}
              </div>
            )}
            {!uploading && photoUrl && (
              <>
                <Image src={photoUrl} alt="Product" fill className="object-cover" />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setPhotoUrl(null); }}
                  className="absolute top-2 right-2 bg-white rounded-full p-1 shadow"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </>
            )}
            {!uploading && !photoUrl && (
              <div className="text-center">
                <Camera className="w-7 h-7 text-gray-300 mx-auto mb-1" />
                <p className="text-xs text-gray-400">Tap to add photo</p>
              </div>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handlePhotoChange}
          />
        </div>

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
