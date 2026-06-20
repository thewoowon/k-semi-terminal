import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "K-Semi Terminal — Korean Semiconductor Cycle Intelligence",
  description:
    "Bloomberg-like terminal chaining global semiconductor cycle data, memory prices, AI/HBM demand, overseas bellwethers, and the Korean semiconductor value chain.",
  applicationName: "K-Semi Terminal",
};

export const viewport: Viewport = {
  themeColor: "#05070a",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="bg-base text-ink h-full">{children}</body>
    </html>
  );
}
