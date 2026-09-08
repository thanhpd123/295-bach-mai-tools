import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg" | "xl";

const variantClasses: Record<Variant, string> = {
    primary:
        "bg-linear-to-r from-teal-600 to-cyan-500 text-white shadow-[0_0_18px_rgba(34,211,238,0.18)] hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]",
    secondary: "bg-white/10 text-white hover:bg-white/15",
    outline:
        "border border-white/15 bg-white/5 text-slate-200 backdrop-blur-xl hover:border-cyan-300/40 hover:bg-white/10 hover:text-white",
    ghost: "text-slate-300 hover:bg-white/10 hover:text-white",
    destructive:
        "bg-rose-500/10 text-rose-300 hover:bg-rose-500/20",
};

const sizeClasses: Record<Size, string> = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-11 px-6 text-base",
    xl: "h-12 w-full px-6 text-base",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", ...props }, ref) => (
        <button
            ref={ref}
            className={cn(
                "inline-flex touch-manipulation items-center justify-center gap-2 rounded-lg font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 disabled:pointer-events-none disabled:opacity-50",
                variantClasses[variant],
                sizeClasses[size],
                className,
            )}
            {...props}
        />
    ),
);
Button.displayName = "Button";
