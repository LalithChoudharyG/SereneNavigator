import countries from "@/data/countries.json";
import type { CountryBase, CountryProfile } from "@/lib/types";
import { getRestCountryFacts } from "@/lib/providers/restCountries";
import { getUsAdvisory } from "@/lib/providers/usTravelAdvisory";
import { getEmergencyNumbers } from "@/lib/providers/emergencyNumbers";

export const runtime = "nodejs";

export async function GET(req: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params; // Next dynamic APIs are async :contentReference[oaicite:5]{index=5}
  const iso2 = code.toUpperCase();

  const base = (countries as any[]).find((x) => String(x.code).toUpperCase() === iso2) as CountryBase | undefined;
  if (!base) return Response.json({ error: "Unknown country code" }, { status: 404 });

  const url = new URL(req.url);
  const advisorySource = (url.searchParams.get("advisory") || "us").toLowerCase();

  const facts = await getRestCountryFacts(iso2);

  let advisory = undefined;
  if (advisorySource === "us") {
  try {
    advisory = await getUsAdvisory(base);
  } catch {
    advisory = await getUsAdvisory(base); // or just leave undefined
  }
  }


  const include = (url.searchParams.get("include") ?? "").split(",").map(s => s.trim().toLowerCase());
  const includeEmergency = include.includes("emergency") || include.includes("all");

  const emergencyNumbers =
  includeEmergency ? (await getEmergencyNumbers({ code: iso2, name: base.name })) ?? undefined : undefined;




  const out: CountryProfile = {
    code: iso2,
    name: base.name,
    facts: facts ?? undefined,
    advisory,
    emergencyNumbers,
  };

  return Response.json(out);
}
