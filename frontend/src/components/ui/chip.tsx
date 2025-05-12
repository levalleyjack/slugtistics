"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  BookOpen,
  AlertCircle,
  GraduationCap,
  ChevronRight,
} from "lucide-react";
import { categoryIconMap } from "@/Constants";

// Updated chipVariants to make padding more controllable
const chipVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium text-sm select-none group transition-colors",
  {
    variants: {
      variant: {
        default: "bg-white text-slate-700",
        solid: "text-white",
        outline: "bg-white border text-slate-700",
        ghost: "border-transparent",
      },
      size: {
        sm: "h-6 text-xs", // Removed px-2
        md: "h-8 text-sm",  // Removed px-3
        lg: "h-10 text-base", // Removed px-4
      },
      padding: {
        none: "px-0",
        sm: "px-2",
        md: "px-3",
        lg: "px-4",
      },
      interactive: {
        true: "cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm transition-transform",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      padding: "md", // Default padding
      interactive: false,
    },
  }
);

export interface ChipProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chipVariants> {
  noPadding?: boolean; // Add convenience prop
}

export function Chip({
  className,
  variant,
  size,
  padding,
  interactive,
  noPadding,
  ...props
}: ChipProps) {
  // If noPadding is true, override padding to 'none'
  const actualPadding = noPadding ? "none" : padding;
  
  return (
    <div
      className={cn(chipVariants({ variant, size, padding: actualPadding, interactive }), className)}
      {...props}
    />
  );
}

interface CourseCodeChipProps extends ChipProps {
  courseCode: string;
}

export function CourseCodeChip({
  courseCode,
  className,
  ...props
}: CourseCodeChipProps) {
  return (
    <Chip
      variant="outline"
      size="md"
      interactive={false}
      className={cn(
        "border-slate-200 text-slate-700 font-semibold tracking-wide",
        className
      )}
      {...props}
    >
      {courseCode}
    </Chip>
  );
}

interface RatingChipProps extends ChipProps {
  rating?: number;
  compact?: boolean; // Add option for compact display
}

export function RatingChip({ 
  rating, 
  className, 
  compact = false, 
  ...props 
}: RatingChipProps) {
  if (
    rating === undefined ||
    rating === null ||
    isNaN(rating) ||
    rating === 0
  ) {
    return (
      <Chip
        variant="ghost"
        size="sm"
        noPadding={compact}
        padding={compact ? "none" : "sm"}
        interactive={false}
        className={cn(
          "text-muted-foreground border border-dashed border-slate-300 font-normal",
          compact ? "px-2" : "px-2",
          className
        )}
        {...props}
      >
        <Star className="mr-1 h-3.5 w-3.5 opacity-50" />
        {"No ratings"}
      </Chip>
    );
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-emerald-700";
    if (rating >= 3) return "text-amber-700";
    return "text-rose-700";
  };

  return (
    <Chip
      variant="ghost"
      size="sm"
      noPadding={compact}
      padding={compact ? "none" : "sm"}
      interactive={false}
      className={cn(
        getRatingColor(rating), 
        "font-semibold border",
        compact ? "mr-2" : "px-2", 
        className
      )}
      {...props}
    >
      <Star className="mr-1 h-3.5 w-3.5" />
      {rating.toFixed(1)}
    </Chip>
  );
}

interface DifficultyChipProps extends ChipProps {
  difficulty?: number;
  compact?: boolean; // Add option for compact display
}

export function DifficultyChip({
  difficulty,
  className,
  compact = false,
  ...props
}: DifficultyChipProps) {
  if (
    difficulty === undefined ||
    difficulty === null ||
    isNaN(difficulty) ||
    difficulty === 0
  ) {
    return (
      <Chip
        variant="ghost"
        size="sm"
        noPadding={compact}
        padding={compact ? "none" : "sm"}
        interactive={false}
        className={cn(
          "text-muted-foreground border border-dashed border-slate-300 font-normal",
          compact ? "px-2" : "px-2",
          className
        )}
        {...props}
      >
        <AlertCircle className="mr-1 h-3.5 w-3.5 opacity-50" />
        {"No data"}
      </Chip>
    );
  }

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty >= 4) return "text-rose-700";
    if (difficulty >= 3) return "text-amber-700";
    return "text-emerald-700";
  };

  return (
    <Chip
      variant="ghost"
      size="sm"
      noPadding={compact}
      padding={compact ? "none" : "sm"}
      interactive={false}
      className={cn(
        getDifficultyColor(difficulty), 
        "font-semibold",
        compact ? "mr-2" : "px-2", 
        className
      )}
      {...props}
    >
      <AlertCircle className="mr-1 h-3.5 w-3.5" />
      {difficulty.toFixed(1)}{" difficulty"}
    </Chip>
  );
}

interface ReviewCountChipProps extends ChipProps {
  count: number;
  compact?: boolean;
}

export function ReviewCountChip({
  count,
  className,
  compact = false,
  ...props
}: ReviewCountChipProps) {
  return (
    <Chip
      variant="ghost"
      size="sm"
      padding={compact ? "sm" : "md"}
      interactive={true}
      className={cn("text-indigo-600 transition-all group relative", className)}
      {...props}
    >
      <BookOpen className="mr-1 h-3.5 w-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
      {count} {!compact && (count === 1 ? "review" : "reviews")}
      <span className="inline-flex w-0 overflow-hidden transition-all duration-200 ease-out group-hover:w-4">
        <ChevronRight className="h-3.5 w-3.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
      </span>
    </Chip>
  );
}

interface GradeChipProps extends ChipProps {
  grade: number | undefined;
  letterGrade: string;
  interactive?: boolean;
}

export function GradeChip({
  grade,
  letterGrade,
  interactive = true,
  className,
  ...props
}: GradeChipProps) {
  if (grade === undefined || grade === null || isNaN(grade)) {
    return (
      <Chip
        variant="outline"
        size="sm"
        interactive={false}
        className={cn(
          "text-muted-foreground border border-dashed border-slate-300 font-normal",
          className
        )}
        {...props}
      >
        No GPA
      </Chip>
    );
  }

  const getGradeStyle = (grade: number) => {
    if (grade >= 3.7)
      return "bg-gradient-to-r from-emerald-400 to-emerald-600 text-white";
    if (grade >= 3.0)
      return "bg-gradient-to-r from-amber-400 to-amber-600 text-white";
    if (grade >= 2.7)
      return "bg-gradient-to-r from-orange-400 to-orange-600 text-white";
    return "bg-gradient-to-r from-rose-500 to-rose-700 text-white";
  };

  const getOutlineStyle = (grade: number) => {
    if (grade >= 3.7)
      return "border-emerald-200 text-emerald-700 bg-emerald-50";
    if (grade >= 3.3) return "border-teal-200 text-teal-700 bg-teal-50";
    if (grade >= 3.0) return "border-blue-200 text-blue-700 bg-blue-50";
    if (grade >= 2.7) return "border-amber-300 text-amber-700 bg-amber-50";
    return "border-rose-300 text-rose-700 bg-rose-50";
  };

  return (
    <Chip
      variant={interactive ? "solid" : "outline"}
      size="sm"
      interactive={interactive}
      className={cn(
        interactive ? getGradeStyle(grade) : getOutlineStyle(grade),
        "font-bold px-2 transition-all group",
        className
      )}
      {...props}
    >
      {letterGrade}
      {interactive && (
        <span className="inline-flex w-0 overflow-hidden transition-all duration-200 ease-out group-hover:w-4">
          <ChevronRight className="ml-1 h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
        </span>
      )}
    </Chip>
  );
}

interface GECategoryChipProps extends ChipProps {
  category: string;
  icon?: React.ReactNode;
  showIcon?: boolean;
  onClick?: () => void;
}

export function GECategoryChip({
  category,
  icon,
  showIcon = true,
  onClick,
  interactive = true,
  className,
  ...props
}: GECategoryChipProps) {
  const resolvedIcon =
    icon ??
    (showIcon && category in categoryIconMap
      ? categoryIconMap[category]
      : undefined);

  return (
    <Chip
      variant="outline"
      size="sm"
      interactive={interactive}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={cn(
        "border-slate-200 text-muted-foreground font-medium",
        interactive && "hover:bg-muted transition-all",
        className
      )}
      {...props}
    >
      {resolvedIcon &&
        React.cloneElement(resolvedIcon as React.ReactElement, {
          className: "mr-1 h-[14px] w-[14px]",
        })}
      {category}
    </Chip>
  );
}

type StatusType = "open" | "closed" | "waitlist";

interface StatusChipProps extends ChipProps {
  status: StatusType;
}

export function StatusChip({ status, className, ...props }: StatusChipProps) {
  const getStatusColor = (status: StatusType) => {
    switch (status) {
      case "open":
        return "text-emerald-700 border border-emerald-200";
      case "closed":
        return "text-rose-700 border border-rose-200";
      case "waitlist":
        return "text-amber-700 border border-amber-200";
      default:
        return "text-slate-700 border border-slate-200";
    }
  };

  const getStatusText = (status: StatusType) => {
    switch (status) {
      case "open":
        return "Open";
      case "closed":
        return "Closed";
      case "waitlist":
        return "Waitlist";
      default:
        return "Unknown";
    }
  };

  return (
    <Chip
      variant="ghost"
      size="sm"
      interactive={false}
      className={cn(getStatusColor(status), "font-medium", className)}
      {...props}
    >
      <span
        className={cn(
          "mr-1.5 h-2 w-2 rounded-full",
          status === "open"
            ? "bg-emerald-500"
            : status === "waitlist"
            ? "bg-amber-500"
            : "bg-rose-500"
        )}
      />
      {getStatusText(status)}
    </Chip>
  );
}