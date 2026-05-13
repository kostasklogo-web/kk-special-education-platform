"use client";

import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";

type LoginFormProps = {
  nextPath?: string;
};

export function LoginForm({ nextPath: _nextPath }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  function validate(): string | null {
    const emailValue = email.trim();
    if (!emailValue) return "Το email είναι υποχρεωτικό.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      return "Το email δεν είναι έγκυρο.";
    }
    if (!password) return "Ο κωδικός πρόσβασης είναι υποχρεωτικός.";
    if (password.length < 6) return "Ο κωδικός πρόσβασης πρέπει να έχει τουλάχιστον 6 χαρακτήρες.";
    return null;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);

    if (signInError) {
      setError("Δεν ήταν δυνατή η σύνδεση. Ελέγξτε email και κωδικό πρόσβασης.");
      return;
    }

    try {
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Η σύνδεση ολοκληρώθηκε, αλλά η μετάβαση στον πίνακα δεν ήταν δυνατή.");
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-surface-card p-8 shadow-shell">
      <h1 className="text-xl font-semibold text-ink">Σύνδεση</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Εισέλθετε με τα στοιχεία του λογαριασμού σας. Η επικοινωνία είναι κρυπτογραφημένη.
      </p>
      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-xs font-medium text-ink-muted">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-ink shadow-sm outline-none ring-clinical-500 focus:ring-2"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-xs font-medium text-ink-muted">
            Κωδικός πρόσβασης
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-ink shadow-sm outline-none ring-clinical-500 focus:ring-2"
          />
        </div>
        {error ? (
          <p className="text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-lg bg-clinical-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-clinical-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Σύνδεση…" : "Σύνδεση"}
        </button>
      </form>
      <div className="mt-4 flex items-center justify-between gap-3 text-xs">
        <button
          type="button"
          className="font-medium text-clinical-700 hover:underline"
          onClick={() => setForgotOpen((v) => !v)}
        >
          Ξέχασα τον κωδικό
        </button>
        <Link href="/signup" className="font-medium text-clinical-700 hover:underline">
          Δημιουργία λογαριασμού
        </Link>
      </div>
      {forgotOpen ? (
        <p className="mt-3 rounded-lg border border-border bg-surface-muted px-3 py-2 text-xs text-ink-muted">
          Η επαναφορά κωδικού θα προστεθεί στο επόμενο βήμα του MVP. Προσωρινά, επικοινωνήστε με τη διοίκηση.
        </p>
      ) : null}
      <p className="mt-6 text-center text-xs text-ink-faint">
        Προστασία δεδομένων · Χρησιμοποιήστε μόνο εξουσιοδοτημένο λογαριασμό.
      </p>
    </div>
  );
}
