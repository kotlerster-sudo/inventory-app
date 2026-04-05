export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export const LOW_STOCK_THRESHOLD = 3;

export const ITEM_TYPES = ["SAREE", "JEWELLERY", "OTHER"] as const;
export type ItemType = (typeof ITEM_TYPES)[number];

export const TYPE_LABELS: Record<string, string> = {
  SAREE: "Saree",
  JEWELLERY: "Jewellery",
  OTHER: "Other",
};
