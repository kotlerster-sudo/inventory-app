"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const variants: Record<Variant, string> = {
  primary: "bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800",
  secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300",
  danger: "bg-red-500 text-white hover:bg-red-600 active:bg-red-700",
  ghost: "text-gray-600 hover:bg-gray-100 active:bg-gray-200",
};

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
