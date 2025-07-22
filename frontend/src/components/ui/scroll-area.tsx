import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { cn } from "@/lib/utils"

interface ScrollAreaProps extends React.ComponentProps<typeof ScrollAreaPrimitive.Root> {
  scrollDirection?: "vertical" | "horizontal" | "both"
}

function ScrollArea({
  className,
  children,
  scrollDirection = "vertical",
  ...props
}: ScrollAreaProps) {
  const allowVertical = scrollDirection === "vertical" || scrollDirection === "both"
  const allowHorizontal = scrollDirection === "horizontal" || scrollDirection === "both"

  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn("relative", className)}
      {...props}
    >
    <ScrollAreaPrimitive.Viewport
  className={cn(
    "focus-visible:ring-ring/50 w-full h-full rounded-[inherit] outline-none transition-[color,box-shadow] focus-visible:ring-[3px]",
    allowVertical   && "overflow-y-auto",
    allowHorizontal && "overflow-x-auto"
  )}
>
  {children}
</ScrollAreaPrimitive.Viewport>
      {allowVertical && <ScrollBar orientation="vertical" />}
      {allowHorizontal && <ScrollBar orientation="horizontal" />}
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
}

function ScrollBar({
  orientation = "vertical",
  className,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  const isVertical = orientation === "vertical";
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      orientation={orientation}
      className={cn(
        "flex touch-none p-px transition-colors select-none",
        isVertical
          ? "w-2.5 h-full border-l border-l-transparent"
          : "h-2.5 w-full border-t border-t-transparent flex-row",
        className
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb className="bg-border relative flex-1 rounded-full" />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
}


export { ScrollArea, ScrollBar }
