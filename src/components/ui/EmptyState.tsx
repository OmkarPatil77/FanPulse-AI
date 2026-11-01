import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Button } from "./Button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "bg-[#171C20] border border-[#272E32] rounded-lg p-8 sm:p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto",
        className
      )}
    >
      <div className="w-12 h-12 rounded-lg bg-[#121619] border border-[#272E32] flex items-center justify-center text-[#929B9E] mb-4">
        <Icon className="w-6 h-6" />
      </div>

      <h3 className="text-base font-bold text-[#F5F7F2] mb-1.5">{title}</h3>

      <p className="text-xs text-[#929B9E] max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {actionLabel && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
