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

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Tổng quan
                </h1>
                <p className="text-sm text-slate-500">
                    Tình hình phòng trọ và thu tiền của kỳ hiện tại.
                </p>
            </div>

            {/* Stat cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {statCards.map((card) => (
                    <Card key={card.label}>
                        <CardHeader className="flex-row items-center justify-between space-y-0">
                            <CardDescription>{card.label}</CardDescription>
                            <card.icon className="size-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{card.value}</div>
                            <div className="mt-1 text-xs text-slate-500">{card.sub}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Quick actions */}
            <Card>
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
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                    >
                        Mở kỳ & nhập chỉ số <ArrowRight className="size-4" />
                    </Link>
                    <Link
                        href="/dashboard/invoices"
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                    >
                        Xem hoá đơn
                    </Link>
                    <Link
                        href="/dashboard/rooms"
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                    >
                        Cập nhật phòng trống
                    </Link>
                </CardContent>
            </Card>

            {stats.overdueInvoices > 0 && (
                <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    <AlertTriangle className="size-4 shrink-0" />
                    Có {stats.overdueInvoices} hoá đơn quá hạn cần nhắc người thuê.
                </div>
            )}
        </div>
    );
}
