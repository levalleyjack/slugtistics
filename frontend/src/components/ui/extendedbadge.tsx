import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Award, BookOpen } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge as ShadcnBadge, badgeVariants as shadcnBadgeVariants } from "@/components/ui/badge";

// Extended badge variants for our custom types
const extendedBadgeVariants = cva(
  "inline-flex items-center justify-center rounded-lg border px-3 py-1 text-sm font-bold w-fit whitespace-nowrap shrink-0 [&>svg]:size-4 gap-1 [&>svg]:pointer-events-none transition-all duration-200 overflow-hidden",
  {
    variants: {
      variant: {
        rating:
          "h-6 border-transparent bg-blue-600 text-white",
        review:
          "h-6 text-gray-600 bg-white border-gray-200 hover:bg-transparent hover:text-blue-600",
        difficulty: "", // Base style, will be modified with modifiers
        course:
          "h-8 text-sm tracking-wider text-white uppercase bg-gradient-to-br from-blue-700 to-blue-400 hover:bg-gradient-to-br hover:from-blue-400 hover:to-blue-600",
        category:
          "h-7 py-4 px-2 text-white bg-gradient-to-br from-purple-700 to-purple-400 hover:bg-gradient-to-br hover:from-purple-400 hover:to-purple-600",
        grade: "", // Base style, will be modified with modifiers
        styled:
          "bg-gradient-to-br from-white to-gray-100 border border-gray-300 hover:bg-gradient-to-br hover:from-gray-100 hover:to-gray-200 hover:border-gray-400",
      },
      clickable: {
        true: "cursor-pointer shadow-sm hover:-translate-y-0.5 hover:brightness-110 hover:shadow-md active:translate-y-0 active:brightness-95 active:shadow-sm",
        false: "",
      },
      difficultyLevel: {
        easy: "text-green-600 border-green-700",
        medium: "text-amber-600 border-amber-700",
        hard: "text-red-600 border-red-700",
      },
      gradeValue: {
        excellent: "from-green-400 via-green-500 to-green-700",
        good: "from-green-400 to-amber-400",
        average: "from-amber-400 via-amber-500 to-amber-700",
        fair: "from-amber-500 to-red-400",
        poor: "from-red-400 via-red-500 to-red-700",
      },
      gradeDisplay: {
        filled: "text-white bg-gradient-to-br",
        outline: "text-transparent bg-white bg-clip-text bg-gradient-to-br",
      },
    },
    compoundVariants: [
      {
        variant: "difficulty",
        className: "h-6.5 bg-white font-bold border hover:bg-gray-50",
      },
      {
        variant: "grade",
        gradeDisplay: "filled",
        className: "text-white bg-gradient-to-br",
      },
      {
        variant: "grade",
        gradeDisplay: "outline",
        className: "text-transparent bg-white bg-clip-text bg-gradient-to-br",
      },
    ],
    defaultVariants: {
      clickable: false,
      gradeDisplay: "filled",
    },
  }
);

// Types for our custom extended badge
export interface ExtendedBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof extendedBadgeVariants> {
  asChild?: boolean;
  icon?: React.ReactNode;
  value?: number | string;
}

// Helper to determine if this is one of our custom variants
const isCustomVariant = (variant?: string): boolean => {
  return ["rating", "review", "difficulty", "course", "category", "grade", "styled"].includes(
    variant || ""
  );
};

// Our extended badge component
export function ExtendedBadge({
  className,
  variant,
  clickable,
  difficultyLevel,
  gradeValue,
  gradeDisplay,
  asChild = false,
  icon,
  value,
  children,
  ...props
}: ExtendedBadgeProps) {
  const Comp = asChild ? Slot : "span";

  // Only process these if we're using a custom variant
  if (isCustomVariant(variant)) {
    // Determine difficulty level based on numeric value if provided
    let derivedDifficultyLevel = difficultyLevel;
    if (variant === "difficulty" && value !== undefined && typeof value === "number") {
      derivedDifficultyLevel = value >= 4 
        ? "hard" 
        : value >= 3 
          ? "medium" 
          : "easy";
    }

    // Determine grade level based on numeric value if provided
    let derivedGradeValue = gradeValue;
    if (variant === "grade" && value !== undefined && typeof value === "number") {
      derivedGradeValue = value >= 3.7 
        ? "excellent" 
        : value >= 3.3 
          ? "good" 
          : value >= 3.0 
            ? "average" 
            : value >= 2.7 
              ? "fair" 
              : "poor";
    }

    // Format the value display as needed
    const displayValue = () => {
      if (value !== undefined) {
        if (typeof value === "number") {
          return value.toFixed(1);
        }
        return value;
      }
      return children;
    };

    return (
      <Comp
        data-slot="badge"
        className={cn(
          extendedBadgeVariants({ 
            variant, 
            clickable, 
            difficultyLevel: derivedDifficultyLevel, 
            gradeValue: derivedGradeValue,
            gradeDisplay
          }), 
          className
        )}
        {...props}
      >
        {icon && <span className="mr-1">{icon}</span>}
        {displayValue()}
      </Comp>
    );
  }

  // Otherwise, just use the standard Badge component
  return <ShadcnBadge variant={variant as any} className={className} {...props}>{children}</ShadcnBadge>;
}

// Re-export the original badge and variants
export { ShadcnBadge as Badge, shadcnBadgeVariants as badgeVariants };
