import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "accent" | "outline" | "warning" | "danger" | "muted";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "default",
  size = "md",
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default:
      "bg-[#121619] text-[#F5F7F2] border border-[#272E32]",
    accent:
      "bg-[#B9F36A]/10 text-[#B9F36A] border border-[#B9F36A]/30 font-medium",
    outline:
      "border border-[#272E32] text-[#929B9E] bg-transparent",
    warning:
      "bg-[#F4B860]/10 text-[#F4B860] border border-[#F4B860]/30",
    danger:
      "bg-[#EF6B6B]/10 text-[#EF6B6B] border border-[#EF6B6B]/30",
    muted:
      "bg-[#171C20] text-[#929B9E] border border-[#272E32]/60",
  };

  const sizeStyles = {
    sm: "text-[11px] px-2 py-0.5 rounded",
    md: "text-xs px-2.5 py-1 rounded-md",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium tracking-wide uppercase transition-colors select-none",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
