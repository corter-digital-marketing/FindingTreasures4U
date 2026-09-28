import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart-provider";
import { SITE_URL } from "@/lib/site";
import { STORE_ADDRESS, STORE_EMAIL, STORE_PHONE } from "@/lib/store";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const TITLE = "Finding Treasures 4 U | Antiques, Uniques & Sought After Items";
const DESCRIPTION =
  "A curated online antiques shop offering authenticated furnishings, weathervanes, and collectables — carefully packed and shipped worldwide.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Every page already spells out its own full "X | Finding Treasures 4 U"
  // title (see /products, /products/[category], /product/[slug]) — a title
  // template here would double up the suffix on top of that, so this is
  // deliberately a plain string, used as-is only by pages with no title of
  // their own (namely the homepage).
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "Finding Treasures 4 U",
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

// LocalBusiness structured data — helps Google understand this is a real,
// physical antique shop (address, phone, hours) as well as an online store,
// which matters for local search and Google Maps results.
const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "AntiqueStore",
  name: "Finding Treasures 4 U",
  description: DESCRIPTION,
  url: SITE_URL,
  telephone: STORE_PHONE ?? undefined,
  email: STORE_EMAIL,
  address: {
    "@type": "PostalAddress",
    streetAddress: STORE_ADDRESS.split(",")[0],
    addressLocality: "Lock Haven",
    addressRegion: "PA",
    addressCountry: "US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-ivory text-charcoal font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
