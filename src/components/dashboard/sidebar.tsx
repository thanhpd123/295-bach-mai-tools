"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Activity,
    ArrowLeftRight,
    CalendarDays,
    Home,
    LayoutDashboard,
    Receipt,
    Settings,
    Users,
    type LucideIcon,
} from "lucide-react";
import { navItems, siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

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

    return (
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
            {/* Logo */}
            <div className="flex h-16 items-center gap-2.5 border-b border-slate-200 px-5">
                <div className="flex size-9 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
                    {siteConfig.shortName}
                </div>
                <div>
                    <div className="text-sm font-semibold leading-tight">
                        {siteConfig.name}
                    </div>
                    <div className="text-xs text-slate-400">Chủ nhà / Quản lý</div>
                </div>
            </div>

            {/* Menu */}
            <nav className="flex-1 space-y-1 p-3">
                {navItems.map((item) => {
                    const Icon = iconByHref[item.href] ?? LayoutDashboard;
                    const isActive =
                        pathname === item.href || pathname.startsWith(`${item.href}/`);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                            )}
                        >
                            <Icon className="size-4" />
                            {item.title}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="border-t border-slate-200 p-4 text-xs text-slate-400">
                v0.2.0 · Next.js + Prisma
            </div>
        </aside>
    );
}
