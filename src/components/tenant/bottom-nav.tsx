"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ReceiptText, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
    { href: "/app", label: "Trang chủ", icon: Home },
    { href: "/app/invoices", label: "Hoá đơn", icon: ReceiptText },
    { href: "/app/account", label: "Cá nhân", icon: UserRound },
] as const;

/**
 * Thanh điều hướng dưới dành riêng cho mobile (ẩn trên desktop ≥ sm).
 * Chừa safe-area cho iPhone có thanh home indicator.
 */
export function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#080b1b]/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-2xl sm:hidden">
            <div className="mx-auto flex h-16 max-w-3xl">
                {tabs.map(({ href, label, icon: Icon }) => {
                    const active =
                        pathname === href || pathname.startsWith(`${href}/`);
                    return (
                        <Link
                            key={href}
                            href={href}
                            aria-current={active ? "page" : undefined}
                            className={cn(
                                "flex flex-1 flex-col items-center justify-center gap-1 text-xs font-medium transition-colors",
                                active
                                    ? "text-cyan-300"
                                    : "text-slate-400 hover:text-slate-200",
                            )}
                        >
                            <Icon className="size-5" />
                            {label}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
