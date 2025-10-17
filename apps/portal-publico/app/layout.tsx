import type { Metadata } from "next";
export const dynamic = 'force-dynamic';
import "./globals.css";
import { Analytics } from "@/components/shared/Analytics";
import { MetaPixel } from "@/components/shared/MetaPixel";
import { SiteHeader } from "@/components/layout/SiteHeader";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.sanremo.com.br";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "San Remo | Portal Público",
    template: "%s | San Remo"
  },
  description: "Explore empreendimentos imobiliários aprovados pela San Remo.",
  alternates: {
    canonical: "./"
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "San Remo"
  },
  openGraph: {
    type: "website",
    siteName: "San Remo",
    url: siteUrl,
    locale: "pt_BR",
    title: "San Remo | Portal Público",
    description: "Explore empreendimentos imobiliários aprovados pela San Remo."
  },
  twitter: {
    card: "summary_large_image",
    site: "@sanremo",
    creator: "@sanremo"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="theme-color" content="#001D38" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="icon" href="/san-remo-logo.png" />
        <link rel="apple-touch-icon" href="/san-remo-logo.png" />
      </head>
      <body className="bg-slate-50 text-primary-900">
        <Analytics />
        <MetaPixel />
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
