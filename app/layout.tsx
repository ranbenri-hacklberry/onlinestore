import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-heebo",
});

export const metadata: Metadata = {
  title: "שפת המדבר | משתלה ועגלת קפה",
  description: "משתלה ועגלת קפה בלב גיתית. שפע פרחים, תבלינים, שיחים ועצים. בואו ליהנות מקפה מצוין באווירה מדברית קסומה.",
  metadataBase: new URL('https://store.hacklberryfinn.com'),
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
  openGraph: {
    title: "שפת המדבר | משתלה ועגלת קפה",
    description: "בואו ליהנות מקפה מצוין באווירה מדברית קסומה. מכירת צמחים ופרחים לבית ולגן.",
    url: '/nursery',
    siteName: 'שפת המדבר',
    images: [
      {
        url: '/og-image.png', // We copied logo.png here
        width: 800,
        height: 800,
        alt: 'לוגו שפת המדבר',
      },
    ],
    locale: 'he_IL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "שפת המדבר - משתלה בלב המדבר",
    description: "צמחים, קפה, ואווירה קסומה בגיתית.",
    images: ['/og-image.png'],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "application-name": "שפת המדבר",
    "apple-mobile-web-app-title": "שפת המדבר",
    "theme-color": "#7a8c6e",
    "msapplication-navbutton-color": "#7a8c6e",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "msapplication-starturl": "/nursery",
  }
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
