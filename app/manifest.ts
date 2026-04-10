import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  const name = process.env.NEXT_PUBLIC_STORE_NAME ?? "Inventory";
  const short = name.split(" ")[0];
  return {
    name,
    short_name: short,
    description: `Stock and sales management — ${name}`,
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f9fafb",
    theme_color: "#4f46e5",
    orientation: "portrait",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
    categories: ["business", "productivity"],
    shortcuts: [
      {
        name: "Record Sale",
        short_name: "Sell",
        url: "/sell",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Add Stock",
        short_name: "Add Stock",
        url: "/stock/new",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
