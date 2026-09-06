import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Icon Studio",
    short_name: "Icon Studio",
    description: "A lightweight personal icon studio for Lucide icons, emoji, text and SVG.",
    start_url: "/",
    display: "standalone",
    background_color: "#1d2022",
    theme_color: "#1f2023",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
