"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-sm opacity-80">
        {error.message || "An unexpected error occurred."}
      </p>
      <button
        className="mt-4 rounded-md border px-4 py-2 text-sm"
        onClick={reset}
      >
        Try again
      </button>
    </main>
  );
}
