import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring/40",
  {
    variants: {
      variant: {
        default:
          "border-primary/30 bg-primary/15 text-primary backdrop-blur-sm shadow-[0_0_10px_-3px_rgba(129,140,248,0.3)]",
        secondary:
          "border-[var(--glass-border)] bg-[var(--glass-bg)] text-secondary-foreground backdrop-blur-sm",
        destructive:
          "border-destructive/30 bg-destructive/15 text-destructive backdrop-blur-sm shadow-[0_0_10px_-3px_rgba(248,113,113,0.3)]",
        outline:
          "border-[var(--glass-border-strong)] text-foreground",
        success:
          "border-green-500/30 bg-green-500/15 text-green-400 backdrop-blur-sm shadow-[0_0_10px_-3px_rgba(34,197,94,0.3)]",
        warning:
          "border-yellow-500/30 bg-yellow-500/15 text-yellow-400 backdrop-blur-sm shadow-[0_0_10px_-3px_rgba(234,179,8,0.3)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
