import "./globals.css";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "Travel Safety & Health Advisor",
  description: "Travel safety, health, cultural, and emergency guidance by destination.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#ede7e3] text-[#2c2c2a]">
        <Navbar />
        {children}
        <footer className="border-t border-[#82c0cc] bg-[#ede7e3]">
          <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-[#16697a] sm:px-6 lg:px-8">
            © 2026 Travel Safety &amp; Health Advisor
          </div>
        </footer>
      </body>
    </html>
  );
}