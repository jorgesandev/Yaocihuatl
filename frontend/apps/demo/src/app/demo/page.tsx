import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

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

export default function DemoRolePage() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface-card">
        <div className="container-standard flex min-h-16 items-center justify-between">
          <Link className="flex items-center gap-3 font-bold" href="/">
            <ShieldCheck aria-hidden="true" className="h-5 w-5 text-primary" />
            Yaocíhuatl
          </Link>
          <Badge variant="brand">Selector demo</Badge>
        </div>
      </header>
      <section className="container-standard py-12">
        <div className="max-w-3xl">
          <Badge variant="neutral">Roles mock</Badge>
          <h1 className="mt-4 text-4xl font-bold text-foreground">Elige una vista demo</h1>
          <p className="mt-3 text-lg leading-8 text-neutral-700">
            Cada rol muestra una experiencia distinta. No hay autenticacion real ni permisos
            definitivos en esta demo.
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {demoRoles.map((role) => {
            const Icon = role.icon;

            return (
              <Card key={role.id}>
                <CardHeader>
                  <span className="flex h-12 w-12 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                    <Icon aria-hidden="true" className="h-6 w-6" />
                  </span>
                  <CardTitle>{role.label}</CardTitle>
                  <CardDescription>{role.title}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-neutral-700">{role.description}</p>
                  <Button asChild className="mt-5">
                    <Link href={role.href}>
                      Entrar como {role.label}
                      <ArrowRight aria-hidden="true" className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </main>
  );
}
