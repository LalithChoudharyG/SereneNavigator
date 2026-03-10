import { getDestinationBySlug } from "@/lib/data";
import type { CountryProfile } from "@/lib/types";
import { EmergencyNumbersCard } from "@/components/destination/EmergencyNumbersCard";
import { getCountryProfileCached } from "@/lib/server/countryProfile";
import CulturalTipsAccordion from "@/components/destination/CulturalTipsAccordion";

type PageProps = {
   params: { name: string } | Promise<{ name: string }> 
};

export default async function DestinationPage({ params }: PageProps) {
  const { name } = await Promise.resolve(params);
  const slug = name;
  const d = getDestinationBySlug(name);

  if (!d) return <main className="p-6">Destination not found.</main>;

  // ✅ No internal HTTP call — direct server function call (cached + revalidate=3600)
  const profile = (await getCountryProfileCached(d.code, "us", true)) as CountryProfile | null;

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">{d.name.toUpperCase()}</h1>

      <section>
        <h2 className="mt-6 font-medium">Safety</h2>
        <p className="mt-1 text-sm opacity-80">
          {d.safety.advisoryLevel}: {d.safety.advisorySummary}
        </p>

        {profile?.advisory?.levelText && (
          <p className="mt-2 text-sm opacity-80">
            US Advisory: {profile.advisory.levelText}
          </p>
        )}
        {profile?.advisory?.dateUpdated && (
          <p className="mt-1 text-xs opacity-60">Updated: {profile.advisory.dateUpdated}</p>
        )}
      </section>

      <section>
        <h2 className="mt-6 font-medium">Health</h2>
        <p className="mt-1 text-sm opacity-80">Water safety: {d.health.waterSafety}</p>
      </section>

      <section>
        <h2 className="mt-6 font-medium">Emergency</h2>
        <div className="mt-3">
          <EmergencyNumbersCard data={profile?.emergencyNumbers} />
        </div>
      </section>

      <section>
        <h2 className="mt-6 font-medium">Cultural</h2>
        <p className="mt-1 text-sm opacity-80">
          General tips to help you navigate norms and expectations.
        </p> <CulturalTipsAccordion cultural={d.cultural} />
      </section>  
      
    </main>
  );
}