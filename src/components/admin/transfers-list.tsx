"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api-client";
import { transferStatusLabels } from "@/lib/labels";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Paginated, TransferRecordDto } from "@/types";
import type { TransferStatus } from "@/generated/prisma/enums";

const statusVariant: Record<TransferStatus, "success" | "warning" | "danger" | "neutral"> = {
    MATCHED: "success",
    UNMATCHED: "warning",
    DUPLICATE: "neutral",
    REVIEW: "danger",
};

export function TransfersList() {
    const [data, setData] = useState<Paginated<TransferRecordDto> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const result = await apiFetch<Paginated<TransferRecordDto>>(
                    "/api/transfers?limit=50",
                );
                setData(result);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Không thể tải dữ liệu");
            } finally {
                setLoading(false);
            }
        };
        void load();
    }, []);

    const records = data?.data ?? [];

    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {loading ? (
                <div className="p-10 text-center text-sm text-slate-500">Đang tải...</div>
            ) : error ? (
                <div className="p-10 text-center text-sm text-red-600">{error}</div>
            ) : records.length === 0 ? (
                <div className="p-10 text-center text-sm text-slate-500">
                    Chưa có giao dịch nào.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                            <tr>
                                <th className="px-4 py-3 font-medium">Thời gian</th>
                                <th className="px-4 py-3 font-medium">Số tiền</th>
                                <th className="px-4 py-3 font-medium">Nội dung</th>
                                <th className="px-4 py-3 font-medium">Tài khoản gửi</th>
                                <th className="px-4 py-3 font-medium">Hoá đơn khớp</th>
                                <th className="px-4 py-3 font-medium">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {records.map((record) => (
                                <tr key={record.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-slate-500">
                                        {formatDate(record.transferAt ?? record.createdAt)}
                                    </td>
                                    <td className="px-4 py-3 font-medium text-slate-900">
                                        {formatCurrency(record.amount)}
                                    </td>
                                    <td className="px-4 py-3 text-slate-700">
                                        {record.content ?? "—"}
                                    </td>
                                    <td className="px-4 py-3 text-slate-500">
                                        {record.sourceAccount ?? "—"}
                                    </td>
                                    <td className="px-4 py-3 text-slate-700">
                                        {record.invoiceCode ?? "—"}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge variant={statusVariant[record.status]}>
                                            {transferStatusLabels[record.status]}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
