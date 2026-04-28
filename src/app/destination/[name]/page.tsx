import { getDestinationBySlug } from "@/lib/data";
import { sortAlerts } from "@/lib/alerts";
import { getLiveAlertsBySlug } from "@/lib/server/liveAlerts";
import type { CountryProfile } from "@/lib/types";
import { EmergencyNumbersCard } from "@/components/destination/EmergencyNumbersCard";
import { getCountryProfileCached } from "@/lib/server/countryProfile";
import CulturalTipsAccordion from "@/components/destination/CulturalTipsAccordion";
import AlertsList from "@/components/alerts/AlertsList";

type PageProps = {
  params: { name: string } | Promise<{ name: string }>;
};

export default async function DestinationPage({ params }: PageProps) {
  const { name: slug } = await Promise.resolve(params);
  const d = getDestinationBySlug(slug);

  if (!d) {
    return (
      <main
        id="main-content"
        className="mx-auto max-w-5xl px-6 py-12 sm:px-8 lg:px-8"
      >
        <div className="rounded-[1.75rem] bg-white p-6 shadow-[0_12px_32px_rgba(29,27,25,0.06)]">
          <h1 className="font-headline text-2xl font-bold text-[#00505e]">
            Destination not found
          </h1>
          <p className="font-body mt-3 text-sm leading-7 text-[#3f484b]">
            We could not find a destination page for this route.
          </p>
        </div>
      </main>
    );
  }

  const profile = (await getCountryProfileCached(
    d.code,
    "us",
    true
  )) as CountryProfile | null;

  const liveAlerts = await getLiveAlertsBySlug(slug);
  const fallbackAlerts = sortAlerts(d.alerts ?? []);
  const alertsToShow = liveAlerts.length > 0 ? liveAlerts : fallbackAlerts;
  const usingLiveAlerts = liveAlerts.length > 0;

  return (
    <main
      id="main-content"
      className="bg-[#fef8f4] text-[#1d1b19]"
    >
      <section className="mx-auto max-w-5xl px-6 py-12 sm:px-8 lg:px-8 lg:py-16">
        <div className="rounded-[2rem] bg-white p-6 shadow-[0_12px_32px_rgba(29,27,25,0.06)] sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <span className="font-body inline-flex rounded-full bg-[#93e6fe]/30 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#00687b]">
                Destination guide
              </span>

              <h1 className="font-headline mt-5 text-4xl font-extrabold leading-tight tracking-[-0.03em] text-[#00505e] sm:text-5xl">
                {d.name}
              </h1>

              <p className="font-body mt-4 max-w-2xl text-base leading-7 text-[#3f484b]">
                Destination overview including safety, health, alerts,
                emergency, and cultural guidance.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="font-body inline-flex rounded-full bg-[#ede7e3] px-4 py-2 text-sm font-semibold text-[#00505e]">
                {d.code}
              </span>
              <span className="font-body inline-flex rounded-full bg-[#f3ede9] px-4 py-2 text-sm font-semibold text-[#3f484b]">
                {d.region}
              </span>
            </div>
          </div>
        </div>

        <section className="mt-8 rounded-[1.75rem] bg-white p-6 shadow-[0_12px_32px_rgba(29,27,25,0.06)] sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="font-headline text-2xl font-bold text-[#00505e]">
                Alerts
              </h2>
              <p className="font-body mt-2 text-sm leading-7 text-[#3f484b]">
                Recent or active destination notices.
              </p>
            </div>

            <span className="font-body inline-flex rounded-full bg-[#ede7e3] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#16697a]">
              {usingLiveAlerts ? "Live source" : "Local fallback"}
            </span>
          </div>

          {usingLiveAlerts && (
            <p className="font-body mt-4 text-xs leading-6 text-[#00505e]">
              Live alerts are pulled from official advisory pages when available.
            </p>
          )}

          <div className="mt-6">
            <AlertsList
              alerts={alertsToShow}
              emptyMessage={`No active or recent alerts for ${d.name}.`}
            />
          </div>
        </section>

        <section className="mt-8 rounded-[1.75rem] bg-white p-6 shadow-[0_12px_32px_rgba(29,27,25,0.06)] sm:p-8">
          <h2 className="font-headline text-2xl font-bold text-[#00505e]">
            Safety
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <span className="font-body inline-flex rounded-full bg-[#e7e1dd] px-4 py-2 text-sm font-semibold text-[#00505e]">
              {d.safety.advisoryLevel}
            </span>
          </div>

          <p className="font-body mt-4 text-sm leading-7 text-[#3f484b]">
            {d.safety.advisorySummary}
          </p>

          {profile?.advisory?.levelText && (
            <p className="font-body mt-4 text-sm leading-7 text-[#3f484b]">
              <span className="font-semibold text-[#00505e]">
                U.S. Advisory:
              </span>{" "}
              {profile.advisory.levelText}
            </p>
          )}

          {profile?.advisory?.dateUpdated && (
            <p className="font-body mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#00505e]">
              Updated: {profile.advisory.dateUpdated}
            </p>
          )}
        </section>

        <section className="mt-8 rounded-[1.75rem] bg-white p-6 shadow-[0_12px_32px_rgba(29,27,25,0.06)] sm:p-8">
          <h2 className="font-headline text-2xl font-bold text-[#00505e]">
            Health
          </h2>

          <p className="font-body mt-4 text-sm leading-7 text-[#3f484b]">
            Water safety:{" "}
            <span className="font-semibold text-[#00505e]">
              {d.health.waterSafety}
            </span>
          </p>
        </section>

        <section className="mt-8 rounded-[1.75rem] bg-white p-6 shadow-[0_12px_32px_rgba(29,27,25,0.06)] sm:p-8">
          <h2 className="font-headline text-2xl font-bold text-[#00505e]">
            Emergency
          </h2>

          <p className="font-body mt-3 text-sm leading-7 text-[#3f484b]">
            Local emergency support information and number reference.
          </p>

          <div className="mt-6">
            <EmergencyNumbersCard data={profile?.emergencyNumbers} />
          </div>
        </section>

        <section className="mt-8 rounded-[1.75rem] bg-white p-6 shadow-[0_12px_32px_rgba(29,27,25,0.06)] sm:p-8">
          <h2 className="font-headline text-2xl font-bold text-[#00505e]">
            Cultural
          </h2>

          <p className="font-body mt-3 text-sm leading-7 text-[#3f484b]">
            General tips to help you navigate norms and expectations.
          </p>

          <div className="mt-6">
            <CulturalTipsAccordion cultural={d.cultural} />
          </div>
        </section>
      </section>
    </main>
  );
}