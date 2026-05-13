"use client";

import { useEffect } from "react";

export default function ChildrenError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center">
      <h2 className="text-lg font-semibold text-red-900">Σφάλμα φόρτωσης</h2>
      <p className="mt-2 text-sm text-red-800">
        Προέκυψε πρόβλημα κατά την εμφάνιση της ενότητας «Παιδιά». Δοκιμάστε ξανά.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 rounded-lg bg-red-800 px-4 py-2 text-sm font-semibold text-white hover:bg-red-900"
      >
        Επανάληψη
      </button>
    </div>
  );
}
