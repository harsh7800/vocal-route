import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import 'vocalroute-sdk/vocalroute.css';
import { VocalRouteProvider } from 'vocalroute-sdk';
import { Sidebar } from '../components/layout/Sidebar';
import { Topbar } from '../components/layout/Topbar';
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VocalRoute Admin",
  description: "Modern voice-activated SaaS dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <style>{`
          .material-symbols-outlined.font-variation-fill {
            font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          }
        `}</style>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#f7f7f7] dark:bg-[#191919] text-[#1a1a1a] dark:text-white transition-colors duration-200`}
      >
        <VocalRouteProvider
          overlayConfig={{ themeColor: 'cyan', title: 'How can I help?' }}
          showButton={true}
        >
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
              <Topbar />
              <div className="flex-1">
                {children}
              </div>
            </div>
          </div>
        </VocalRouteProvider>
      </body>
    </html>
  );
}
