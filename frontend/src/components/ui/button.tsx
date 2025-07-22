import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import "../../App.css";
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-ring focus-visible:ring-2 focus-visible:border-ring [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/85 shadow-md rounded-xl",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-xl",
        outline:
          "border border-border bg-background text-foreground hover:bg-muted/40 dark:hover:bg-muted/60 rounded-xl",
        ghost:
          "hover:bg-muted hover:text-foreground dark:hover:bg-muted/50 rounded-md",
        link: "text-primary underline underline-offset-4 hover:text-primary-foreground",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/85 focus-visible:ring-destructive/40 rounded-xl shadow",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-sm rounded-md",
        lg: "h-11 px-6 text-base rounded-xl",
        icon: "size-9 p-0 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
