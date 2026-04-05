"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { updateItem, deleteItem } from "@/lib/actions/items";
import { compressImage } from "@/lib/compress";
import { Camera, X, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";

type Category = { id: string; name: string; itemType: string };
type Vendor = { id: string; name: string };
type Item = {
  id: string;
  name: string;
  categoryId: string;
  vendorId: string;
  purchaseDate: Date;
  quantityBought: number;
  buyingPrice: number;
  sellingPrice: number;
  photoUrl: string | null;
  notes: string | null;
};

export function ItemEditForm({ item, categories, vendors }: { item: Item; categories: Category[]; vendors: Vendor[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [photoUrl, setPhotoUrl] = useState<string | null>(item.photoUrl);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
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
    startTransition(async () => {
      await updateItem(item.id, {
        name: fd.get("name") as string,
        categoryId: fd.get("categoryId") as string,
        vendorId: fd.get("vendorId") as string,
        purchaseDate: fd.get("purchaseDate") as string,
        quantityBought: Number(fd.get("quantityBought")),
        buyingPrice: Number(fd.get("buyingPrice")),
        sellingPrice: Number(fd.get("sellingPrice")),
        photoUrl: photoUrl ?? undefined,
        notes: (fd.get("notes") as string) || undefined,
      });
      router.push(`/stock/${item.id}`);
    });
  }

  async function handleDelete() {
    startTransition(async () => {
      await deleteItem(item.id);
      router.push("/stock");
    });
  }

  const purchaseDateStr = item.purchaseDate.toISOString().split("T")[0];

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
                <button type="button" onClick={(e) => { e.stopPropagation(); setPhotoUrl(null); }} className="absolute top-2 right-2 bg-white rounded-full p-1 shadow">
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </>
            )}
            {!uploading && !photoUrl && (
              <div className="text-center">
                <Camera className="w-7 h-7 text-gray-300 mx-auto mb-1" />
                <p className="text-xs text-gray-400">Tap to change photo</p>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoChange} />
        </div>

        <Input label="Item Name" name="name" defaultValue={item.name} />

        <div className="grid grid-cols-2 gap-3">
          <Select label="Category" name="categoryId" defaultValue={item.categoryId}>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Select label="Vendor" name="vendorId" defaultValue={item.vendorId}>
            {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </Select>
        </div>

        <Input label="Purchase Date" name="purchaseDate" type="date" defaultValue={purchaseDateStr} />

        <div className="grid grid-cols-3 gap-3">
          <Input label="Quantity" name="quantityBought" type="number" min="1" defaultValue={item.quantityBought} />
          <Input label="Buying Price (₹)" name="buyingPrice" type="number" step="0.01" defaultValue={item.buyingPrice} />
          <Input label="Selling Price (₹)" name="sellingPrice" type="number" step="0.01" defaultValue={item.sellingPrice} />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Notes</label>
          <textarea name="notes" rows={2} defaultValue={item.notes ?? ""} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition resize-none" />
        </div>

        <Button type="submit" className="w-full" disabled={isPending || uploading}>
          {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Save Changes"}
        </Button>
      </form>

      <div className="mt-4 pt-4 border-t border-gray-100">
        {!confirmDelete ? (
          <button onClick={() => setConfirmDelete(true)} className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700">
            <Trash2 className="w-4 h-4" /> Delete this item
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <p className="text-sm text-red-600 font-medium">Delete permanently?</p>
            <Button variant="danger" onClick={handleDelete} disabled={isPending} className="text-xs py-1">Yes, Delete</Button>
            <Button variant="ghost" onClick={() => setConfirmDelete(false)} className="text-xs py-1">Cancel</Button>
          </div>
        )}
      </div>
    </Card>
  );
}
