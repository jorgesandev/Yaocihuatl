"use client";

import { useCallback, useState } from "react";

const STORAGE_KEY = "yaocihuatl-machiyotl-evidences";

export interface StoredEvidence {
  id: string;
  hash: string;
  shortHash: string;
  capturedAt: string;
  sourceType: string;
  platform: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  contextNote: string;
  status: "capturando" | "sellada-localmente" | "lista-para-revision" | "error";
  createdAt: string;
  alertId?: string;
  mode?: "manual" | "alert";
  sourceUrl?: string;
  riskLevel?: string;
  motive?: string;
  protectedPerson?: string;
  alertCode?: string;
  tlachiaSignals?: Array<{
    label: string;
    explanation: string;
    weight: number;
  }>;
}

function generateId(): string {
  return `ev-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useEvidenceStore() {
  const [evidences, setEvidences] = useState<StoredEvidence[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as StoredEvidence[]) : [];
    } catch {
      return [];
    }
  });

  const persist = useCallback((items: StoredEvidence[]) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    setEvidences(items);
  }, []);

  const saveEvidence = useCallback(
    (evidence: Omit<StoredEvidence, "id" | "createdAt">): StoredEvidence => {
      const now = new Date().toISOString();
      const item: StoredEvidence = {
        ...evidence,
        id: generateId(),
        createdAt: now,
      };
      const updated = [...evidences, item];
      persist(updated);
      return item;
    },
    [evidences, persist]
  );

  const getEvidence = useCallback(
    (id: string): StoredEvidence | undefined =>
      evidences.find((ev) => ev.id === id),
    [evidences]
  );

  const listEvidences = useCallback((): StoredEvidence[] => evidences, [evidences]);

  const updateStatus = useCallback(
    (id: string, status: StoredEvidence["status"]) => {
      const updated = evidences.map((ev) =>
        ev.id === id ? { ...ev, status } : ev
      );
      persist(updated);
    },
    [evidences, persist]
  );

  const deleteEvidence = useCallback(
    (id: string) => {
      const updated = evidences.filter((ev) => ev.id !== id);
      persist(updated);
    },
    [evidences, persist]
  );

  return {
    evidences,
    saveEvidence,
    getEvidence,
    listEvidences,
    updateStatus,
    deleteEvidence,
  };
}
