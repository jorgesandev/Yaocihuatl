import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "touch-target inline-flex items-center justify-center gap-2 rounded-md text-sm font-semibold ring-offset-background transition-colors disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary-hover",
        outline:
          "border border-border-strong bg-surface-card text-foreground hover:bg-neutral-100",
        ghost: "text-neutral-700 hover:bg-neutral-100 hover:text-foreground",
        destructive:
          "border border-danger-700 bg-surface-card text-danger-700 hover:bg-danger-100"
      },
      size: {
        sm: "h-10 px-3",
        md: "h-11 px-4",
        lg: "h-12 px-5",
        icon: "h-11 w-11 p-0"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { buttonVariants };
