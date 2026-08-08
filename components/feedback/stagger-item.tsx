import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StaggerItemProps extends HTMLAttributes<HTMLDivElement> {
  index?: number;
  stepMs?: number;
  children?: ReactNode;
}

export function StaggerItem({
  index = 0,
  stepMs = 45,
  className,
  style,
  children,
  ...props
}: StaggerItemProps) {
  return (
    <div
      className={cn("stagger-item h-full", className)}
      style={{
        ...style,
        animationDelay: `${Math.min(index, 12) * stepMs}ms`,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
