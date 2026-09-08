import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes } from "react";

export const Input = forwardRef<
    HTMLInputElement,
    InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
    <input
        ref={ref}
        className={cn(
            "flex h-11 w-full rounded-lg border border-white/15 bg-white/5 px-3 text-base text-white shadow-sm placeholder:text-slate-500 focus:border-cyan-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 disabled:pointer-events-none disabled:opacity-50",
            className,
        )}
        {...props}
    />
));
Input.displayName = "Input";
