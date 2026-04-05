"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, Users, Tag, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/stock", label: "Stock", icon: Package },
  { href: "/sell", label: "Sell", icon: ShoppingCart },
  { href: "/vendors", label: "Vendors", icon: Users },
  { href: "/categories", label: "Categories", icon: Tag },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around z-50 pb-safe">
      {nav.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center gap-0.5 py-2 px-2 text-xs transition-colors",
              active ? "text-indigo-600" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <Icon className="w-5 h-5" />
            {label}
          </Link>
        );
      })}
      <button
        onClick={handleLogout}
        className="flex flex-col items-center gap-0.5 py-2 px-2 text-xs text-gray-400 hover:text-red-500 transition-colors"
      >
        <LogOut className="w-5 h-5" />
        Logout
      </button>
    </nav>
  );
}
