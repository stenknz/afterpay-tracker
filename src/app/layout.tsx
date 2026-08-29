import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
const space = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});
const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["500", "700"],
});

export const metadata: Metadata = {
  title: "DueFlow",
  description: "Track your Afterpay and installment payments",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `(function(){try{var t=localStorage.getItem("theme")||"system";var r=t==="dark"||(t==="system"&&window.matchMedia("(prefers-color-scheme:dark)").matches);if(r)document.documentElement.classList.add("dark")}catch(e){}})()`,
        }} />
      </head>
      <body className={`${inter.variable} ${space.variable} ${mono.variable} font-sans antialiased bg-[#F6F7F9] dark:bg-transparent text-[#0F172A] dark:text-[#F1F5F9]`}>
        <div className="glow-orb glow-orb--1" />
        <div className="glow-orb glow-orb--2" />
        <div className="glow-orb glow-orb--3" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
