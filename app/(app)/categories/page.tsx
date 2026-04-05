export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { TYPE_LABELS } from "@/lib/utils";
import Link from "next/link";
import { Package } from "lucide-react";
import { AddCategoryForm } from "@/components/categories/AddCategoryForm";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { items: true } } },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-xl font-bold text-gray-900">Categories</h1>
      </div>

      <AddCategoryForm />

      {categories.length === 0 ? (
        <EmptyState title="No categories yet" description="Add your first category above." />
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => (
            <Card key={cat.id} className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900 text-sm">{cat.name}</p>
                  <Badge variant={cat.itemType === "SAREE" ? "purple" : cat.itemType === "JEWELLERY" ? "yellow" : "gray"}>
                    {TYPE_LABELS[cat.itemType]}
                  </Badge>
                </div>
              </div>
              <Link
                href={`/stock?categoryId=${cat.id}`}
                className="flex items-center gap-1 text-xs text-indigo-600 font-medium hover:underline"
              >
                <Package className="w-3.5 h-3.5" />
                {cat._count.items} item{cat._count.items !== 1 ? "s" : ""}
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
