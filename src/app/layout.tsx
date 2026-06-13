import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Afterpay Tracker",
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
      <body className={`${geistSans.variable} font-sans antialiased bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
