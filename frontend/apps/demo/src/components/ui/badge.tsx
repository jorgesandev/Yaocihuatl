import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold leading-none",
  {
    variants: {
      variant: {
        neutral: "border-border bg-neutral-100 text-neutral-700",
        brand: "border-brand-200 bg-brand-100 text-brand-800",
        success: "border-success-100 bg-success-100 text-success-700",
        warning: "border-warning-100 bg-warning-100 text-warning-700",
        danger: "border-danger-100 bg-danger-100 text-danger-700",
        info: "border-info-100 bg-info-100 text-info-700"
      }
    },
    defaultVariants: {
      variant: "neutral"
    }
  }
);

interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}
