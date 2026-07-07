import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "КОРЯЖЕМСКИЕ ОЛИМПИЙСКИЕ ИГРЫ 2026",
  description:
    "Турнир для настоящих мутантов. Токсичная зона. Выживают сильнейшие.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen scanline-overlay">{children}</body>
    </html>
  );
}
