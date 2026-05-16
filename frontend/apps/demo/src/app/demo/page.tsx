import Link from "next/link";
import { ArrowRight, Lock, Shield } from "lucide-react";

import { BrandLogo } from "@/components/product/brand-logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { demoRoles } from "@/lib/mock-data";

const roleAccentMap: Record<string, { icon: string; bg: string; border: string; text: string }> = {
  protected: { icon: "bg-brand-100 text-brand-700", bg: "hover:border-brand-200 hover:bg-brand-50/30", border: "border-border", text: "text-brand-700" },
  analyst: { icon: "bg-info-100 text-info-700", bg: "hover:border-blue-200 hover:bg-blue-50/20", border: "border-border", text: "text-info-700" },
  reviewer: { icon: "bg-success-100 text-success-700", bg: "hover:border-green-200 hover:bg-green-50/20", border: "border-border", text: "text-success-700" },
  observer: { icon: "bg-neutral-100 text-neutral-700", bg: "hover:border-neutral-300 hover:bg-neutral-50", border: "border-border", text: "text-neutral-700" }
};

const roleFeatures: Record<string, string[]> = {
  protected: ["Sello forense SHA-256 local", "Orientación con Chimalli (IA)", "Kit de evidencia revisable"],
  analyst: ["Panel Tlachia en tiempo real", "Alertas preventivas y patrones", "Bitácora de análisis institucional"],
  reviewer: ["Expedientes asignados de solo lectura", "Verificación criptográfica de hashes", "Cadena de custodia electrónica"],
  observer: ["Métricas agregadas y anonimizadas", "Criterios jurisprudenciales", "Verificador SHA-256 público"]
};

export default function RoleSelectorPage() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface-card">
        <div className="container-standard flex min-h-16 items-center justify-between gap-4">
          <BrandLogo compact />
          <div className="flex items-center gap-2 text-xs text-neutral-600">
            <Lock aria-hidden="true" className="h-3.5 w-3.5 text-success-700" />
            <span className="hidden sm:inline">Acceso seguro · Cifrado en tránsito</span>
          </div>
        </div>
      </header>

      <section className="container-standard py-12">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <Badge variant="brand">
              <Shield aria-hidden="true" className="h-3.5 w-3.5" />
              Acceso por rol institucional
            </Badge>
            <h1 className="mt-4 text-4xl font-bold text-foreground">Selecciona tu rol de acceso</h1>
            <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-neutral-700">
              Cada rol muestra una experiencia diferenciada según las funciones institucionales
              correspondientes. Sin credenciales visibles para esta sesión.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {demoRoles.map((role) => {
              const Icon = role.icon;
              const accent = roleAccentMap[role.id] ?? roleAccentMap.observer;
              const features = roleFeatures[role.id] ?? [];

              return (
                <Card
                  className={`card-hover flex flex-col transition-all duration-200 ${accent.bg} ${accent.border}`}
                  key={role.id}
                >
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${accent.icon}`}>
                        <Icon aria-hidden="true" className="h-6 w-6" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className={`text-xs font-semibold uppercase tracking-wide ${accent.text}`}>
                          {role.label}
                        </span>
                        <CardTitle className="mt-1 text-base">{role.title}</CardTitle>
                      </div>
                    </div>
                    <CardDescription className="mt-3">{role.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1 justify-between">
                    <ul className="space-y-1.5">
                      {features.map((feature) => (
                        <li className="flex items-center gap-2 text-xs text-neutral-600" key={feature}>
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-400" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button asChild className="mt-5 w-full">
                      <Link href={role.href}>
                        Continuar como {role.label}
                        <ArrowRight aria-hidden="true" className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-neutral-500">
            <Lock aria-hidden="true" className="h-3.5 w-3.5" />
            <span>Los datos mostrados son sintéticos. Ningún archivo real es procesado en esta sesión.</span>
          </div>
        </div>
      </section>
    </main>
  );
}
