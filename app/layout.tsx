import type { Metadata } from "next";
import { Geist, Geist_Mono, M_PLUS_2 } from "next/font/google";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { getI18n } from "@/lib/i18n/get-i18n";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const mPlus2 = M_PLUS_2({
  variable: "--font-mplus2",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vantage — Task Manager",
  description: "Modern project and task management",
  // Icons are provided via App Router file conventions:
  // app/favicon.ico, app/icon.png, app/apple-icon.png
  manifest: "/site.webmanifest",
  themeColor: "#08090d",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { locale } = await getI18n();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${mPlus2.variable} dark h-full antialiased`}
      data-accent="violet"
      data-density="comfortable"
      data-animations="on"
      data-theme="dark"
    >
      <body className="flex min-h-full flex-col bg-[color:var(--bg-base)] font-sans text-[color:var(--text-primary)]">
        <LocaleProvider locale={locale}>{children}</LocaleProvider>
      </body>
    </html>
  );
}
