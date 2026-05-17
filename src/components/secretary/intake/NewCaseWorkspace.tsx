"use client";

import { useState } from "react";
import type { ClientIntake } from "@/lib/secretary/types";
import { IntakeExportBar } from "./IntakeExportBar";
import { NewCaseIntakeForm } from "./NewCaseIntakeForm";

export function NewCaseWorkspace() {
  const [lastSaved, setLastSaved] = useState<ClientIntake | null>(null);

  return (
    <div>
      <IntakeExportBar lastSaved={lastSaved} />
      <NewCaseIntakeForm onSaved={setLastSaved} />
    </div>
  );
}
