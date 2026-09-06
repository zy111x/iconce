import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Icon Studio",
  description: "A lightweight personal icon studio for Lucide icons, emoji, text and SVG.",
  applicationName: "Icon Studio",
  icons: {
    icon: "/favicon.ico",
  },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
