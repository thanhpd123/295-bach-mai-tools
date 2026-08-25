"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import type { PaymentStatus } from "@/generated/prisma/enums";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api-client";
import { paymentMethodLabels, paymentStatusLabels } from "@/lib/labels";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Paginated, PaymentDto } from "@/types";

const statusVariant: Record<
    PaymentStatus,
    "success" | "warning" | "neutral" | "danger"
> = {
    PAID: "success",
    PENDING: "warning",
    REFUNDED: "neutral",
    CANCELLED: "danger",
};

export function PaymentsList() {
    const [data, setData] = useState<Paginated<PaymentDto> | null>(null);
    const [search, setSearch] = useState("");
    const [query, setQuery] = useState("");
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let ignore = false;

        const fetchData = async () => {
            try {
                const params = new URLSearchParams({ page: String(page), limit: "10" });
                if (query) params.set("search", query);
                const result = await apiFetch<Paginated<PaymentDto>>(
                    `/api/payments?${params.toString()}`,
                );
                if (!ignore) setData(result);
            } catch (err) {
                if (!ignore) {
                    setError(err instanceof Error ? err.message : "Không thể tải dữ liệu");
                }
            } finally {
                if (!ignore) setLoading(false);
            }
        };

        void fetchData();

        return () => {
            ignore = true;
        };
    }, [page, query]);

    const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setPage(1);
        setQuery(search);
    };

    const goToPage = (next: number) => {
        setLoading(true);
        setPage(next);
    };

    const { data: payments, meta } = data ?? { data: [], meta: null };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Tìm theo mã phiếu hoặc tên bệnh nhân..."
                        className="pl-9"
                    />
                </div>
                <Button type="submit" variant="outline">
                    Tìm kiếm
                </Button>
            </form>

            {/* Bảng dữ liệu */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                {loading ? (
                    <div className="p-10 text-center text-sm text-slate-500">
                        Đang tải dữ liệu...
                    </div>
                ) : error ? (
                    <div className="space-y-3 p-10 text-center">
                        <p className="text-sm text-red-600">{error}</p>
                        <p className="text-xs text-slate-400">
                            Kiểm tra DATABASE_URL và chạy{" "}
                            <code className="rounded bg-slate-100 px-1.5 py-0.5">
                                npm run db:migrate
                            </code>
                        </p>
                    </div>
                ) : payments.length === 0 ? (
                    <div className="p-10 text-center text-sm text-slate-500">
                        Chưa có phiếu thanh toán nào.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Mã phiếu</th>
                                    <th className="px-4 py-3 font-medium">Bệnh nhân</th>
                                    <th className="px-4 py-3 font-medium">Phương thức</th>
                                    <th className="px-4 py-3 font-medium">Trạng thái</th>
                                    <th className="px-4 py-3 text-right font-medium">Tổng tiền</th>
                                    <th className="px-4 py-3 font-medium">Ngày tạo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {payments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 font-medium text-slate-900">
                                            {payment.code}
                                        </td>
                                        <td className="px-4 py-3 text-slate-700">
                                            {payment.patientName}
                                        </td>
                                        <td className="px-4 py-3 text-slate-700">
                                            {paymentMethodLabels[payment.method]}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant={statusVariant[payment.status]}>
                                                {paymentStatusLabels[payment.status]}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium text-slate-900">
                                            {formatCurrency(payment.totalAmount)}
                                        </td>
                                        <td className="px-4 py-3 text-slate-500">
                                            {formatDate(payment.createdAt)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Phân trang */}
                {meta && (
                    <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm text-slate-500">
                        <span>
                            Trang {meta.page}/{Math.max(meta.totalPages, 1)} · {meta.total} kết
                            quả
                        </span>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page <= 1}
                                onClick={() => goToPage(Math.max(1, page - 1))}
                            >
                                Trước
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page >= meta.totalPages}
                                onClick={() => goToPage(page + 1)}
                            >
                                Sau
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
