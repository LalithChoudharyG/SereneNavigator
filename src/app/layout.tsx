import "./globals.css";
import type { Metadata } from "next";
import { Manrope, Plus_Jakarta_Sans } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-headline",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Travel Safety & Health Advisor",
  description:
    "Travel safety, health, cultural, and emergency guidance by destination.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${manrope.variable} ${jakarta.variable} min-h-screen bg-[#fef8f4] text-[#1d1b19] antialiased`}
      >
        <Navbar />
        {children}

        <footer className="border-t border-[#16697a]/10 bg-[#ede7e3] px-6 py-16 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
              <div>
                <span className="block font-[var(--font-headline)] text-2xl font-extrabold tracking-tight text-[#16697a]">
                  Travel Advisor
                </span>
                <p className="mt-5 max-w-xs font-[var(--font-body)] text-sm leading-7 text-[#3f484b]">
                  Authoritative travel safety, health, emergency, and cultural
                  guidance for modern travelers.
                </p>
              </div>

              <div>
                <h2 className="font-[var(--font-body)] text-xs font-bold uppercase tracking-[0.18em] text-[#16697a]">
                  Product
                </h2>
                <ul className="mt-6 space-y-4 font-[var(--font-body)] text-sm text-[#3f484b]">
                  <li>
                    <a className="transition hover:text-[#16697a]" href="/destination">
                      Destinations
                    </a>
                  </li>
                  <li>
                    <a className="transition hover:text-[#16697a]" href="/plan">
                      Trip Planner
                    </a>
                  </li>
                  <li>
                    <a className="transition hover:text-[#16697a]" href="/about">
                      Data Sources
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="font-[var(--font-body)] text-xs font-bold uppercase tracking-[0.18em] text-[#16697a]">
                  Guidance
                </h2>
                <ul className="mt-6 space-y-4 font-[var(--font-body)] text-sm text-[#3f484b]">
                  <li>Safety brief</li>
                  <li>Health precautions</li>
                  <li>Emergency info wallet</li>
                  <li>Cultural tips</li>
                </ul>
              </div>

              <div>
                <h2 className="font-[var(--font-body)] text-xs font-bold uppercase tracking-[0.18em] text-[#16697a]">
                  Support
                </h2>
                <ul className="mt-6 space-y-4 font-[var(--font-body)] text-sm text-[#3f484b]">
                  <li>
                    <a className="transition hover:text-[#16697a]" href="/about">
                      About
                    </a>
                  </li>
                  <li>
                    <a
                      className="transition hover:text-[#16697a]"
                      href="mailto:hello@traveladvisor.local"
                    >
                      Contact
                    </a>
                  </li>
                  <li>Accessibility</li>
                  <li>Privacy</li>
                </ul>
              </div>
            </div>

            <div className="mt-14 border-t border-[#16697a]/10 pt-8">
              <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                <div className="flex flex-wrap items-center justify-center gap-6 font-[var(--font-body)] text-[11px] font-bold uppercase tracking-[0.18em] text-[#6f797c]">
                  <span>Sitemap</span>
                  <span>Legal</span>
                  <span>Privacy Policy</span>
                  <span>Contact</span>
                </div>

                <p className="font-[var(--font-body)] text-[11px] font-bold uppercase tracking-[0.18em] text-[#6f797c]">
                  © 2026 Travel Safety &amp; Health Advisor
                </p>
              </div>

              <p className="mx-auto mt-6 max-w-4xl text-center font-[var(--font-body)] text-[11px] leading-6 text-[#6f797c]">
                This application provides general informational guidance only and
                does not replace medical, legal, or official government advice.
                Always verify critical information through official sources before
                travel.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}