import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "secondary", size = "md", children, ...props },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#B9F36A] disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer";

    const variantStyles = {
      primary:
        "bg-[#B9F36A] text-[#0B0D0F] hover:bg-[#A4DF55] active:bg-[#92CF44] font-semibold shadow-sm",
      secondary:
        "bg-[#171C20] text-[#F5F7F2] border border-[#272E32] hover:bg-[#1E252A] hover:border-[#373F45]",
      outline:
        "border border-[#272E32] text-[#F5F7F2] bg-transparent hover:bg-[#171C20] hover:border-[#373F45]",
      ghost:
        "text-[#929B9E] hover:text-[#F5F7F2] hover:bg-[#171C20] bg-transparent",
      danger:
        "bg-[#EF6B6B]/15 text-[#EF6B6B] border border-[#EF6B6B]/40 hover:bg-[#EF6B6B]/25",
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-xs rounded-md gap-1.5",
      md: "h-9 px-4 text-sm rounded-md gap-2",
      lg: "h-10 px-5 text-sm rounded-md gap-2.5",
      icon: "h-9 w-9 rounded-md justify-center p-0",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
