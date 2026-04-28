"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main id="main-content" className="bg-[#fef8f4] text-[#1d1b19]">
      <section className="mx-auto max-w-4xl px-6 py-12 sm:px-8 lg:px-8 lg:py-16">
        <div className="rounded-4xl bg-white p-6 shadow-[0_12px_32px_rgba(29,27,25,0.06)] sm:p-8">
          <span className="font-body inline-flex rounded-full bg-[#ffdad6] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#93000a]">
            Error
          </span>

          <h1 className="font-headline mt-5 text-4xl font-extrabold leading-tight tracking-[-0.03em] text-[#00505e] sm:text-5xl">
            Something went wrong
          </h1>

          <p className="font-body mt-4 max-w-2xl text-base leading-7 text-[#3f484b]">
            {error.message || "An unexpected error occurred."}
          </p>

          <div className="mt-8">
            <button
              type="button"
              onClick={reset}
              className="font-body inline-flex items-center justify-center rounded-xl bg-[#16697a] px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#0f5a69] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#489fb5]/40 active:scale-[0.98]"
            >
              Try again
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}