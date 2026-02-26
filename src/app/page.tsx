import DestinationSearch from "@/components/forms/DestinationSearch";
import { destinationOptions } from "@/data/destinationOptions";

export default function HomePage() {
  return (
    <main>
      <section className="py-12">
        <h1 className="text-3xl font-semibold">Travel Safely & Informed</h1>
        <p className="mt-2 opacity-80">
          Search a destination to view safety, health, and emergency info.
        </p>

        <div className="mt-6 max-w-xl">
          <DestinationSearch
            destinations={destinationOptions}
            placeholder="Enter a country or city…"
          />
        </div>
      </section>
    </main>
  );
}