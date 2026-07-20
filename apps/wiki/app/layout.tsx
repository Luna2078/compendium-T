import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

const tormenta = localFont({
  src: "./fonts/Tormenta20x.ttf",
  variable: "--font-tormenta",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "Compêndio de Arton — Tormenta 20",
  description: "Wiki de mesa de Tormenta 20: raças, regras e mais.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-br" className={`${tormenta.variable} h-full`}>
      <body className="min-h-full">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
