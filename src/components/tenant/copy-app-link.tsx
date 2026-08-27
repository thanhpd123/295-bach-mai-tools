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
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 active:bg-slate-100"
        >
            {copied ? (
                <Check className="size-4 text-emerald-600" />
            ) : (
                <LinkIcon className="size-4 text-slate-400" />
            )}
            {copied ? "Đã sao chép link" : "Sao chép link đăng nhập"}
        </button>
    );
}
