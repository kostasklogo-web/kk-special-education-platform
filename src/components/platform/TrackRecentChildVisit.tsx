"use client";

import { useEffect } from "react";
import { trackRecentChildVisit } from "@/components/platform/PlatformQuickNavPanel";

type Props = { childId: string; label: string };

/** Records child profile visits for the platform home quick panel. */
export function TrackRecentChildVisit({ childId, label }: Props) {
  useEffect(() => {
    trackRecentChildVisit(childId, label);
  }, [childId, label]);
  return null;
}
