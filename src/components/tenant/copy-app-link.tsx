"use client";

import { useState } from "react";
import { Check, LinkIcon } from "lucide-react";

/** Sao chép link đăng nhập của cổng người thuê để gửi qua Zalo/Messenger. */
export function CopyAppLink() {
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        const url = `${window.location.origin}/app`;
        try {
            await navigator.clipboard.writeText(url);
        } catch {
            // fallback
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <button
            type="button"
            onClick={copy}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10"
        >
            {copied ? (
                <Check className="size-4 text-emerald-400" />
            ) : (
                <LinkIcon className="size-4 text-slate-400" />
            )}
            {copied ? "Đã sao chép link" : "Sao chép link đăng nhập"}
        </button>
    );
}
