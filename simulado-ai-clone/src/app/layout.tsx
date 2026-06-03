import type { Metadata } from "next";
import Link from "next/link";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";
import HeaderNav from "@/components/HeaderNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SimuladoAI",
  description: "Gerador de simulados inteligentes focados em PDFs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${inter.className} min-h-screen bg-gray-50 text-gray-900 antialiased`}
      >
        <Providers>
          <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
              <Link
                href="/"
                className="text-xl font-bold tracking-tight text-blue-600 hover:text-blue-700"
              >
                SimuladoAI
              </Link>
              <HeaderNav />
            </div>
          </header>

          <main className="max-w-5xl mx-auto p-4 py-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
