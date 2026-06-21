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

const BASE_URL = "https://k-semi.app";

export const metadata: Metadata = {
  title: "K-Semi Terminal — Korean Semiconductor Cycle Intelligence",
  description:
    "Bloomberg-like terminal chaining global semiconductor cycle data, memory prices, AI/HBM demand, overseas bellwethers, and the Korean semiconductor value chain.",
  applicationName: "K-Semi Terminal",
  metadataBase: new URL(BASE_URL),
  openGraph: {
    type: "website",
    url: BASE_URL,
    siteName: "K-Semi Terminal",
    title: "K-Semi Terminal — Korean Semiconductor Cycle Intelligence",
    description:
      "Bloomberg-like terminal chaining global semiconductor cycle data, memory prices, AI/HBM demand, overseas bellwethers, and the Korean semiconductor value chain.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "K-Semi Terminal OG Image",
      },
    ],
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "K-Semi Terminal — Korean Semiconductor Cycle Intelligence",
    description:
      "Bloomberg-like terminal chaining global semiconductor cycle data, memory prices, AI/HBM demand, overseas bellwethers, and the Korean semiconductor value chain.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
  other: {
    "naver-site-verification": "87d7f72795939aa8539acb4c89dc686d545b99fe",
  },
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
