import type { } from "next";
import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import NextAuthSessionProvider from "./providers/SessionProvider";


export const metadata: Metadata = {
  title: "Social House",
  description: "SocialHouse — A minimal social app to share photos, follow friends, and explore content.",
  
  // Base URL for all relative paths (images, etc.)
  metadataBase: new URL("https://socialhouse-tau.vercel.app"),

  // 1. Browser Tab & Mobile Icons (Added this section)
  icons: {
    icon: "/shh.png",      // General favicon
    shortcut: "/shh.png",  // Shortcut icon
    apple: "/shh.png",     // iOS home screen icon
  },

  // 2. Open Graph (Facebook, LinkedIn, Discord)
  openGraph: {
    title: "SocialHouse",
    description: "Share photos, follow friends and enjoy a minimal social experience.",
    url: "https://socialhouse-tau.vercel.app",
    siteName: "SocialHouse",
    images: [
      {
        url: "/logo.png", // Resolves to https://socialhouse-tau.vercel.app/logo.png
        width: 1200,
        height: 630,
        alt: "SocialHouse Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  // 3. Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "SocialHouse",
    description: "Share photos, follow friends and enjoy a minimal social experience.",
    images: ["/logo.png"], // Resolves automatically via metadataBase
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <NextAuthSessionProvider>
          <ClientLayout>{children}</ClientLayout>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
