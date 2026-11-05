import type { Metadata } from "next";
import { Newsreader, Manrope } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
});

const description =
  "Quran (Qurani-Kərim), İncil, Tövrat və Tenqriçiliyi Azərbaycan dilində onlayn oxuyun. Surə və ayə üzrə axtarış, Matta, Mark, Luka və Yəhya İncilləri, Tövratın beş kitabı — Yaradılış, Çıxış, Levililər, Saylar və Təsniyə, həmçinin qədim türk-monqol Tenqriçilik inancı. İnternetsiz də oxumaq mümkündür.";

const keywords = [
  "Quran",
  "Qurani Kərim",
  "Quran azərbaycan dilində",
  "Quran tərcüməsi",
  "Quran oxu",
  "onlayn Quran",
  "surələr",
  "ayələr",
  "əl-Bəqərə surəsi",
  "Yasin surəsi",
  "İncil",
  "İncil azərbaycan dilində",
  "Yeni Əhd",
  "Matta İncili",
  "Mark İncili",
  "Luka İncili",
  "Yəhya İncili",
  "Tövrat",
  "Tövrat azərbaycan dilində",
  "Musanın beş kitabı",
  "Tora",
  "Yaradılış",
  "Çıxış",
  "Levililər",
  "Saylar",
  "Təsniyə",
  "Tenqriçilik",
  "Tenqrizm",
  "Tenqri",
  "Göy Tanrı",
  "qədim türk inancı",
  "Müqəddəs Dinlər və Kitablar",
  "dini kitablar",
  "Bibliya azərbaycan dilində",
];

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description,
  keywords,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "az_AZ",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="az"
      className={`${newsreader.variable} ${manrope.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          {children}
        </ThemeProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
