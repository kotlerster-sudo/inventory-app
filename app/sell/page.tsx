import { SellForm } from "@/components/sell/SellForm";
import Link from "next/link";
import { History } from "lucide-react";

export default async function SellPage({
  searchParams,
}: {
  searchParams: Promise<{ itemId?: string }>;
}) {
  const { itemId } = await searchParams;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-xl font-bold text-gray-900">Record Sale</h1>
        <Link
          href="/sell/history"
          className="flex items-center gap-1 text-sm text-indigo-600 font-medium hover:underline"
        >
          <History className="w-4 h-4" /> History
        </Link>
      </div>
      <SellForm preselectedItemId={itemId} />
    </div>
  );
}
