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
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-[#82c0cc] bg-white p-6 text-[#2c2c2a]">
          Destination not found.
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
      className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8"
    >
      <div className="rounded-2xl border border-[#82c0cc] bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-extrabold text-[#16697a]">{d.name}</h1>
        <p className="mt-3 text-sm leading-6 text-[#2c2c2a]">
          Destination overview including safety, health, alerts, emergency, and
          cultural guidance.
        </p>
      </div>

      <section className="mt-8 rounded-2xl border border-[#82c0cc] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#16697a]">Alerts</h2>
            <p className="mt-2 text-sm leading-6 text-[#2c2c2a]">
              Recent or active destination notices.
            </p>
          </div>

          <span className="inline-flex rounded-full border border-[#82c0cc] bg-[#ede7e3] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#16697a]">
            {usingLiveAlerts ? "Live source" : "Local fallback"}
          </span>
        </div>

        {usingLiveAlerts && (
          <p className="mt-3 text-xs leading-5 text-[#16697a]">
            Live alerts are pulled from official advisory pages when available.
          </p>
        )}

        <div className="mt-5">
          <AlertsList
            alerts={alertsToShow}
            emptyMessage={`No active or recent alerts for ${d.name}.`}
          />
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-[#82c0cc] bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-[#16697a]">Safety</h2>
        <p className="mt-3 text-sm leading-6 text-[#2c2c2a]">
          {d.safety.advisoryLevel}: {d.safety.advisorySummary}
        </p>

        {profile?.advisory?.levelText && (
          <p className="mt-3 text-sm leading-6 text-[#2c2c2a]">
            U.S. Advisory: {profile.advisory.levelText}
          </p>
        )}

        {profile?.advisory?.dateUpdated && (
          <p className="mt-2 text-xs font-medium text-[#16697a]">
            Updated: {profile.advisory.dateUpdated}
          </p>
        )}
      </section>

      <section className="mt-8 rounded-2xl border border-[#82c0cc] bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-[#16697a]">Health</h2>
        <p className="mt-3 text-sm leading-6 text-[#2c2c2a]">
          Water safety: {d.health.waterSafety}
        </p>
      </section>

      <section className="mt-8 rounded-2xl border border-[#82c0cc] bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-[#16697a]">Emergency</h2>
        <div className="mt-4">
          <EmergencyNumbersCard data={profile?.emergencyNumbers} />
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-[#82c0cc] bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-[#16697a]">Cultural</h2>
        <p className="mt-2 text-sm leading-6 text-[#2c2c2a]">
          General tips to help you navigate norms and expectations.
        </p>

        <div className="mt-5">
          <CulturalTipsAccordion cultural={d.cultural} />
        </div>
      </section>
    </main>
  );
}