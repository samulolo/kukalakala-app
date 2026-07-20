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

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Kukalakala — Conecta talentos e oportunidades",
    template: "%s | Kukalakala",
  },
  description:
    "A plataforma que conecta candidatos e empresas, com análise de IA em cada candidatura. Encontra vagas ou publica a tua vaga e recruta os melhores talentos.",
  openGraph: {
    type: "website",
    locale: "pt_PT",
    siteName: "Kukalakala",
    title: "Kukalakala — Conecta talentos e oportunidades",
    description:
      "A plataforma que conecta candidatos e empresas, com análise de IA em cada candidatura. Encontra vagas ou publica a tua vaga e recruta os melhores talentos.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kukalakala — Conecta talentos e oportunidades",
    description:
      "A plataforma que conecta candidatos e empresas, com análise de IA em cada candidatura. Encontra vagas ou publica a tua vaga e recruta os melhores talentos.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
