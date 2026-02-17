import countries from "@/data/countries.json";

export const runtime = "nodejs";

export async function GET(_: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params; // Next dynamic APIs are async :contentReference[oaicite:4]{index=4}
  const iso2 = code.toUpperCase();

  const c = (countries as any[]).find((x) => String(x.code).toUpperCase() === iso2);
  if (!c) return Response.json({ error: "Unknown country code" }, { status: 404 });

  return Response.json(c);
}
