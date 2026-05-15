"use client";

import Link from "next/link";
import { Fingerprint, Search, ShieldCheck } from "lucide-react";
import { useState } from "react";

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
import { hashes } from "@/lib/mock-data";

export default function VerifyPage() {
  const [verified, setVerified] = useState(false);

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface-card">
        <div className="container-standard flex min-h-16 items-center justify-between">
          <Link className="flex items-center gap-3 font-bold" href="/">
            <ShieldCheck aria-hidden="true" className="h-5 w-5 text-primary" />
            Verificador
          </Link>
          <Badge variant="brand">Publico · Demo</Badge>
        </div>
      </header>
      <section className="container-standard py-12">
        <div className="mx-auto max-w-3xl space-y-6">
          <div>
            <Badge variant="neutral">Sin contenido sensible</Badge>
            <h1 className="mt-4 text-4xl font-bold text-foreground">Verificador publico de hash</h1>
            <p className="mt-3 text-lg leading-8 text-neutral-700">
              Confirma existencia e integridad sin revelar la evidencia. El resultado en esta
              pantalla es simulado.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Pegar hash</CardTitle>
              <CardDescription>
                Usa un hash SHA-256 demo. No se muestra archivo, imagen ni publicacion.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <Field
                  helper="Ejemplo cargado en el resultado mock."
                  id="hash-input"
                  label="Hash SHA-256"
                >
                  <Input
                    aria-describedby="hash-input-helper"
                    defaultValue={hashes[0]}
                    id="hash-input"
                  />
                </Field>
                <Button className="self-end" onClick={() => setVerified(true)} type="button">
                  <Search aria-hidden="true" className="h-4 w-4" />
                  Verificar
                </Button>
              </div>
            </CardContent>
          </Card>

          {verified ? (
            <Card className="border-success-100">
              <CardHeader>
                <Badge variant="success">Hash encontrado</Badge>
                <CardTitle className="mt-3 flex items-center gap-2">
                  <Fingerprint aria-hidden="true" className="h-5 w-5 text-success-700" />
                  Evidencia registrada
                </CardTitle>
                <CardDescription>
                  Fecha de sellado: 15 may 2026, 10:06 · Estado demo: evidencia registrada.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HashBlock algorithm="SHA-256" hash={hashes[0]} />
                <p className="mt-4 text-sm leading-6 text-neutral-700">
                  Este verificador confirma existencia e integridad sin revelar la evidencia ni
                  datos personales.
                </p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </section>
    </main>
  );
}
