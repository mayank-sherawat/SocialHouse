import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import NextAuthSessionProvider from "./providers/SessionProvider";
import PWARegister from "@/components/PWARegister";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#FAF9F6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "SocialHouse — Minimal Photographic Archive",
  description: "Curated, minimal social salon to share photos, follow creators, and curate archival photography.",
  
  // Base URL for all relative paths
  metadataBase: new URL("https://www.socialhouse.online"),

  // Browser Tab & Mobile Icons
  icons: {
    icon: "/shh.png",
    shortcut: "/shh.png",
    apple: "/apple-touch-icon.png",
  },

  // PWA Manifest and Apple Mobile Settings
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SocialHouse",
  },

  // Open Graph
  openGraph: {
    title: "SocialHouse",
    description: "Share photos, follow creators, and enjoy a minimal, archival social experience.",
    url: "https://www.socialhouse.online",
    siteName: "SocialHouse",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "SocialHouse Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "SocialHouse",
    description: "Share photos, follow creators, and enjoy a minimal social experience.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`min-h-screen bg-[#FAF9F6] text-[#181716] ${inter.className}`}>
        <NextAuthSessionProvider>
          <ClientLayout>{children}</ClientLayout>
        </NextAuthSessionProvider>
        <PWARegister />
        <Analytics />
        <SpeedInsights />
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
