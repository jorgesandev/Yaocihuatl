"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export interface AlertInitialData {
  sourceUrl: string;
  platform: string;
  alertId: string;
  mode: "manual" | "alert";
  riskLevel: string;
  motive: string;
  protectedPerson: string;
  alertCode: string;
}

export function useAlertParams(): AlertInitialData {
  const searchParams = useSearchParams();

  return useMemo(() => {
    const sourceUrl = searchParams.get("sourceUrl") || "";
    const platform = searchParams.get("platform") || "";
    const alertId = searchParams.get("alertId") || "";
    const mode: "manual" | "alert" = alertId ? "alert" : "manual";
    const riskLevel = searchParams.get("riskLevel") || "";
    const motive = searchParams.get("motive") || "";
    const protectedPerson = searchParams.get("protectedPerson") || "";
    const alertCode = searchParams.get("alertCode") || "";

    return { sourceUrl, platform, alertId, mode, riskLevel, motive, protectedPerson, alertCode };
  }, [searchParams]);
}
