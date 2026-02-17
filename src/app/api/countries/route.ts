import countries from "@/data/countries.json";

export const runtime = "nodejs";

export async function GET() {
  return Response.json(countries);
}
