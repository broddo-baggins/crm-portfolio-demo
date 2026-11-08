import React from "react";
import { cn } from "@/lib/utils";

/** A keyboard hint. Hidden from assistive tech: the control it sits on already has a name. */
export const Kbd: React.FC<React.HTMLAttributes<HTMLElement>> = ({ className, ...props }) => (
  <kbd aria-hidden="true" className={cn("kbd", className)} {...props} />
);
