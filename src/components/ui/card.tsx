import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // Thermal surface: 1 px line, radius 10, no shadow (a card sits on the page, it doesn't float)
      "rounded-lg border border-border bg-card text-card-foreground",
      // Ensure proper mobile sizing and prevent inheritance issues
      "w-full max-w-full", // Full width but prevent overflow
      "box-border", // Include padding/border in width calculation
      "flex-shrink-0", // Prevent shrinking in flex containers
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1",
      // Mobile-responsive padding: 16 on phones, 20 from md
      "p-4 md:p-5",
      // Ensure proper sizing
      "w-full",
      className
    )}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      // h2 role: 16 at 390, 18 from md
      "text-base md:text-lg font-semibold leading-6 tracking-[-0.01em] text-foreground",
      // Ensure proper text handling
      "break-words", // Break long words if needed
      "w-full",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm text-muted-foreground",
      // Ensure proper text handling
      "break-words", // Break long words if needed
      "w-full",
      className
    )}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn(
      // Mobile-responsive padding: 16 on phones, 20 from md
      "p-4 md:p-5",
      // Ensure proper sizing
      "w-full",
      className
    )} 
    {...props} 
  />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center p-4 md:p-5 pt-0 md:pt-0",
      // Ensure proper sizing
      "w-full",
      className
    )}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
