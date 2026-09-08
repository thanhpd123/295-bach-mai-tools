import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "neutral";

const variantClasses: Record<BadgeVariant, string> = {
    default: "bg-cyan-400/10 text-cyan-300 ring-cyan-400/20",
    success: "bg-emerald-400/10 text-emerald-300 ring-emerald-400/20",
    warning: "bg-amber-400/10 text-amber-300 ring-amber-400/20",
    danger: "bg-rose-400/10 text-rose-300 ring-rose-400/20",
    neutral: "bg-white/10 text-slate-300 ring-white/15",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant;
}

export function Badge({
    className,
    variant = "default",
    ...props
}: BadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
                variantClasses[variant],
                className,
            )}
            {...props}
        />
    );
}
