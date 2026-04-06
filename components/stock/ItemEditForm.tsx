"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { updateItem, deleteItem } from "@/lib/actions/items";
import { PhotoPicker } from "./PhotoPicker";
import { Loader2, Trash2 } from "lucide-react";

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
        <PhotoPicker
          photoUrl={photoUrl}
          uploading={uploading}
          uploadStatus={uploadStatus}
          onPhotoChange={setPhotoUrl}
          onClear={() => setPhotoUrl(null)}
          onUploadStart={(s) => { setUploading(true); setUploadStatus(s); }}
          onUploadEnd={() => { setUploading(false); setUploadStatus(""); }}
        />

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
