import Link from "next/link";
import Image from "next/image";

interface BrandLogoProps {
  href?: string;
  subtitle?: string;
  compact?: boolean;
}

export function BrandLogo({ href = "/", subtitle, compact = false }: BrandLogoProps) {
  return (
    <Link className="flex min-w-0 items-center gap-3" href={href}>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-surface-card">
        <Image
          alt="Logo de Yaocíhuatl, perfil minimalista de mujer guerrera"
          className="h-10 w-10 object-contain"
          height={40}
          src="/icon-192.png"
          width={40}
        />
      </span>
      <span className="min-w-0">
        <span className="block text-base font-bold leading-tight text-foreground">Yaocíhuatl</span>
        {subtitle && !compact ? (
          <span className="hidden text-xs text-neutral-600 sm:block">{subtitle}</span>
        ) : null}
      </span>
    </Link>
  );
}
