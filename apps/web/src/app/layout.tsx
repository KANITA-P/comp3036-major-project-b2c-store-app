// import "@repo/ui/styles.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { cookies } from "next/headers";
import { ThemeProvider, type Theme } from "@/components/Themes/ThemeContext";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Threadline Clothing Store",
  description: "A B2C clothing store prototype built with Next.js and Prisma",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const serverCookies = await cookies();
  const cookieTheme = serverCookies.get("theme")?.value;
  const theme: Theme = cookieTheme === "dark" ? "dark" : "light";

  return (
    <html lang="en" data-theme={theme}>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeProvider initialTheme={theme}>{children}</ThemeProvider>
      </body>
    </html>
  );
}
