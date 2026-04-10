import type { Metadata, Viewport } from "next";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const name = process.env.NEXT_PUBLIC_STORE_NAME ?? "Inventory";
  return {
    title: name,
    description: `Stock and sales management — ${name}`,
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: name,
    },
    formatDetection: { telephone: false },
  };
}

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
