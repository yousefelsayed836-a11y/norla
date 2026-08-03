import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Norla Designs Admin",
    short_name: "Norla Admin",
    description: "Manage Norla Designs orders, products, and shipping.",
    start_url: "/admin",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#d14f83",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
