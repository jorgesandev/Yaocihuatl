"use client";

import { useCallback, useState } from "react";

export interface SealMetadata {
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  capturedAt: string;
}

export interface SealResult {
  hash: string;
  shortHash: string;
  capturedAt: string;
  metadata: SealMetadata;
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function useLocalSeal() {
  const [sealing, setSealing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sealFile = useCallback(async (file: File): Promise<SealResult | null> => {
    setSealing(true);
    setError(null);

    try {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await window.crypto.subtle.digest("SHA-256", buffer);
      const hash = bufferToHex(hashBuffer);
      const shortHash = hash.slice(0, 12);
      const capturedAt = new Date().toISOString();

      const metadata: SealMetadata = {
        originalFilename: file.name,
        mimeType: file.type || "application/octet-stream",
        sizeBytes: file.size,
        capturedAt,
      };

      return { hash, shortHash, capturedAt, metadata };
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo generar el sello criptográfico."
      );
      return null;
    } finally {
      setSealing(false);
    }
  }, []);

  return { sealFile, sealing, error };
}
