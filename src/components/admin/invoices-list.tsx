"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api-client";
import { invoiceStatusLabels } from "@/lib/labels";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { InvoiceDto, Paginated } from "@/types";
import type { InvoiceStatus } from "@/generated/prisma/enums";

const statusVariant: Record<InvoiceStatus, "success" | "warning" | "danger" | "neutral"> = {
    PAID: "success",
    PENDING: "warning",
    OVERDUE: "danger",
    DRAFT: "neutral",
    CANCELLED: "danger",
};

export function InvoicesList() {
    const [data, setData] = useState<Paginated<InvoiceDto> | null>(null);
    const [search, setSearch] = useState("");
    const [query, setQuery] = useState("");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), limit: "20" });
            if (query) params.set("search", query);
            if (status) params.set("status", status);
            const result = await apiFetch<Paginated<InvoiceDto>>(
                `/api/invoices?${params.toString()}`,
            );
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Không thể tải dữ liệu");
        } finally {
            setLoading(false);
        }
    }, [page, query, status]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- tải dữ liệu bất đồng bộ khi mount
        void load();
    }, [load]);

    const markPaid = async (invoice: InvoiceDto) => {
        if (!window.confirm(`Xác nhận hoá đơn ${invoice.code} đã thanh toán?`)) return;
        try {
            await apiFetch(`/api/invoices/${invoice.id}/mark-paid`, {
                method: "POST",
                body: JSON.stringify({ method: "BANK_TRANSFER" }),
            });
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Xác nhận thất bại");
        }
    };

    const invoices = data?.data ?? [];
    const meta = data?.meta ?? null;

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    setPage(1);
                    setQuery(search);
                }}
                className="flex flex-wrap gap-2"
            >
                <div className="relative flex-1 min-w-48">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Tìm theo mã hoá đơn, phòng, người thuê..."
                        className="pl-9"
                    />
                </div>
                <select
                    value={status}
                    onChange={(e) => {
                        setStatus(e.target.value);
                        setPage(1);
                    }}
                    className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"
                >
                    <option value="">Tất cả trạng thái</option>
                    <option value="PENDING">Chờ thanh toán</option>
                    <option value="PAID">Đã thanh toán</option>
                    <option value="OVERDUE">Quá hạn</option>
                    <option value="DRAFT">Nháp</option>
                    <option value="CANCELLED">Đã huỷ</option>
                </select>
                <Button type="submit" variant="outline">
                    Tìm kiếm
                </Button>
            </form>

            {error && (
                <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                {loading ? (
                    <div className="p-10 text-center text-sm text-slate-500">
                        Đang tải...
                    </div>
                ) : invoices.length === 0 ? (
                    <div className="p-10 text-center text-sm text-slate-500">
                        Chưa có hoá đơn nào.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="px-4 py-3 font-medium" />
                                    <th className="px-4 py-3 font-medium">Mã</th>
                                    <th className="px-4 py-3 font-medium">Phòng</th>
                                    <th className="px-4 py-3 font-medium">Người thuê</th>
                                    <th className="px-4 py-3 font-medium">Trạng thái</th>
                                    <th className="px-4 py-3 text-right font-medium">Tổng tiền</th>
                                    <th className="px-4 py-3 font-medium">Hạn</th>
                                    <th className="px-4 py-3 font-medium">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {invoices.map((invoice) => (
                                    <InvoiceRow
                                        key={invoice.id}
                                        invoice={invoice}
                                        expanded={expanded === invoice.id}
                                        onToggle={() =>
                                            setExpanded(expanded === invoice.id ? null : invoice.id)
                                        }
                                        onMarkPaid={() => markPaid(invoice)}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {meta && (
                    <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm text-slate-500">
                        <span>
                            Trang {meta.page}/{Math.max(meta.totalPages, 1)} · {meta.total} hoá
                            đơn
                        </span>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page <= 1}
                                onClick={() => setPage(Math.max(1, page - 1))}
                            >
                                Trước
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page >= meta.totalPages}
                                onClick={() => setPage(page + 1)}
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

function InvoiceRow({
    invoice,
    expanded,
    onToggle,
    onMarkPaid,
}: {
    invoice: InvoiceDto;
    expanded: boolean;
    onToggle: () => void;
    onMarkPaid: () => void;
}) {
    return (
        <>
            <tr className="hover:bg-slate-50">
                <td className="px-4 py-3">
                    <button onClick={onToggle} className="text-slate-400 hover:text-slate-600">
                        {expanded ? (
                            <ChevronDown className="size-4" />
                        ) : (
                            <ChevronRight className="size-4" />
                        )}
                    </button>
                </td>
                <td className="px-4 py-3 font-medium text-slate-900">{invoice.code}</td>
                <td className="px-4 py-3 text-slate-700">{invoice.roomNumber}</td>
                <td className="px-4 py-3 text-slate-700">{invoice.tenantName ?? "—"}</td>
                <td className="px-4 py-3">
                    <Badge variant={statusVariant[invoice.status]}>
                        {invoiceStatusLabels[invoice.status]}
                    </Badge>
                </td>
                <td className="px-4 py-3 text-right font-medium text-slate-900">
                    {formatCurrency(invoice.totalAmount)}
                </td>
                <td className="px-4 py-3 text-slate-500">{formatDate(invoice.dueDate)}</td>
                <td className="px-4 py-3">
                    {invoice.status !== "PAID" && invoice.status !== "CANCELLED" && (
                        <Button size="sm" variant="outline" onClick={onMarkPaid}>
                            Xác nhận đã thu
                        </Button>
                    )}
                </td>
            </tr>
            {expanded && (
                <tr className="bg-slate-50/60">
                    <td colSpan={8} className="px-10 py-3">
                        <div className="text-xs text-slate-600">
                            <div className="mb-1 font-medium">Chi tiết khoản phí:</div>
                            <ul className="space-y-1">
                                {invoice.items.map((item) => (
                                    <li key={item.id} className="flex justify-between gap-4">
                                        <span>
                                            {item.description} × {item.quantity}
                                        </span>
                                        <span className="tabular-nums">
                                            {formatCurrency(item.total)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-2 border-t border-slate-200 pt-1 font-semibold">
                                Tổng: {formatCurrency(invoice.totalAmount)}
                                {invoice.paidAt && (
                                    <span className="ml-2 font-normal text-emerald-600">
                                        · đã thu {formatDate(invoice.paidAt)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}
