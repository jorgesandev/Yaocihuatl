"use client";

import { useCallback, useState } from "react";

const STORAGE_KEY = "yaocihuatl-chimalli-context";

export interface ChimalliEvidenceContext {
  evidences: Array<{
    id: string;
    hash: string;
    shortHash: string;
    platform: string;
    sourceUrl?: string;
    contextNote?: string;
    capturedAt: string;
    sourceType: string;
  }>;
  alert?: {
    alertId: string;
    alertCode?: string;
    riskLevel?: string;
    motive?: string;
    protectedPerson?: string;
    signals?: Array<{ label: string; explanation: string; weight: number }>;
  };
  attachmentIds: string[];
  noteText: string;
  storedAt: string;
}

export function useChimalliContext() {
  const [context, setContext] = useState<ChimalliEvidenceContext | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as ChimalliEvidenceContext;
      const age = Date.now() - new Date(parsed.storedAt).getTime();
      if (age > 30 * 60 * 1000) {
        window.localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  });

  const saveContext = useCallback((ctx: ChimalliEvidenceContext) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ctx));
    setContext(ctx);
  }, []);

  const clearContext = useCallback(() => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(STORAGE_KEY);
    setContext(null);
  }, []);

  return { context, saveContext, clearContext };
}
