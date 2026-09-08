"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
    Activity,
    ArrowLeftRight,
    CalendarDays,
    Home,
    LayoutDashboard,
    Menu,
    Receipt,
    Settings,
    Users,
    X,
    type LucideIcon,
} from "lucide-react";
import { navItems, siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/ui/logo-mark";

/** Map icon theo từng mục menu */
const iconByHref: Record<string, LucideIcon> = {
    "/dashboard": LayoutDashboard,
    "/dashboard/rooms": Home,
    "/dashboard/tenants": Users,
    "/dashboard/billing": CalendarDays,
    "/dashboard/invoices": Receipt,
    "/dashboard/transfers": ArrowLeftRight,
    "/dashboard/settings": Settings,
    "/dashboard/health": Activity,
};

export function Sidebar() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const close = () => setOpen(false);

    return (
        <>
            {/* Nút mở menu trên mobile */}
            <button
                aria-label="Mở menu"
                onClick={() => setOpen(true)}
                className="glass-button fixed left-3 top-3 z-50 rounded-xl p-2.5 text-slate-300 hover:text-cyan-200 lg:hidden"
            >
                <Menu size={20} />
            </button>

            {/* Lớp phủ khi mở menu trên mobile */}
            {open && (
                <button
                    aria-label="Đóng menu"
                    onClick={close}
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                />
            )}

            <aside
                className={cn(
                    "glass fixed z-50 flex w-64 flex-col rounded-2xl p-4 transition-transform duration-300",
                    "inset-y-3 left-3",
                    "lg:inset-y-0 lg:left-0 lg:rounded-none lg:border-y-0 lg:border-l-0",
                    open ? "translate-x-0" : "-translate-x-[120%] lg:translate-x-0",
                )}
            >
                {/* Logo */}
                <div className="mb-8 flex items-center justify-between px-2">
                    <Link
                        href="/dashboard"
                        onClick={close}
                        className="flex min-w-0 items-center gap-3"
                    >
                        <div className="flex size-9 shrink-0 items-center justify-center">
                            <LogoMark className="size-9" />
                        </div>
                        <div className="min-w-0">
                            <div className="truncate text-sm font-semibold leading-tight text-white">
                                {siteConfig.name}
                            </div>
                            <div className="text-[10px] uppercase tracking-[0.2em] text-cyan-300/70">
                                Chủ nhà / Quản lý
                            </div>
                        </div>
                    </Link>
                    <button
                        aria-label="Đóng menu"
                        onClick={close}
                        className="text-slate-500 hover:text-white lg:hidden"
                    >
                        <X size={18} />
                    </button>
                </div>

                <p className="mb-2 px-2 text-[10px] uppercase tracking-[0.18em] text-slate-500">
                    Quản lý
                </p>

                {/* Menu */}
                <nav className="flex flex-1 flex-col gap-1">
                    {navItems.map((item) => {
                        const Icon = iconByHref[item.href] ?? LayoutDashboard;
                        const isActive =
                            item.href === "/dashboard"
                                ? pathname === item.href
                                : pathname === item.href ||
                                pathname.startsWith(`${item.href}/`);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={close}
                                className={cn(
                                    "nav-item",
                                    isActive && "nav-item-active",
                                )}
                            >
                                <Icon size={18} />
                                <span>{item.title}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="mt-auto border-t border-white/10 pt-4">
                    <p className="px-2 text-[10px] uppercase tracking-[0.18em] text-slate-500">
                        ● v0.3.0 · Aurora
                    </p>
                </div>
            </aside>
        </>
    );
}
