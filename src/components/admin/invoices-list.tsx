"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api-client";
import { invoiceStatusLabels } from "@/lib/labels";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { InvoiceDto, InvoiceItemDto, Paginated } from "@/types";
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

    const cancelInvoice = async (invoice: InvoiceDto) => {
        if (
            !window.confirm(
                `Huỷ hoá đơn ${invoice.code}? Hoá đơn sẽ chuyển sang trạng thái "Đã huỷ".`,
            )
        )
            return;
        try {
            await apiFetch(`/api/invoices/${invoice.id}`, {
                method: "PATCH",
                body: JSON.stringify({ status: "CANCELLED" }),
            });
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Huỷ hoá đơn thất bại");
        }
    };

    const saveItems = async (
        invoiceId: string,
        payload: {
            note?: string;
            items: { id: string; quantity: number; unitPrice: number }[];
        },
    ) => {
        try {
            const updated = await apiFetch<InvoiceDto>(
                `/api/invoices/${invoiceId}/items`,
                {
                    method: "PATCH",
                    body: JSON.stringify(payload),
                },
            );
            await load();
            return updated;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Lưu chỉnh sửa thất bại");
            return null;
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
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
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
                    className="h-10 rounded-lg border border-white/15 bg-white/5 px-3 text-sm text-white"
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
                <div className="rounded-lg bg-rose-500/10 px-4 py-2 text-sm text-rose-300">
                    {error}
                </div>
            )}

            <div className="glass overflow-hidden rounded-xl">
                {loading ? (
                    <div className="p-10 text-center text-sm text-slate-400">
                        Đang tải...
                    </div>
                ) : invoices.length === 0 ? (
                    <div className="p-10 text-center text-sm text-slate-400">
                        Chưa có hoá đơn nào.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wide text-slate-400">
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
                            <tbody className="divide-y divide-white/5">
                                {invoices.map((invoice) => (
                                    <InvoiceRow
                                        key={invoice.id}
                                        invoice={invoice}
                                        expanded={expanded === invoice.id}
                                        onToggle={() =>
                                            setExpanded(expanded === invoice.id ? null : invoice.id)
                                        }
                                        onMarkPaid={() => markPaid(invoice)}
                                        onCancel={() => cancelInvoice(invoice)}
                                        onSaveItems={saveItems}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {meta && (
                    <div className="flex items-center justify-between border-t border-white/10 px-4 py-3 text-sm text-slate-400">
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

function buildEdits(
    items: InvoiceItemDto[],
): Record<string, { quantity: string; unitPrice: string }> {
    const edits: Record<string, { quantity: string; unitPrice: string }> = {};
    for (const item of items) {
        edits[item.id] = {
            quantity: String(item.quantity),
            unitPrice: String(item.unitPrice),
        };
    }
    return edits;
}

function InvoiceRow({
    invoice,
    expanded,
    onToggle,
    onMarkPaid,
    onCancel,
    onSaveItems,
}: {
    invoice: InvoiceDto;
    expanded: boolean;
    onToggle: () => void;
    onMarkPaid: () => void;
    onCancel: () => void;
    onSaveItems: (
        invoiceId: string,
        payload: {
            note?: string;
            items: { id: string; quantity: number; unitPrice: number }[];
        },
    ) => Promise<InvoiceDto | null>;
}) {
    const [edits, setEdits] = useState<
        Record<string, { quantity: string; unitPrice: string }>
    >(() => buildEdits(invoice.items));
    const [note, setNote] = useState(invoice.note ?? "");
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const editable = invoice.status === "DRAFT" || invoice.status === "PENDING";

    const setEdit = (
        itemId: string,
        field: "quantity" | "unitPrice",
        value: string,
    ) => {
        setEdits((prev) => ({
            ...prev,
            [itemId]: { ...prev[itemId], [field]: value },
        }));
    };

    const previewTotal = invoice.items.reduce((sum, item) => {
        const e = edits[item.id];
        if (!e) return sum + item.total;
        return sum + Number(e.quantity || 0) * Number(e.unitPrice || 0);
    }, 0);

    const save = async () => {
        setSaving(true);
        setSaveError(null);
        try {
            const items = invoice.items.map((item) => {
                const e = edits[item.id] ?? {
                    quantity: String(item.quantity),
                    unitPrice: String(item.unitPrice),
                };
                return {
                    id: item.id,
                    quantity: Number(e.quantity || 0),
                    unitPrice: Number(e.unitPrice || 0),
                };
            });
            const updated = await onSaveItems(invoice.id, {
                note: note.trim() || undefined,
                items,
            });
            if (updated) {
                setEdits(buildEdits(updated.items));
                setNote(updated.note ?? "");
            }
        } catch (err) {
            setSaveError(err instanceof Error ? err.message : "Lưu chỉnh sửa thất bại");
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <tr className="hover:bg-white/5">
                <td className="px-4 py-3">
                    <button onClick={onToggle} className="text-slate-500 hover:text-slate-200">
                        {expanded ? (
                            <ChevronDown className="size-4" />
                        ) : (
                            <ChevronRight className="size-4" />
                        )}
                    </button>
                </td>
                <td className="px-4 py-3 font-medium text-white">{invoice.code}</td>
                <td className="px-4 py-3 text-slate-200">{invoice.roomNumber}</td>
                <td className="px-4 py-3 text-slate-200">{invoice.tenantName ?? "—"}</td>
                <td className="px-4 py-3">
                    <Badge variant={statusVariant[invoice.status]}>
                        {invoiceStatusLabels[invoice.status]}
                    </Badge>
                </td>
                <td className="px-4 py-3 text-right font-medium text-white">
                    {formatCurrency(invoice.totalAmount)}
                </td>
                <td className="px-4 py-3 text-slate-400">{formatDate(invoice.dueDate)}</td>
                <td className="px-4 py-3">
                    {invoice.status !== "PAID" && invoice.status !== "CANCELLED" && (
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={onMarkPaid}>
                                Xác nhận đã thu
                            </Button>
                            <Button size="sm" variant="ghost" onClick={onCancel}>
                                Huỷ
                            </Button>
                        </div>
                    )}
                </td>
            </tr>
            {expanded && (
                <tr className="bg-white/5">
                    <td colSpan={8} className="px-10 py-3">
                        <div className="text-xs text-slate-300">
                            <div className="mb-1 font-medium">Chi tiết khoản phí:</div>
                            <ul className="space-y-1">
                                {invoice.items.map((item) => {
                                    const e = edits[item.id] ?? {
                                        quantity: String(item.quantity),
                                        unitPrice: String(item.unitPrice),
                                    };
                                    const qty = Number(e.quantity || 0);
                                    const price = Number(e.unitPrice || 0);
                                    return (
                                        <li
                                            key={item.id}
                                            className="flex items-center justify-between gap-4"
                                        >
                                            <span className="min-w-40">{item.description}</span>
                                            {editable ? (
                                                <span className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        step={1}
                                                        value={e.quantity}
                                                        onChange={(ev) =>
                                                            setEdit(item.id, "quantity", ev.target.value)
                                                        }
                                                        className="h-7 w-16 rounded border border-white/15 bg-white/5 px-1 text-right text-white"
                                                    />
                                                    <span>×</span>
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        step={1}
                                                        value={e.unitPrice}
                                                        onChange={(ev) =>
                                                            setEdit(item.id, "unitPrice", ev.target.value)
                                                        }
                                                        className="h-7 w-24 rounded border border-white/15 bg-white/5 px-1 text-right text-white"
                                                    />
                                                    <span className="text-slate-400">đ</span>
                                                </span>
                                            ) : (
                                                <span>× {item.quantity}</span>
                                            )}
                                            <span className="tabular-nums">
                                                {editable
                                                    ? formatCurrency(qty * price)
                                                    : formatCurrency(item.total)}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                            {editable && (
                                <div className="mt-3 space-y-2">
                                    <input
                                        value={note}
                                        onChange={(ev) => setNote(ev.target.value)}
                                        placeholder="Ghi chú (vd: Nghỉ hè – miễn thang máy)"
                                        className="h-8 w-full rounded border border-white/15 bg-white/5 px-2 text-white"
                                    />
                                    <div className="flex items-center gap-2">
                                        <Button size="sm" onClick={save} disabled={saving}>
                                            {saving ? "Đang lưu..." : "Lưu chỉnh sửa"}
                                        </Button>
                                        {saveError && (
                                            <span className="text-rose-300">{saveError}</span>
                                        )}
                                    </div>
                                </div>
                            )}
                            <div className="mt-2 border-t border-white/10 pt-1 font-semibold">
                                Tổng:{" "}
                                {formatCurrency(
                                    editable ? previewTotal : invoice.totalAmount,
                                )}
                                {invoice.paidAt && (
                                    <span className="ml-2 font-normal text-emerald-400">
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
