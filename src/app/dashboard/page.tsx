import Link from "next/link";
import {
    AlertTriangle,
    ArrowRight,
    Banknote,
    CircleDollarSign,
    DoorOpen,
    Home,
    Receipt,
    Users,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { getDashboardStats } from "@/lib/services/dashboard.service";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

/** Trang tổng quan (chủ nhà/quản lý). */
export default async function DashboardPage() {
    const stats = await getDashboardStats();

    const statCards = [
        {
            icon: Home,
            label: "Tổng số phòng",
            value: String(stats.totalRooms),
            sub: `${stats.vacantRooms} trống · ${stats.maintenanceRooms} bảo trì`,
        },
        {
            icon: Users,
            label: "Đang cho thuê",
            value: String(stats.occupiedRooms),
            sub: `Tỷ lệ lấp đầy ${stats.totalRooms ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100) : 0}%`,
        },
        {
            icon: Receipt,
            label: "Chờ thanh toán",
            value: String(stats.pendingInvoices),
            sub: `${stats.overdueInvoices} hoá đơn quá hạn`,
        },
        {
            icon: CircleDollarSign,
            label: "Doanh thu kỳ này",
            value: formatCurrency(stats.monthRevenue),
            sub: stats.currentPeriodCode ? `Kỳ ${stats.currentPeriodCode}` : "Chưa mở kỳ",
        },
        {
            icon: Banknote,
            label: "Đã thu kỳ này",
            value: formatCurrency(stats.monthCollected),
            sub: `Còn ${formatCurrency(stats.monthOutstanding)} chưa thu`,
        },
        {
            icon: DoorOpen,
            label: "Hạn thanh toán",
            value: stats.currentPeriodDueDate
                ? formatDate(stats.currentPeriodDueDate)
                : "—",
            sub: "Hạn chót của kỳ hiện tại",
        },
    ];

    const todayLabel = new Date().toLocaleDateString("vi-VN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    return (
        <div className="space-y-6">
            {/* Hero */}
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-[0.24em] text-cyan-300/70">
                        {todayLabel}
                    </p>
                    <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                        Tổng quan<span className="text-cyan-300">.</span>
                    </h1>
                    <p className="mt-2 text-sm text-slate-400">
                        Tình hình phòng trọ và thu tiền của kỳ hiện tại.
                    </p>
                </div>
            </div>

            {/* Stat cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {statCards.map((card) => (
                    <Card key={card.label} className="glass-card">
                        <CardHeader className="flex-row items-center justify-between space-y-0">
                            <CardDescription>{card.label}</CardDescription>
                            <div className="rounded-xl border border-white/10 bg-white/10 p-2.5 text-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.15)]">
                                <card.icon className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold tracking-tight text-white tabular-nums">
                                {card.value}
                            </div>
                            <div className="mt-1 text-xs text-slate-400">
                                {card.sub}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Quick actions */}
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>Thao tác nhanh</CardTitle>
                    <CardDescription>
                        Quy trình hằng tháng: mở kỳ → nhập chỉ số → tạo hoá đơn → người thuê
                        quét QR thanh toán.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                    <Link
                        href="/dashboard/billing"
                        className="inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-teal-600 to-cyan-500 px-4 py-2 text-sm font-medium text-white shadow-[0_0_18px_rgba(34,211,238,0.18)] transition-all hover:brightness-110"
                    >
                        Mở kỳ & nhập chỉ số <ArrowRight className="size-4" />
                    </Link>
                    <Link
                        href="/dashboard/invoices"
                        className="glass-button inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-200"
                    >
                        Xem hoá đơn
                    </Link>
                    <Link
                        href="/dashboard/rooms"
                        className="glass-button inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-200"
                    >
                        Cập nhật phòng trống
                    </Link>
                </CardContent>
            </Card>

            {stats.overdueInvoices > 0 && (
                <div className="flex items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-300">
                    <AlertTriangle className="size-4 shrink-0" />
                    Có {stats.overdueInvoices} hoá đơn quá hạn cần nhắc người thuê.
                </div>
            )}
        </div>
    );
}
