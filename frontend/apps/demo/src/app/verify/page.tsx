"use client";

import { Fingerprint, Loader2, Search } from "lucide-react";
import { useState } from "react";

import { BrandLogo } from "@/components/product/brand-logo";
import { HashBlock } from "@/components/product/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type VerifyResult = "match" | "mismatch" | "evidence_not_found";

interface VerifyResponse {
  result: VerifyResult;
  evidence_id: string | null;
  sealed_at: string | null;
  short_hash: string | null;
  warning: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function VerifyPage() {
  const [hashInput, setHashInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifyResult, setVerifyResult] = useState<VerifyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleVerify() {
    const hash = hashInput.trim();
    if (!hash) return;

    setLoading(true);
    setError(null);
    setVerifyResult(null);

    try {
      const res = await fetch(`${API_URL}/api/v1/machiyotl/verify/${encodeURIComponent(hash)}`);
      if (res.status === 400) {
        const body = await res.json();
        setError(body.detail?.message ?? "Hash inválido.");
        return;
      }
      if (!res.ok) {
        setError("No se pudo conectar con el servicio de verificación.");
        return;
      }
      const data: VerifyResponse = await res.json();
      setVerifyResult(data);
    } catch {
      setError("No se pudo conectar con el servicio de verificación. Verifica que el backend esté activo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface-card">
        <div className="container-standard flex min-h-16 items-center justify-between">
          <BrandLogo subtitle="Verificador público" />
          <Badge variant="neutral">Acceso público · Sin datos sensibles</Badge>
        </div>
      </header>
      <section className="container-readable py-12">
        <div className="space-y-6">
          <div>
            <Badge variant="neutral">Sin contenido sensible</Badge>
            <h1 className="mt-4 text-4xl font-bold text-foreground">Verificador público de hash</h1>
            <p className="mt-3 text-base leading-7 text-neutral-700">
              Confirma la existencia e integridad de evidencia sellada sin revelar su contenido.
              El hash se verifica contra el servicio Machiyotl.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Fingerprint aria-hidden="true" className="h-5 w-5 text-primary" />
                Ingresar hash SHA-256
              </CardTitle>
              <CardDescription>
                Pega un hash en hexadecimal. No se muestra archivo, imagen ni publicación.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <Field
                  helper="Ejemplo: dca10ce76e30dfa30f7b6ccda35b6b58422695fd8d8c23fb3413b61f05780538"
                  id="hash-input"
                  label="Hash SHA-256"
                >
                  <Input
                    aria-describedby="hash-input-helper"
                    id="hash-input"
                    onChange={(e) => setHashInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !loading) handleVerify();
                    }}
                    placeholder="dca10ce76e30..."
                    value={hashInput}
                  />
                </Field>
                <Button
                  className="self-end"
                  disabled={loading || !hashInput.trim()}
                  onClick={handleVerify}
                  type="button"
                >
                  {loading ? (
                    <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search aria-hidden="true" className="h-4 w-4" />
                  )}
                  Verificar
                </Button>
              </div>
            </CardContent>
          </Card>

          {error ? (
            <Card className="border-danger-100">
              <CardHeader>
                <Badge variant="danger">Error de verificación</Badge>
                <CardTitle className="mt-3">No se pudo verificar</CardTitle>
                <CardDescription>{error}</CardDescription>
              </CardHeader>
            </Card>
          ) : null}

          {verifyResult ? (
            verifyResult.result === "match" ? (
              <Card className="border-success-100">
                <CardHeader>
                  <Badge variant="success">Hash encontrado</Badge>
                  <CardTitle className="mt-3 flex items-center gap-2">
                    <Fingerprint aria-hidden="true" className="h-5 w-5 text-success-700" />
                    Evidencia registrada en el sistema
                  </CardTitle>
                  <CardDescription>
                    {verifyResult.sealed_at
                      ? `Fecha de sellado: ${new Date(verifyResult.sealed_at).toLocaleString("es-MX")}`
                      : "Evidencia sellada localmente."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {verifyResult.short_hash ? (
                    <HashBlock algorithm="SHA-256" hash={verifyResult.short_hash} />
                  ) : null}
                  <p className="mt-4 text-sm leading-6 text-neutral-700">{verifyResult.warning}</p>
                </CardContent>
              </Card>
            ) : verifyResult.result === "evidence_not_found" ? (
              <Card>
                <CardHeader>
                  <Badge variant="neutral">No encontrado</Badge>
                  <CardTitle className="mt-3">Hash no registrado</CardTitle>
                  <CardDescription>
                    Este hash no corresponde a ninguna evidencia sellada en el sistema.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-neutral-700">{verifyResult.warning}</p>
                </CardContent>
              </Card>
            ) : null
          ) : null}
        </div>
      </section>
    </main>
  );
}
