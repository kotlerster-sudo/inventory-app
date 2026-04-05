import { cn } from "@/lib/utils";

type Variant = "red" | "yellow" | "green" | "blue" | "gray" | "purple";

const variants: Record<Variant, string> = {
  red: "bg-red-100 text-red-700 border-red-200",
  yellow: "bg-yellow-100 text-yellow-700 border-yellow-200",
  green: "bg-green-100 text-green-700 border-green-200",
  blue: "bg-blue-100 text-blue-700 border-blue-200",
  gray: "bg-gray-100 text-gray-600 border-gray-200",
  purple: "bg-purple-100 text-purple-700 border-purple-200",
};

export function Badge({
  children,
  variant = "gray",
  className,
}: {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
