import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "greek"],
  variable: "--font-geist-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Πλατφόρμα κέντρου",
  description: "Διαχείριση κλινικών και εκπαιδευτικών κέντρων (MVP)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="el" className={inter.variable}>
      <body className="min-h-screen font-sans">
        <div className="sticky top-0 z-50 border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm font-medium text-amber-950">
          Λειτουργία ανάπτυξης: η σύνδεση χρήστη είναι προσωρινά απενεργοποιημένη.
        </div>
        {children}
      </body>
    </html>
  );
}
