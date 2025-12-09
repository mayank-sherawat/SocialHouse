import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import NextAuthSessionProvider from "./providers/SessionProvider";

export const metadata: Metadata = {
  title:"Social house",
  description: "A social photo sharing app built with Next.js and Prisma",
  icons: {
    icon: "/shh.png"
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
