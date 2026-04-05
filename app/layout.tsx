import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Saree & Jewellery Inventory",
  description: "Stock and sales management for sarees and jewellery",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Inventory",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="min-h-full antialiased">
        {children}
      </body>
    </html>
  );
}
