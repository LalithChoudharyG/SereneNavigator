"use client";

import DestinationSearch from "@/components/forms/DestinationSearch";
import { destinationOptions } from "@/data/destinationOptions";

export function Navbar() {
  return (
    <nav className="flex items-center gap-4">
      {/* ...logo + links... */}
      <div className="ml-auto w-[360px] max-w-full">
        <DestinationSearch destinations={destinationOptions} />
      </div>
    </nav>
  );
}