import Link from "next/link";
import { Search } from "lucide-react";

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

export default function SafeExitPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="container-standard py-12">
        <div className="mx-auto max-w-3xl space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Pagina de inicio</h1>
            <p className="mt-3 leading-7 text-neutral-700">
              Busca recursos generales o continua navegando desde esta pagina neutral.
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Busqueda</CardTitle>
              <CardDescription>Contenido general de demostracion.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <Field id="neutral-search" label="Buscar">
                  <Input id="neutral-search" placeholder="Escribe una busqueda" />
                </Field>
                <Button className="self-end" type="button" variant="secondary">
                  <Search aria-hidden="true" className="h-4 w-4" />
                  Buscar
                </Button>
              </div>
            </CardContent>
          </Card>
          <div className="grid gap-4 sm:grid-cols-3">
            {["Clima local", "Noticias generales", "Directorio publico"].map((item) => (
              <Card className="p-4" key={item}>
                <p className="font-semibold text-foreground">{item}</p>
                <p className="mt-2 text-sm leading-6 text-neutral-600">Recurso neutral demo.</p>
              </Card>
            ))}
          </div>
          <Button asChild variant="ghost">
            <Link href="/">Ir a inicio general</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
