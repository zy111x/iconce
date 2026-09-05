import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Icon Studio",
  description: "A clean personal icon studio for Lucide icons, emoji and text.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
