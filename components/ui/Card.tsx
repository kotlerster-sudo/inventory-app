import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl shadow-sm border border-gray-100 p-4",
        className
      )}
    >
      {children}
    </div>
  );
}
