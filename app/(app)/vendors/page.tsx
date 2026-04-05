export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Package } from "lucide-react";
import { AddVendorForm } from "@/components/vendors/AddVendorForm";

export default async function VendorsPage() {
  const vendors = await prisma.vendor.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { items: true } } },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-xl font-bold text-gray-900">Vendors</h1>
      </div>

      <AddVendorForm />

      {vendors.length === 0 ? (
        <EmptyState title="No vendors yet" description="Add your first vendor above." />
      ) : (
        <div className="space-y-2">
          {vendors.map((vendor) => (
            <Card key={vendor.id} className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 text-sm">{vendor.name}</p>
                {vendor.phone && <p className="text-xs text-gray-500 mt-0.5">{vendor.phone}</p>}
                <p className="text-xs text-gray-400 mt-0.5">Added {formatDate(vendor.createdAt)}</p>
              </div>
              <Link
                href={`/stock?vendorId=${vendor.id}`}
                className="flex items-center gap-1 text-xs text-indigo-600 font-medium hover:underline"
              >
                <Package className="w-3.5 h-3.5" />
                {vendor._count.items} item{vendor._count.items !== 1 ? "s" : ""}
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
