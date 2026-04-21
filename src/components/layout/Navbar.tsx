"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import DestinationSearch from "@/components/forms/DestinationSearch";
import { destinationOptions } from "@/data/destinationOptions";

const links = [
  { href: "/", label: "Home" },
  { href: "/destination", label: "Destinations" },
  { href: "/plan", label: "Plan" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-[#16697a]/10 bg-[#ede7e3]/80 shadow-sm backdrop-blur-xl">
      <a
        href="#main-content"
        className="font-body sr-only z-[60] rounded-md bg-white px-3 py-2 text-sm font-semibold text-[#16697a] focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#489fb5]/40"
      >
        Skip to main content
      </a>

      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-8">
          <Link
            href="/"
            className="font-headline shrink-0 text-2xl font-extrabold tracking-tight text-[#16697a] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#489fb5]/40"
          >
            Travel Advisor
          </Link>

          <div className="hidden items-center gap-7 md:flex">
            {links.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={[
                    "font-body border-b-2 pb-1 text-sm font-bold tracking-tight transition-colors",
                    active
                      ? "border-[#16697a] text-[#16697a]"
                      : "border-transparent text-[#6f797c] hover:text-[#16697a]",
                  ].join(" ")}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="hidden min-w-0 flex-1 items-center justify-end gap-4 lg:flex">
          <div className="w-full max-w-[19rem]">
            <DestinationSearch
              destinations={destinationOptions}
              placeholder="Search destinations..."
            />
          </div>

          <Link
            href="/about"
            className="font-body shrink-0 text-sm font-bold text-[#16697a] transition hover:text-[#489fb5] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#489fb5]/40"
          >
            Sources
          </Link>

          <Link
            href="/plan"
            className="font-body shrink-0 rounded-xl bg-[#16697a] px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#0f5a69] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#489fb5]/40 active:scale-[0.98]"
          >
            Start Planning
          </Link>
        </div>
      </nav>

      <div className="border-t border-[#16697a]/10 px-4 py-3 md:hidden">
        <div className="mx-auto flex max-w-7xl flex-col gap-3">
          <DestinationSearch
            destinations={destinationOptions}
            placeholder="Search destinations..."
          />

          <div className="flex flex-wrap gap-2">
            {links.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={[
                    "font-body rounded-full px-4 py-2 text-sm font-semibold transition",
                    active
                      ? "bg-white text-[#16697a] shadow-sm"
                      : "bg-[#f3ede9] text-[#3f484b]",
                  ].join(" ")}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}