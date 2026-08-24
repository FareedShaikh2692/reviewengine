import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-mid/40",
  {
    variants: {
      variant: {
        primary:
          "bg-brand-gradient text-white shadow-premium hover:brightness-110 hover:shadow-glow active:brightness-95",
        secondary:
          "bg-surface text-ink-900 border border-border shadow-sm hover:bg-surface-muted",
        ghost: "text-ink-700 hover:bg-surface-muted",
        outline: "border border-border text-ink-900 hover:bg-surface-muted",
        danger: "bg-danger text-white hover:brightness-110",
        link: "text-brand-mid underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

/** Alias matching the design-system naming in the product spec. */
export const PremiumButton = Button;
