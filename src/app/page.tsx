import Link from "next/link";
import DestinationSearch from "@/components/forms/DestinationSearch";
import { destinationOptions } from "@/data/destinationOptions";

export default function HomePage() {
  return (
    <main id="main-content" className="bg-[#ede7e3] text-[#2c2c2a]">
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="max-w-2xl">
            <div className="inline-flex rounded-full border border-[#82c0cc] bg-white px-4 py-1.5 text-sm font-semibold text-[#16697a]">
              Travel Safety &amp; Health Advisor
            </div>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-[#16697a] sm:text-5xl lg:text-6xl">
              Travel smarter with trusted destination guidance.
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-8 text-[#2c2c2a]">
              Search any destination to view safety guidance, health reminders,
              cultural tips, and emergency numbers in one place.
            </p>

            <p className="mt-3 max-w-xl text-sm leading-6 text-[#2c2c2a]">
              Uses official travel-advice sources where available. This tool is
              for general information only and does not replace medical, legal,
              or emergency advice.
            </p>

            <div className="mt-8 max-w-xl">
              <DestinationSearch
                destinations={destinationOptions}
                placeholder="Search a country (for example, Japan)"
              />
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/destination"
                className="inline-flex items-center justify-center rounded-md bg-[#16697a] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#489fb5]"
              >
                Browse destinations
              </Link>

              <Link
                href="/plan"
                className="inline-flex items-center justify-center rounded-md bg-[#ffa62b] px-5 py-3 text-sm font-semibold text-[#2c2c2a] shadow-sm transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#16697a]"
              >
                Start planning
              </Link>

              <Link
                href="/about"
                className="inline-flex items-center justify-center rounded-md border-2 border-[#16697a] bg-transparent px-5 py-3 text-sm font-semibold text-[#16697a] transition hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#489fb5]"
              >
                About our sources
              </Link>
            </div>
          </div>

          <aside className="rounded-2xl border border-[#82c0cc] bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-[#16697a]">
                  Why use this tool
                </p>
                <h2 className="mt-2 text-2xl font-bold text-[#16697a]">
                  One destination page, four key needs.
                </h2>
              </div>

              <span className="rounded-full bg-[#82c0cc] px-3 py-1 text-sm font-semibold text-[#16697a]">
                Trusted flow
              </span>
            </div>

            <div className="mt-6 grid gap-4">
              <div className="rounded-xl border border-[#82c0cc] bg-[#ede7e3] p-4">
                <h3 className="text-base font-bold text-[#16697a]">Safety</h3>
                <p className="mt-1 text-sm leading-6 text-[#2c2c2a]">
                  Review advisories, risks, and practical guidance before you go.
                </p>
              </div>

              <div className="rounded-xl border border-[#82c0cc] bg-[#ede7e3] p-4">
                <h3 className="text-base font-bold text-[#16697a]">Health</h3>
                <p className="mt-1 text-sm leading-6 text-[#2c2c2a]">
                  Check water safety, health reminders, and destination-specific concerns.
                </p>
              </div>

              <div className="rounded-xl border border-[#82c0cc] bg-[#ede7e3] p-4">
                <h3 className="text-base font-bold text-[#16697a]">Emergency</h3>
                <p className="mt-1 text-sm leading-6 text-[#2c2c2a]">
                  Find emergency numbers and essential support information quickly.
                </p>
              </div>

              <div className="rounded-xl border border-[#82c0cc] bg-[#ede7e3] p-4">
                <h3 className="text-base font-bold text-[#16697a]">Culture</h3>
                <p className="mt-1 text-sm leading-6 text-[#2c2c2a]">
                  Read destination-specific cultural guidance to travel more respectfully.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}