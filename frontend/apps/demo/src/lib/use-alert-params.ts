"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export interface AlertInitialData {
  sourceUrl: string;
  platform: string;
  alertId: string;
  mode: "manual" | "alert";
}

export function useAlertParams(): AlertInitialData {
  const searchParams = useSearchParams();

  return useMemo(() => {
    const sourceUrl = searchParams.get("sourceUrl") || "";
    const platform = searchParams.get("platform") || "";
    const alertId = searchParams.get("alertId") || "";
    const mode: "manual" | "alert" = alertId ? "alert" : "manual";

    return { sourceUrl, platform, alertId, mode };
  }, [searchParams]);
}
