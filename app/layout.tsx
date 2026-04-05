import type { Metadata } from "next";
import "./globals.css";
import { BottomNav } from "@/components/layout/BottomNav";

export const metadata: Metadata = {
  title: "Saree & Jewellery Inventory",
  description: "Inventory management for sarees and jewellery",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col pb-20 antialiased">
        <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-4">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
