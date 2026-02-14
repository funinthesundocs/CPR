import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme/theme-provider";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ConditionalFooter } from "@/components/layout/conditional-footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Court of Public Record — Digital Justice Platform",
  description:
    "A decentralized justice platform documenting verified fraud cases. Every testimony, receipt, and record becomes part of a living case file that no one can silence.",
  keywords: "justice, fraud documentation, victim testimonies, public record, transparency, accountability",
  openGraph: {
    title: "Court of Public Record — When the Courts Fall Silent, the Public Speaks",
    description:
      "A decentralized justice platform documenting verified fraud cases. Every testimony, receipt, and record becomes part of a living case file that no one can silence.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Court of Public Record — Digital Justice Platform",
    description:
      "When the courts fall silent, the public speaks. Verified fraud cases, permanent public records, collective accountability.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6366f1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <header className="flex h-14 items-center gap-2 border-b px-4">
                <SidebarTrigger className="-ml-2" />
              </header>
              <main className="flex-1 p-6">
                {children}
              </main>
              <ConditionalFooter />
            </SidebarInset>
          </SidebarProvider>
        </ThemeProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js')})}`
          }}
        />
      </body>
    </html>
  );
}
