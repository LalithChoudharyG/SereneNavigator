"use client";

import Link from "next/link";
import DestinationSearch from "@/components/forms/DestinationSearch";
import { destinationOptions } from "@/data/destinationOptions";

const navLink =
  "rounded-md px-3 py-2 text-sm font-semibold text-[#16697a] transition hover:bg-white hover:text-[#16697a] " +
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#489fb5]";

export function Navbar() {
  return (
    <header className="border-b border-[#82c0cc] bg-[#ede7e3]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 z-50 rounded-md bg-white px-3 py-2 text-sm font-semibold text-[#16697a] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#489fb5]"
      >
        Skip to main content
      </a>

      <nav className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-6">
            <Link
              href="/"
              className="text-xl font-extrabold tracking-tight text-[#16697a] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#489fb5]"
            >
              Travel Advisor
            </Link>

            <div className="flex flex-wrap gap-1">
              <Link href="/" className={navLink}>
                Home
              </Link>
              <Link href="/destination" className={navLink}>
                Destination
              </Link>
              <Link href="/plan" className={navLink}>
                Plan
              </Link>
              <Link href="/about" className={navLink}>
                About
              </Link>
            </div>
          </div>

          <div className="w-full lg:max-w-md">
            <DestinationSearch
              destinations={destinationOptions}
              placeholder="Search destinations..."
            />
          </div>
        </div>
      </nav>
    </header>
  );
}