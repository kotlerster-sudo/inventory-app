"use client";

import { useState, useTransition } from "react";
import { createVendor } from "@/lib/actions/vendors";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Plus, Loader2 } from "lucide-react";

export function AddVendorForm() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = (fd.get("name") as string).trim();
    const phone = (fd.get("phone") as string).trim();
    if (!name) return;
    startTransition(async () => {
      await createVendor({ name, phone: phone || undefined });
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
        <Plus className="w-4 h-4" /> Add Vendor
      </button>
    );
  }

  return (
    <Card>
      <p className="text-sm font-semibold text-gray-700 mb-3">New Vendor</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input name="name" placeholder="Vendor name" required />
        <Input name="phone" placeholder="Phone (optional)" type="tel" />
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
