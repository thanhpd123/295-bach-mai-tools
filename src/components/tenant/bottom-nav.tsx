"use client";

import { Home, ReceiptText, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

export type TenantTab = "home" | "invoices" | "account";

const tabs = [
    { key: "home", label: "Trang chủ", icon: Home },
    { key: "invoices", label: "Hoá đơn", icon: ReceiptText },
    { key: "account", label: "Cá nhân", icon: UserRound },
] as const;

/**
 * Thanh điều hướng dưới dành riêng cho mobile (ẩn trên desktop ≥ sm).
 * Hoạt động theo kiểu ứng dụng di động: bấm tab chỉ đổi view, không tải lại trang.
 * Chừa safe-area cho iPhone có thanh home indicator.
 */
export function BottomNav({
    active,
    onSelect,
}: {
    active: TenantTab;
    onSelect: (tab: TenantTab) => void;
}) {
    return (
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#080b1b]/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-2xl sm:hidden">
            <div className="mx-auto flex h-16 max-w-3xl">
                {tabs.map(({ key, label, icon: Icon }) => {
                    const isActive = key === active;
                    return (
                        <button
                            key={key}
                            type="button"
                            onClick={() => onSelect(key)}
                            aria-current={isActive ? "page" : undefined}
                            className={cn(
                                "flex flex-1 flex-col items-center justify-center gap-1 text-xs font-medium transition-colors",
                                isActive
                                    ? "text-cyan-300"
                                    : "text-slate-400 hover:text-slate-200",
                            )}
                        >
                            <Icon className="size-5" />
                            {label}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
