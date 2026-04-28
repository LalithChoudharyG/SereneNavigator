export default function PlanPage() {
  return (
    <main id="main-content" className="bg-[#fef8f4] text-[#1d1b19]">
      <section className="mx-auto max-w-5xl px-6 py-12 sm:px-8 lg:px-8 lg:py-16">
        <div className="rounded-[2rem] bg-white p-6 shadow-[0_12px_32px_rgba(29,27,25,0.06)] sm:p-8">
          <span className="font-body inline-flex rounded-full bg-[#93e6fe]/30 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#00687b]">
            Trip planner
          </span>

          <h1 className="font-headline mt-5 text-4xl font-extrabold leading-tight tracking-[-0.03em] text-[#00505e] sm:text-5xl">
            Plan your trip with more confidence.
          </h1>

          <p className="font-body mt-4 max-w-2xl text-lg leading-8 text-[#3f484b]">
            The planner experience is coming soon. This page will guide users
            through destination selection, travel dates, and a trip-prep summary
            based on safety, health, emergency, and alert information.
          </p>
        </div>

        <section className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-[1.75rem] bg-white p-6 shadow-[0_12px_32px_rgba(29,27,25,0.06)]">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#ede7e3]">
              <span className="font-headline text-lg font-bold text-[#00505e]">
                1
              </span>
            </div>
            <h2 className="font-headline text-xl font-bold text-[#00505e]">
              Choose destinations
            </h2>
            <p className="font-body mt-3 text-sm leading-7 text-[#3f484b]">
              Search and select one or more destinations for your itinerary.
            </p>
          </div>

          <div className="rounded-[1.75rem] bg-white p-6 shadow-[0_12px_32px_rgba(29,27,25,0.06)]">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#ede7e3]">
              <span className="font-headline text-lg font-bold text-[#00505e]">
                2
              </span>
            </div>
            <h2 className="font-headline text-xl font-bold text-[#00505e]">
              Add travel details
            </h2>
            <p className="font-body mt-3 text-sm leading-7 text-[#3f484b]">
              Select dates and review trip timing against live alerts and
              destination guidance.
            </p>
          </div>

          <div className="rounded-[1.75rem] bg-white p-6 shadow-[0_12px_32px_rgba(29,27,25,0.06)]">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#ede7e3]">
              <span className="font-headline text-lg font-bold text-[#00505e]">
                3
              </span>
            </div>
            <h2 className="font-headline text-xl font-bold text-[#00505e]">
              Review summary
            </h2>
            <p className="font-body mt-3 text-sm leading-7 text-[#3f484b]">
              Get a destination-aware trip summary with safety, health,
              emergency, and planning reminders.
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-[1.75rem] bg-[#ede7e3] p-6 sm:p-8">
          <h2 className="font-headline text-2xl font-bold text-[#00505e]">
            What is coming next
          </h2>

          <ul className="font-body mt-4 space-y-3 text-sm leading-7 text-[#3f484b]">
            <li>• Multi-step planner flow</li>
            <li>• Date selection and validation</li>
            <li>• Destination-aware planning summary</li>
            <li>• Better trip-prep checklist experience</li>
          </ul>
        </section>
      </section>
    </main>
  );
}