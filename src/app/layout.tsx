import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
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
      <body className={`${inter.variable} font-sans antialiased bg-[#F5F5F7] dark:bg-[#1D1D1F] text-[#1D1D1F] dark:text-[#F5F5F7]`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
