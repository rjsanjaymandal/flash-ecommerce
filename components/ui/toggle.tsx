"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const Toggle = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    pressed?: boolean
    onPressedChange?: (pressed: boolean) => void
    size?: "default" | "sm" | "lg"
    variant?: "default" | "outline"
  }
>(({ className, pressed, onPressedChange, size = "default", variant = "default", onClick, ...props }, ref) => {
  return (
    <button
        ref={ref}
        type="button"
        aria-pressed={pressed}
        data-state={pressed ? "on" : "off"}
        className={cn(
            "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
            pressed && "bg-accent text-accent-foreground",
            size === "default" && "h-9 px-3",
            size === "sm" && "h-8 px-2 min-w-8",
            size === "lg" && "h-10 px-3",
            className
        )}
        onClick={(e) => {
            onClick?.(e)
            onPressedChange?.(!pressed)
        }}
        {...props}
    />
  )
})

Toggle.displayName = "Toggle"

export { Toggle }
