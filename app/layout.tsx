import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-heebo",
});

export const metadata: Metadata = {
  title: "iCaffeOS - CoffeeShops Operating System",
  description: "מערכת ניהול והזמנות מתקדמת לבתי קפה - הדגמת חנות אונליין",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body className={`${heebo.variable} font-heebo antialiased bg-white text-gray-900`}>
        {children}
      </body>
    </html>
  );
}
