import Link from "next/link";
import DestinationSearch from "@/components/forms/DestinationSearch";
import { destinationOptions } from "@/data/destinationOptions";
import { destinations } from "@/lib/data";
import { getRecentAlerts } from "@/lib/alerts";

function severityStyles(severity: string) {
  if (severity === "CRITICAL") {
    return "bg-[#ffdad6] text-[#93000a]";
  }
  if (severity === "WARNING") {
    return "bg-[#ffddba] text-[#693f00]";
  }
  return "bg-[#93e6fe]/40 text-[#00687b]";
}

export default function HomePage() {
  const recentAlerts = getRecentAlerts(destinations, {
    limit: 3,
    activeOnly: true,
  });

  const heroAlert = recentAlerts[0];

  return (
    <main id="main-content" className="bg-[#fef8f4] text-[#1d1b19]">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#fef8f4] to-[#f9f2ee] px-6 pb-20 pt-10 sm:px-8 lg:px-8 lg:pb-24 lg:pt-12">
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
          <div className="z-10">
            <span className="font-body inline-flex rounded-full bg-[#93e6fe]/30 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#00687b]">
              Expert travel intelligence
            </span>

            <h1 className="font-headline mt-6 max-w-3xl text-5xl font-extrabold leading-[1.1] tracking-[-0.04em] text-[#00505e] sm:text-6xl lg:text-7xl">
              Trusted destination guidance for every traveler.
            </h1>

            <p className="font-body mt-8 max-w-xl text-lg leading-8 text-[#3f484b] sm:text-xl">
              Navigate the world with confidence. Search any destination for
              trusted safety, health, emergency, and cultural guidance in one
              calm, scan-first experience.
            </p>

            <div className="mt-10 max-w-xl">
              <DestinationSearch
                destinations={destinationOptions}
                placeholder="Search a destination..."
              />
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/destination"
                className="font-body inline-flex items-center justify-center rounded-xl bg-[#693f00] px-8 py-4 text-base font-bold text-white shadow-xl transition hover:scale-[1.01] hover:shadow-[#693f00]/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ffb865]/50 active:scale-[0.98]"
              >
                Browse Destinations
              </Link>

              <Link
                href="/plan"
                className="font-body inline-flex items-center justify-center rounded-xl bg-[#e7e1dd] px-8 py-4 text-base font-bold text-[#00505e] transition hover:bg-[#dfd9d5] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#489fb5]/40 active:scale-[0.98]"
              >
                Start Planning
              </Link>
            </div>

            <div className="font-body mt-10 flex items-center gap-4 text-sm font-medium text-[#6f797c]">
              <div className="flex -space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#fef8f4] bg-[#16697a] text-xs font-bold text-white">
                  A
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#fef8f4] bg-[#489fb5] text-xs font-bold text-white">
                  V
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#fef8f4] bg-[#82c0cc] text-xs font-bold text-[#00505e]">
                  T
                </div>
              </div>

              <p>
                {" "}
                <span className="font-bold text-[#00505e]">Loved</span>{" "}
                by travelers worldwide
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-square w-full max-w-146 rotate-3 overflow-hidden rounded-[2.5rem] border-6 border-white shadow-[0_30px_80px_rgba(29,27,25,0.18)] lg:ml-auto">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBimkREU8SG0KEAzqnAas2rv7scPEeA2kkT2BwkjHtZ-sAMhE1zSjtvSo14yp9sIFtdYy0vJ0dHz-KFzZq7L7yK6zHZLjAWfC6OxC0kdCNZ_e8dPIzNy7WbA-O40cq1aDHK0yF77eVn4jydgHTnXLwIptuK0NQRubzgWgM1juAD-y6SjQ_BILo3wgHVwq-GG2IZgajf74MXMxyrChW9nqvKMY53_0bjZ2C0sq9cxf1p816u6ghI-pPqPrvXd4LlZ3mpFQTbPfKI_623"
                alt="A vintage off-road vehicle driving through a desert landscape at sunset."
                className="h-full w-full object-cover"
              />
            </div>

            <div className="absolute -bottom-8 left-0 max-w-xs rounded-2xl bg-white p-6 shadow-[0_12px_32px_rgba(29,27,25,0.06)]">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ffdad6] text-[#ba1a1a]">
                  !
                </div>
                <span className="font-body font-bold text-[#00505e]">
                  {heroAlert
                    ? `Live Alert: ${heroAlert.destinationName ?? "Destination"}`
                    : "Live destination updates"}
                </span>
              </div>

              <p className="font-body text-sm leading-6 text-[#3f484b]">
                {heroAlert
                  ? heroAlert.description
                  : "Official travel advisories and destination guidance are surfaced here as they change."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#16697a]/10 bg-[#ede7e3] py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-6 md:flex-row sm:px-8 lg:px-8">
          <p className="font-body text-xs font-bold uppercase tracking-[0.2em] text-[#5b534d]">
            Verified data sources
          </p>

          <div className="font-headline flex flex-wrap items-center justify-center gap-8 text-lg font-extrabold italic text-[#3f484b] sm:gap-12">
            <span>WHO</span>
            <span>STATE DEPT</span>
            <span>RED CROSS</span>
            <span>CDC GLOBAL</span>
            <span>UNICEF</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 sm:px-8 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-8 shadow-[0_12px_32px_rgba(29,27,25,0.06)]">
            <div className="mb-6 h-10 w-10 rounded-full bg-[#93e6fe]/35" />
            <h2 className="font-headline text-xl font-bold text-[#00505e]">
              Health Protocol
            </h2>
            <p className="font-body mt-3 text-sm leading-7 text-[#3f484b]">
              Vaccination reminders, food and water precautions, and destination
              health guidance.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-[0_12px_32px_rgba(29,27,25,0.06)]">
            <div className="mb-6 h-10 w-10 rounded-full bg-[#16697a]/15" />
            <h2 className="font-headline text-xl font-bold text-[#00505e]">
              Safety Index
            </h2>
            <p className="font-body mt-3 text-sm leading-7 text-[#3f484b]">
              Advisory context, practical risk cues, and concise guidance for
              quick traveler decision-making.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-[0_12px_32px_rgba(29,27,25,0.06)]">
            <div className="mb-6 h-10 w-10 rounded-full bg-[#ffddba]" />
            <h2 className="font-headline text-xl font-bold text-[#00505e]">
              Emergency Support
            </h2>
            <p className="font-body mt-3 text-sm leading-7 text-[#3f484b]">
              Emergency numbers, embassy context, and local response essentials
              in one place.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-[0_12px_32px_rgba(29,27,25,0.06)]">
            <div className="mb-6 h-10 w-10 rounded-full bg-[#82c0cc]/35" />
            <h2 className="font-headline text-xl font-bold text-[#00505e]">
              Cultural Nuance
            </h2>
            <p className="font-body mt-3 text-sm leading-7 text-[#3f484b]">
              Respectful etiquette, transport, money, and communication notes
              for everyday travel.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#f9f2ee] px-6 py-24 sm:px-8 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-headline text-4xl font-extrabold text-[#00505e]">
                Critical Updates
              </h2>
              <p className="font-body mt-4 text-[#3f484b]">
                Recent alerts gathered from destination guidance and advisory
                monitoring.
              </p>
            </div>

            <Link
              href="/destination"
              className="font-body inline-flex items-center gap-2 text-sm font-bold text-[#00687b] transition hover:underline"
            >
              View all alerts <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {recentAlerts.length === 0 ? (
              <div className="rounded-2xl bg-white p-6 shadow-[0_12px_32px_rgba(29,27,25,0.06)] md:col-span-3">
                <p className="font-body text-sm leading-7 text-[#3f484b]">
                  No active alerts are available right now.
                </p>
              </div>
            ) : (
              recentAlerts.map((alert) => (
                <article
                  key={alert.id}
                  className="group rounded-2xl bg-white p-6 shadow-[0_12px_32px_rgba(29,27,25,0.06)]"
                >
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <span
                      className={`font-body rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${severityStyles(
                        alert.severity
                      )}`}
                    >
                      {alert.severity}
                    </span>

                    <span className="font-body text-xs font-medium text-[#6f797c]">
                      {alert.startDate ?? "Recent"}
                    </span>
                  </div>

                  <h3 className="font-headline text-lg font-bold text-[#1d1b19] transition group-hover:text-[#00505e]">
                    {alert.destinationName ? `${alert.destinationName}: ` : ""}
                    {alert.title}
                  </h3>

                  <p className="font-body mt-3 text-sm leading-7 text-[#3f484b]">
                    {alert.description}
                  </p>

                  <div className="mt-6 flex items-center justify-between border-t border-[#16697a]/10 pt-6">
                    <span className="font-body text-xs font-bold uppercase tracking-[0.14em] text-[#00505e]">
                      {alert.destinationName ?? "Destination"}
                    </span>

                    <Link
                      href={
                        alert.destinationSlug
                          ? `/destination/${encodeURIComponent(
                              alert.destinationSlug
                            )}`
                          : "/destination"
                      }
                      className="font-body text-xs font-bold text-[#6f797c] transition hover:text-[#00505e]"
                    >
                      Open
                    </Link>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 sm:px-8 lg:px-8">
        <div className="text-center">
          <h2 className="font-headline text-4xl font-extrabold text-[#00505e]">
            Your Path to Safe Travel
          </h2>
          <p className="font-body mx-auto mt-4 max-w-2xl text-[#3f484b]">
            Our editorial approach turns complex travel information into three
            simple, actionable steps.
          </p>
        </div>

        <div className="relative mt-20 grid gap-16 md:grid-cols-3">
          <div className="absolute left-0 top-10 -z-10 hidden h-px w-full bg-gradient-to-r from-transparent via-[#bfc8cb]/40 to-transparent lg:block" />

          <div className="text-center">
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-[#e7e1dd] shadow-lg">
              <span className="font-headline text-2xl font-bold text-[#00505e]">
                1
              </span>
            </div>
            <h3 className="font-headline text-xl font-bold text-[#00505e]">
              Search
            </h3>
            <p className="font-body mt-4 px-4 text-sm leading-7 text-[#3f484b]">
              Enter your destination to access safety, health, emergency, and
              cultural guidance.
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-[#e7e1dd] shadow-lg">
              <span className="font-headline text-2xl font-bold text-[#00505e]">
                2
              </span>
            </div>
            <h3 className="font-headline text-xl font-bold text-[#00505e]">
              Review
            </h3>
            <p className="font-body mt-4 px-4 text-sm leading-7 text-[#3f484b]">
              Compare travel alerts, risks, and destination-specific advice in a
              single place.
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-[#e7e1dd] shadow-lg">
              <span className="font-headline text-2xl font-bold text-[#00505e]">
                3
              </span>
            </div>
            <h3 className="font-headline text-xl font-bold text-[#00505e]">
              Plan
            </h3>
            <p className="font-body mt-4 px-4 text-sm leading-7 text-[#3f484b]">
              Use the information to prepare with more confidence before and
              during your trip.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 pb-24 sm:px-8 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-[#00505e] p-12 text-center sm:p-16">
          <div className="pointer-events-none absolute inset-0 opacity-10" />

          <h2 className="font-headline text-4xl font-bold leading-tight text-white sm:text-5xl">
            Ready to explore the world
            <br className="hidden md:block" /> with total peace of mind?
          </h2>

          <p className="font-body mx-auto mt-8 max-w-2xl text-lg leading-8 text-[#8ad1e4]">
            Join travelers who want clearer, calmer, and more trustworthy travel
            guidance before they go.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-6 sm:flex-row">
            <Link
              href="/destination"
              className="font-body inline-flex items-center justify-center rounded-xl bg-[#693f00] px-10 py-4 text-lg font-bold text-white shadow-2xl transition hover:bg-[#7d4a00]"
            >
              Get Started
            </Link>

            <Link
              href="/about"
              className="font-body inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-10 py-4 text-lg font-bold text-white backdrop-blur-md transition hover:bg-white/20"
            >
              About our sources
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}