import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vantage — Task Manager",
  description: "Modern project and task management",
  // Icons are provided via App Router file conventions:
  // app/favicon.ico, app/icon.png, app/apple-icon.png
  manifest: "/site.webmanifest",
  themeColor: "#08090d",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
      data-accent="violet"
      data-density="comfortable"
      data-animations="on"
      data-theme="dark"
    >
      <body className="flex min-h-full flex-col bg-[color:var(--bg-base)] text-[color:var(--text-primary)]">
        {children}
      </body>
    </html>
  );
}
