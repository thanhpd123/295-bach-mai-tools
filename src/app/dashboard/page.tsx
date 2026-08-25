import Link from "next/link";
import { ArrowRight, CreditCard, Receipt, Users } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

/**
 * Trang tổng quan (dashboard).
 * Các số liệu dưới đây là mẫu — khi có dữ liệu thật, gọi API trong
 * Server Component bằng cách dùng trực tiếp service layer (src/lib/services).
 */
export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Tổng quan
                </h1>
                <p className="text-sm text-slate-500">
                    Chào mừng bạn trở lại, đây là bảng điều khiển quản lý thanh toán.
                </p>
            </div>

            {/* Stat cards */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                    <CardHeader className="flex-row items-center justify-between space-y-0">
                        <CardDescription>Tổng phiếu thu</CardDescription>
                        <Receipt className="size-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">—</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex-row items-center justify-between space-y-0">
                        <CardDescription>Bệnh nhân</CardDescription>
                        <Users className="size-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">—</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex-row items-center justify-between space-y-0">
                        <CardDescription>Doanh thu</CardDescription>
                        <CreditCard className="size-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">—</div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Bắt đầu nhanh</CardTitle>
                    <CardDescription>
                        Kết nối database rồi tạo dữ liệu mẫu để xem luồng hoạt động.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-slate-600">
                    <ol className="list-inside list-decimal space-y-1">
                        <li>Cấu hình <code className="rounded bg-slate-100 px-1.5 py-0.5">DATABASE_URL</code> trong <code className="rounded bg-slate-100 px-1.5 py-0.5">.env</code></li>
                        <li>Chạy <code className="rounded bg-slate-100 px-1.5 py-0.5">npm run db:migrate</code> để tạo bảng</li>
                        <li>Chạy <code className="rounded bg-slate-100 px-1.5 py-0.5">npm run db:seed</code> để thêm dữ liệu mẫu</li>
                    </ol>
                    <Link
                        href="/dashboard/payments"
                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                    >
                        Xem danh sách thanh toán <ArrowRight className="size-4" />
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}
