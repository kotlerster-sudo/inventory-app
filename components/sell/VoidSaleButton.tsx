"use client";

import { useTransition, useState } from "react";
import { voidSale } from "@/lib/actions/sales";
import { Button } from "@/components/ui/Button";

export function VoidSaleButton({ saleId }: { saleId: string }) {
  const [isPending, startTransition] = useTransition();
  const [confirm, setConfirm] = useState(false);

  if (!confirm) {
    return (
      <button
        onClick={() => setConfirm(true)}
        className="text-xs text-gray-400 hover:text-red-500 transition-colors"
      >
        Void
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="danger"
        className="text-xs py-0.5 px-2"
        disabled={isPending}
        onClick={() => startTransition(() => voidSale(saleId))}
      >
        Confirm
      </Button>
      <Button
        variant="ghost"
        className="text-xs py-0.5 px-2"
        onClick={() => setConfirm(false)}
      >
        Cancel
      </Button>
    </div>
  );
}
