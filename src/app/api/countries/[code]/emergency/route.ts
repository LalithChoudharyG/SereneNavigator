import countries from "@/data/countries.json";
import { getEmergencyNumbers } from "@/lib/providers/emergencyNumbers";

export const runtime = "nodejs";

export async function GET(_: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const iso2 = code.toUpperCase();

  const c = (countries as any[]).find((x) => String(x.code).toUpperCase() === iso2);
  if (!c) return Response.json({ error: "Unknown country code" }, { status: 404 });

  const data = await getEmergencyNumbers({ code: iso2, name: c.name });
  if (!data) return Response.json({ error: "No emergency numbers found" }, { status: 404 });

  return Response.json(data);
}
