"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import type { HealthDto } from "@/types";

interface AuditEntry {
    id: string;
    actorName: string;
    action: string;
    entityType: string | null;
    ip: string | null;
    createdAt: string;
}

export function HealthPanel() {
    const [health, setHealth] = useState<HealthDto | null>(null);
    const [logs, setLogs] = useState<AuditEntry[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const [healthRes, logRes] = await Promise.all([
                    apiFetch<HealthDto>("/api/health/detailed"),
                    apiFetch<{ data: AuditEntry[] }>("/api/audit-logs?limit=20"),
                ]);
                setHealth(healthRes);
                setLogs(logRes.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Không thể tải dữ liệu");
            }
        };
        void load();
    }, []);

    if (error) {
        return <div className="p-10 text-center text-sm text-rose-300">{error}</div>;
    }
    if (!health) {
        return <div className="p-10 text-center text-sm text-slate-400">Đang kiểm tra...</div>;
    }

    const cards = [
        {
            label: "Trạng thái tổng thể",
            value: health.status === "ok" ? "Bình thường" : "Có vấn đề",
            variant: health.status === "ok" ? ("success" as const) : ("danger" as const),
        },
        {
            label: "Database",
            value: `${health.database === "ok" ? "Kết nối tốt" : "Lỗi"} (${health.databaseLatencyMs}ms)`,
            variant: health.database === "ok" ? ("success" as const) : ("danger" as const),
        },
        {
            label: "Webhook gần nhất",
            value: health.lastWebhookAt ? formatDate(health.lastWebhookAt) : "Chưa nhận",
            variant: "neutral" as const,
        },
        {
            label: "Giao dịch chưa khớp",
            value: String(health.unmatchedTransfers),
            variant: health.unmatchedTransfers > 0 ? ("warning" as const) : ("neutral" as const),
        },
        {
            label: "Đăng nhập thất bại (24h)",
            value: String(health.failedLogins24h),
            variant: health.failedLogins24h > 5 ? ("danger" as const) : ("neutral" as const),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {cards.map((card) => (
                    <div
                        key={card.label}
                        className="glass glass-card rounded-xl p-4"
                    >
                        <div className="text-xs text-slate-400">{card.label}</div>
                        <div className="mt-1 flex items-center gap-2">
                            <Badge variant={card.variant}>{card.value}</Badge>
                        </div>
                    </div>
                ))}
            </div>

            <div className="glass overflow-hidden rounded-xl">
                <h2 className="border-b border-white/10 px-4 py-3 font-semibold text-white">
                    Nhật ký hoạt động gần đây
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wide text-slate-400">
                            <tr>
                                <th className="px-4 py-2 font-medium">Thời gian</th>
                                <th className="px-4 py-2 font-medium">Người dùng</th>
                                <th className="px-4 py-2 font-medium">Hành động</th>
                                <th className="px-4 py-2 font-medium">IP</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {logs.map((log) => (
                                <tr key={log.id}>
                                    <td className="px-4 py-2 text-slate-400">
                                        {formatDate(log.createdAt)}
                                    </td>
                                    <td className="px-4 py-2 text-slate-200">
                                        {log.actorName}
                                    </td>
                                    <td className="px-4 py-2 text-slate-200">{log.action}</td>
                                    <td className="px-4 py-2 text-slate-400">{log.ip ?? "—"}</td>
                                </tr>
                            ))}
                            {logs.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                                        Chưa có nhật ký.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
