import "../styles/tokens.css";
import "../styles/brand.css";
import "../styles/motion.css";
import "../styles/mobile-responsive.css";
import "./globals.css";
import type { Metadata, Viewport } from "next";
// import { Inter } from "next/font/google";
import { Providers } from "./providers";
import { getServerSession } from "next-auth";
import { authOptions } from "./(auth)/api/auth/[...nextauth]/auth.config";
import { FirebaseInitializer } from "@/src/components/firebase/FirebaseInitializer";
import { SafeArea } from "@/src/components/layout/SafeArea";
import { SkipNavigation } from "@/src/components/layout/SkipNavigation";

// const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'IntelliVerse X - Gaming & Ecommerce Platform',
  description: 'Experience gaming and online shopping with IntelliVerse X',
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
 
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>
      </head>
      <body className="font-sans">
        <SkipNavigation />
        <Providers session={session}>
          <FirebaseInitializer />
          <SafeArea as="main">{children}</SafeArea>
        </Providers>
      </body>
    </html>
  );
}
