"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { PaymentObligation } from "@/lib/secretary/types";
import { todayAthensYmd } from "@/lib/schedule/athens-civil";
import { getAllCharges, PAYMENTS_UPDATED_EVENT } from "@/lib/secretary/payments/store";

const PaymentsChargeCtx = createContext<PaymentObligation[] | null>(null);

type Props = {
  children: ReactNode;
};

/** Syncs payment charges from localStorage + demo across secretary shell. */
export function PaymentsChargeProvider({ children }: Props) {
  const today = todayAthensYmd();
  const [charges, setCharges] = useState<PaymentObligation[]>([]);

  useEffect(() => {
    const refresh = () => setCharges(getAllCharges(today));
    refresh();
    window.addEventListener(PAYMENTS_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(PAYMENTS_UPDATED_EVENT, refresh);
  }, [today]);

  return <PaymentsChargeCtx.Provider value={charges}>{children}</PaymentsChargeCtx.Provider>;
}

export function usePaymentCharges(): PaymentObligation[] {
  const ctx = useContext(PaymentsChargeCtx);
  if (ctx === null) {
    if (typeof window === "undefined") return [];
    return getAllCharges(todayAthensYmd());
  }
  return ctx;
}
