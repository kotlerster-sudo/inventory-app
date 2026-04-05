import { cn } from "@/lib/utils";
import { InputHTMLAttributes } from "react";

export function Input({
  label,
  error,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <input
        className={cn(
          "w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition",
          error && "border-red-400 focus:ring-red-400",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
