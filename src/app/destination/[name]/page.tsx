import { getDestinationBySlug } from "@/lib/data";
import type { CountryProfile } from "@/lib/types";
import { EmergencyNumbersCard } from "@/components/destination/EmergencyNumbersCard";

type PageProps = {
  params: Promise<{ name: string }>;
};

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export default async function DestinationPage({ params }: PageProps) {
  const { name } = await params;
  const d = getDestinationBySlug(name);

  if (!d) return <main className="p-6">Destination not found.</main>;

  // ✅ One API call for advisory + emergency (facts too if you want them later)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL!;
  const res = await fetch(
    `${baseUrl}/api/countries/${d.code}/profile?advisory=us&include=emergency`,
    { next: { revalidate: 3600 } }
  );

  const profile = (await res.json()) as CountryProfile;

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">{d.name.toUpperCase()}</h1>

      <section>
        <h2 className="mt-6 font-medium">Safety</h2>
        <p className="mt-1 text-sm opacity-80">
          {d.safety.advisoryLevel}: {d.safety.advisorySummary}
        </p>

        {/* Optional: show US advisory data too (from /profile) */}
        {profile.advisory?.levelText && (
          <p className="mt-2 text-sm opacity-80">
            US Advisory: {profile.advisory.levelText}
          </p>
        )}
        {profile.advisory?.dateUpdated && (
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
          <EmergencyNumbersCard data={profile.emergencyNumbers} />
        </div>
      </section>
    </main>
  );
}
