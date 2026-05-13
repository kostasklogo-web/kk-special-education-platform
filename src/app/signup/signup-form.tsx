"use client";

import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";

export function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  /** True when signup succeeded but there is no session yet (e.g. email confirmation required). */
  const [pendingEmailConfirm, setPendingEmailConfirm] = useState(false);

  function validate(): string | null {
    const emailValue = email.trim();
    if (!emailValue) return "Το email είναι υποχρεωτικό.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) return "Το email δεν είναι έγκυρο.";
    if (!password) return "Ο κωδικός πρόσβασης είναι υποχρεωτικός.";
    if (password.length < 6) return "Ο κωδικός πρόσβασης πρέπει να έχει τουλάχιστον 6 χαρακτήρες.";
    if (password !== confirmPassword) return "Οι κωδικοί πρόσβασης δεν ταιριάζουν.";
    return null;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      setMessage(null);
      setPendingEmailConfirm(false);
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);
    setPendingEmailConfirm(false);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });
    setLoading(false);

    if (signUpError) {
      setError("Δεν ήταν δυνατή η δημιουργία λογαριασμού. Ελέγξτε τα στοιχεία και δοκιμάστε ξανά.");
      return;
    }

    setMessage("Ο λογαριασμός δημιουργήθηκε επιτυχώς.");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const hasSession = Boolean(data.session ?? session);
    setPendingEmailConfirm(!hasSession);
    if (!hasSession) {
      return;
    }

    try {
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Ο λογαριασμός δημιουργήθηκε, αλλά η μετάβαση στον πίνακα δεν ήταν δυνατή.");
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-surface-card p-8 shadow-shell">
      <h1 className="text-xl font-semibold text-ink">Δημιουργία λογαριασμού</h1>
      <p className="mt-2 text-sm text-ink-muted">Εγγραφή με email και κωδικό πρόσβασης.</p>

      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-xs font-medium text-ink-muted">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
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
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-ink shadow-sm outline-none ring-clinical-500 focus:ring-2"
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="mb-1 block text-xs font-medium text-ink-muted">
            Επιβεβαίωση κωδικού
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-ink shadow-sm outline-none ring-clinical-500 focus:ring-2"
          />
        </div>
        {error ? (
          <p className="text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="text-sm text-emerald-700" role="status">
            {message}
            {pendingEmailConfirm ? (
              <span className="mt-1 block text-xs text-ink-muted">
                Ελέγξτε τα εισερχόμενα για επιβεβαίωση email. Μετά τη σύνδεση θα μεταφερθείτε στον πίνακα ελέγχου.
              </span>
            ) : null}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-lg bg-clinical-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-clinical-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Εγγραφή…" : "Εγγραφή"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-ink-faint">
        Έχετε ήδη λογαριασμό;{" "}
        <Link href="/login" className="font-medium text-clinical-700 hover:underline">
          Σύνδεση
        </Link>
      </p>
    </div>
  );
}
