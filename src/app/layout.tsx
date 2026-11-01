import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FanPulse AI — Beyond the Score. Understand the Game.",
  description:
    "Beyond the Score. Understand the Game. Tactical, momentum, and context intelligence for Premier League fans.",
  openGraph: {
    title: "FanPulse AI — Beyond the Score. Understand the Game.",
    description:
      "Beyond the Score. Understand the Game. Tactical, momentum, and context intelligence for Premier League fans.",
    siteName: "FanPulse AI",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} dark h-full antialiased font-poppins`}>
      <body className="min-h-full bg-brand-bg text-brand-text flex flex-col font-poppins">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
