"use client";

import { useState, useTransition } from "react";
import { createCategory } from "@/lib/actions/categories";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Plus, Loader2 } from "lucide-react";
import { ITEM_TYPES, TYPE_LABELS } from "@/lib/utils";

export function AddCategoryForm() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = (fd.get("name") as string).trim();
    const itemType = fd.get("itemType") as string;
    if (!name) return;
    startTransition(async () => {
      await createCategory({ name, itemType });
      setOpen(false);
      (e.target as HTMLFormElement).reset();
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 w-full border-2 border-dashed border-gray-200 rounded-xl p-3 text-sm text-gray-400 hover:border-indigo-400 hover:text-indigo-500 transition-colors"
      >
        <Plus className="w-4 h-4" /> Add Category
      </button>
    );
  }

  return (
    <Card>
      <p className="text-sm font-semibold text-gray-700 mb-3">New Category</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input name="name" placeholder="e.g. Kanjivaram Silk Saree" required />
        <Select name="itemType" defaultValue="SAREE">
          {ITEM_TYPES.map((t) => (
            <option key={t} value={t}>{TYPE_LABELS[t]}</option>
          ))}
        </Select>
        <div className="flex gap-2">
          <Button type="submit" disabled={isPending} className="flex-1">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
