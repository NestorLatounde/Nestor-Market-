import type { Metadata } from "next";
import { Fraunces, Manrope, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { createClient } from "@/lib/supabase/server";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["500", "600", "700"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700", "800"],
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Nestor Market — le marché qui connecte ce que tu veux et ce que tu vends",
  description:
    "Publie une demande de service ou de produit, ou propose ce que tu sais faire. Nestor Market met en relation ceux qui cherchent et ceux qui proposent.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="fr">
      <body className={`${fraunces.variable} ${manrope.variable} ${plexMono.variable} bg-ink-900 text-hi font-body`}>
        <Header user={user} />
        <main>{children}</main>
        <footer className="border-t border-line py-10 mt-16">
          <div className="max-w-5xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 font-display font-bold text-lg">
              <span className="w-7 h-7 rounded-md bg-amber text-ink-900 flex items-center justify-center text-sm">N</span>
              Nestor Market
            </div>
            <div className="text-xs text-lo font-mono">© {new Date().getFullYear()} Nestor Market</div>
          </div>
        </footer>
      </body>
    </html>
  );
  }
