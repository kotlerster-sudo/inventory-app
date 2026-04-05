"use client";

import { Download } from "lucide-react";

export function ExportButton() {
  return (
    <a
      href="/api/export/sales"
      className="flex items-center gap-1 text-sm text-indigo-600 font-medium hover:underline"
    >
      <Download className="w-4 h-4" /> Export
    </a>
  );
}
