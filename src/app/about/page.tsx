export default function AboutPage() {
  return (
    <main id="main-content" className="bg-[#fef8f4] text-[#1d1b19]">
      <section className="mx-auto max-w-5xl px-6 py-12 sm:px-8 lg:px-8 lg:py-16">
        <h1 className="font-headline text-4xl font-extrabold text-[#16697a] sm:text-5xl">
          About Serene Navigator: A Travel Safety &amp; Health Advisor
        </h1>

        <p className="font-body mt-4 text-lg leading-8 text-[#3f484b]">
           Serene Navigator is a simple tool designed to help
          travelers quickly review important safety, health, cultural, and
          emergency information before visiting a destination.
        </p>

        <p className="font-body mt-3 leading-7 text-[#3f484b]">
          The goal is to bring essential travel preparation information into one
          place so users can make more informed decisions without searching
          across multiple websites.
        </p>

        <section className="mt-10 rounded-2xl bg-white p-6 shadow-[0_12px_32px_rgba(29,27,25,0.06)]">
          <h2 className="font-headline text-xl font-bold text-[#16697a]">
            How it works
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-[#ede7e3] p-4">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#16697a] text-sm font-bold text-white">
                1
              </div>
              <h3 className="font-headline mt-3 text-base font-bold text-[#16697a]">
                Search
              </h3>
              <p className="font-body mt-2 text-sm leading-6 text-[#3f484b]">
                Search for a destination using the homepage or navigation search
                bar.
              </p>
            </div>

            <div className="rounded-xl bg-[#ede7e3] p-4">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#16697a] text-sm font-bold text-white">
                2
              </div>
              <h3 className="font-headline mt-3 text-base font-bold text-[#16697a]">
                Review
              </h3>
              <p className="font-body mt-2 text-sm leading-6 text-[#3f484b]">
                Read destination-specific safety, health, culture, and emergency
                details in one place.
              </p>
            </div>

            <div className="rounded-xl bg-[#ede7e3] p-4">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#16697a] text-sm font-bold text-white">
                3
              </div>
              <h3 className="font-headline mt-3 text-base font-bold text-[#16697a]">
                Plan
              </h3>
              <p className="font-body mt-2 text-sm leading-6 text-[#3f484b]">
                Use the information to prepare more confidently before your trip
                and while traveling.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-2xl bg-white p-6 shadow-[0_12px_32px_rgba(29,27,25,0.06)]">
          <h2 className="font-headline text-xl font-bold text-[#16697a]">
            What you can find here
          </h2>

          <ul className="font-body mt-4 space-y-2 text-sm leading-6 text-[#3f484b]">
            <li>• Safety overview and travel advisory context</li>
            <li>• Health reminders such as vaccines and food/water precautions</li>
            <li>• Emergency numbers and essential response information</li>
            <li>• Cultural tips and practical travel guidance</li>
          </ul>
        </section>

        <section className="mt-8 rounded-2xl bg-white p-6 shadow-[0_12px_32px_rgba(29,27,25,0.06)]">
          <h2 className="font-headline text-xl font-bold text-[#16697a]">
            Important disclaimers
          </h2>

          <ul className="font-body mt-4 space-y-3 text-sm leading-6 text-[#3f484b]">
            <li>
              This tool provides general informational guidance only. It does
              not replace professional medical, legal, or governmental advice.
            </li>
            <li>
              Travel conditions can change quickly. Always verify critical
              information using official sources before traveling.
            </li>
            <li>
              In an emergency, contact local emergency services immediately.
            </li>
          </ul>
        </section>

        <section className="mt-8 rounded-2xl bg-white p-6 shadow-[0_12px_32px_rgba(29,27,25,0.06)]">
          <h2 className="font-headline text-xl font-bold text-[#16697a]">
            Data sources
          </h2>

          <p className="font-body mt-4 text-sm leading-6 text-[#3f484b]">
            Information may vary by destination and availability. When possible,
            the application references trusted public sources and caches some
            results to improve speed and reliability.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-[#ede7e3] p-4">
              <h3 className="font-headline text-base font-bold text-[#16697a]">
                Government travel guidance
              </h3>
              <ul className="font-body mt-3 space-y-2 text-sm leading-6 text-[#3f484b]">
                <li>
                  <a
                    href="https://travel.state.gov"
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-[#16697a] underline underline-offset-4"
                  >
                    travel.state.gov
                  </a>
                </li>
                <li>
                  <a
                    href="https://travel.gc.ca"
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-[#16697a] underline underline-offset-4"
                  >
                    travel.gc.ca
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.gov.uk/foreign-travel-advice"
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-[#16697a] underline underline-offset-4"
                  >
                    gov.uk/foreign-travel-advice
                  </a>
                </li>
              </ul>
            </div>

            <div className="rounded-xl bg-[#ede7e3] p-4">
              <h3 className="font-headline text-base font-bold text-[#16697a]">
                Supporting destination data
              </h3>
              <ul className="font-body mt-3 space-y-2 text-sm leading-6 text-[#3f484b]">
                <li>• Public emergency number sources</li>
                <li>• Country information datasets</li>
                <li>• Curated destination content during the MVP phase</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-2xl bg-white p-6 shadow-[0_12px_32px_rgba(29,27,25,0.06)]">
          <h2 className="font-headline text-xl font-bold text-[#16697a]">
            Updates and caching
          </h2>

          <p className="font-body mt-4 text-sm leading-6 text-[#3f484b]">
            To improve performance and reduce repeated calls to external
            services, some information may be cached temporarily. If an
            “Updated” date is shown on a page, use it as a reference point for
            when that information was last refreshed.
          </p>
        </section>

        <section className="mt-8 rounded-2xl bg-white p-6 shadow-[0_12px_32px_rgba(29,27,25,0.06)]">
          <h2 className="font-headline text-xl font-bold text-[#16697a]">
            Feedback
          </h2>

          <p className="font-body mt-4 text-sm leading-6 text-[#3f484b]">
            If you notice missing information or inaccurate destination details,
            those items can be tracked and improved in future updates of the
            application.
          </p>
        </section>
      </section>
    </main>
  );
}