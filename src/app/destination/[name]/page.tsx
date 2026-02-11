import { getDestinationBySlug } from "@/lib/data";

type PageProps = {
  params: Promise<{ name: string }>;
};

export default async function DestinationPage({ params }: PageProps) {
  const { name } = await params; // ✅ unwrap the params Promise
  const d = getDestinationBySlug(name);

  if (!d) return <main className="p-6">Destination not found.</main>;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">{d.name.toUpperCase()}</h1>

      <h2 className="mt-6 font-medium">Safety</h2>
      <p className="mt-1 text-sm opacity-80">
        {d.safety.advisoryLevel}: {d.safety.advisorySummary}
      </p>

      <h2 className="mt-6 font-medium">Health</h2>
      <p className="mt-1 text-sm opacity-80">Water safety: {d.health.waterSafety}</p>

      <h2 className="mt-6 font-medium">Emergency</h2>
      <ul className="mt-2 text-sm opacity-90">
        <li>Police: {d.emergency.police}</li>
        <li>Ambulance: {d.emergency.ambulance}</li>
        <li>Fire: {d.emergency.fire}</li>
      </ul>
    </main>
  );
}
