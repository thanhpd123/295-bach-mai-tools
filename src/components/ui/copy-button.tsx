"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Nút sao chép nội dung vào clipboard kèm phản hồi "Đã sao chép".
 * Dùng cho phần thanh toán của người thuê (số tài khoản, nội dung CK, số tiền).
 */
export function CopyButton({
    value,
    label,
    className,
}: {
    value: string;
    label: string;
    className?: string;
}) {
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(value);
        } catch {
            // Fallback cho trình duyệt cũ / non-secure context.
            const textarea = document.createElement("textarea");
            textarea.value = value;
            textarea.style.position = "fixed";
            textarea.style.opacity = "0";
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <button
            type="button"
            onClick={copy}
            className={cn(
                "flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 active:bg-slate-100",
                copied && "border-emerald-300 bg-emerald-50 text-emerald-700",
                className,
            )}
        >
            <span>{copied ? "Đã sao chép ✓" : label}</span>
            {copied ? (
                <Check className="size-4 text-emerald-600" />
            ) : (
                <Copy className="size-4 text-slate-400" />
            )}
        </button>
    );
}
