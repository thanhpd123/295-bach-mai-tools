"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api-client";
import type { Paginated, RoomDto, TenantDto } from "@/types";

const selectClass =
    "h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm";

export function TenantsManager() {
    const [tenants, setTenants] = useState<TenantDto[]>([]);
    const [rooms, setRooms] = useState<RoomDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

    // Form tạo người thuê
    const [form, setForm] = useState({
        fullName: "",
        phone: "",
        idCard: "",
        username: "",
        password: "",
    });
    // Form chuyển vào phòng
    const [moveIn, setMoveIn] = useState({ tenantId: "", roomId: "", startDate: "" });

    const load = useCallback(async () => {
        try {
            const params = new URLSearchParams({ limit: "200" });
            if (filter !== "all") params.set("status", filter);
            const [tenantRes, roomRes] = await Promise.all([
                apiFetch<Paginated<TenantDto>>(`/api/tenants?${params.toString()}`),
                apiFetch<Paginated<RoomDto>>("/api/rooms?limit=200"),
            ]);
            setTenants(tenantRes.data);
            setRooms(roomRes.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Không thể tải dữ liệu");
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- tải dữ liệu bất đồng bộ khi mount
        void load();
    }, [load]);

    const showMessage = (text: string) => {
        setMessage(text);
        setTimeout(() => setMessage(null), 4000);
    };

    const createTenant = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await apiFetch("/api/tenants", {
                method: "POST",
                body: JSON.stringify(form),
            });
            setForm({ fullName: "", phone: "", idCard: "", username: "", password: "" });
            showMessage("Đã tạo người thuê và tài khoản đăng nhập.");
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Tạo thất bại");
        }
    };

    const doMoveIn = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await apiFetch("/api/leases", {
                method: "POST",
                body: JSON.stringify({
                    roomId: moveIn.roomId,
                    tenantId: moveIn.tenantId,
                    startDate: new Date(moveIn.startDate).toISOString(),
                }),
            });
            showMessage("Đã ghi nhận chuyển vào phòng.");
            setMoveIn({ tenantId: "", roomId: "", startDate: "" });
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Chuyển vào thất bại");
        }
    };

    const resetPassword = async (tenant: TenantDto) => {
        const password = window.prompt(`Đặt mật khẩu mới cho ${tenant.fullName}:`);
        if (!password) return;
        try {
            await apiFetch(`/api/tenants/${tenant.id}/reset-password`, {
                method: "POST",
                body: JSON.stringify({ password }),
            });
            showMessage("Đã đặt lại mật khẩu.");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Đặt lại thất bại");
        }
    };

    const toggleActive = async (tenant: TenantDto) => {
        try {
            await apiFetch(`/api/tenants/${tenant.id}`, {
                method: "PATCH",
                body: JSON.stringify({ isActive: !tenant.isActive }),
            });
            showMessage(
                tenant.isActive ? "Đã khoá tài khoản." : "Đã kích hoạt tài khoản.",
            );
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Cập nhật thất bại");
        }
    };

    const removeTenant = async (tenant: TenantDto) => {
        if (
            !window.confirm(
                `Xoá ${tenant.fullName}? Chỉ xoá được khi chưa có hợp đồng/hoá đơn.`,
            )
        ) {
            return;
        }
        try {
            await apiFetch(`/api/tenants/${tenant.id}`, { method: "DELETE" });
            showMessage("Đã xoá người thuê.");
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Xoá thất bại");
        }
    };

    const endLease = async (tenant: TenantDto) => {
        if (!tenant.activeLeaseId) return;
        const endDate = window.prompt(
            `Ngày chuyển đi của ${tenant.fullName} (YYYY-MM-DD):`,
            new Date().toISOString().slice(0, 10),
        );
        if (!endDate) return;
        const finalElectricity = window.prompt(
            "Chỉ số điện cuối (bỏ trống nếu không ghi):",
        );
        const finalWater = window.prompt(
            "Chỉ số nước cuối (bỏ trống nếu không ghi):",
        );
        try {
            await apiFetch(`/api/leases/${tenant.activeLeaseId}/end`, {
                method: "POST",
                body: JSON.stringify({
                    endDate: new Date(endDate).toISOString(),
                    ...(finalElectricity !== null && finalElectricity !== ""
                        ? { finalElectricity: Number(finalElectricity) }
                        : {}),
                    ...(finalWater !== null && finalWater !== ""
                        ? { finalWater: Number(finalWater) }
                        : {}),
                }),
            });
            showMessage(`Đã kết thúc hợp đồng của ${tenant.fullName}.`);
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Kết thúc thất bại");
        }
    };

    const vacantRooms = rooms.filter((r) => r.status === "VACANT");

    return (
        <div className="space-y-4">
            {message && (
                <div className="rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
                    {message}
                </div>
            )}
            {error && (
                <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Tạo người thuê */}
            <form
                onSubmit={createTenant}
                className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-6"
            >
                <Input
                    placeholder="Họ tên *"
                    required
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                />
                <Input
                    placeholder="Số điện thoại"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
                <Input
                    placeholder="CMND/CCCD"
                    value={form.idCard}
                    onChange={(e) => setForm({ ...form, idCard: e.target.value })}
                />
                <Input
                    placeholder="Tên đăng nhập *"
                    type="text"
                    required
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
                <Input
                    placeholder="Mật khẩu (≥8 ký tự) *"
                    type="password"
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <Button type="submit">Tạo người thuê</Button>
            </form>

            {/* Chuyển vào phòng */}
            <form
                onSubmit={doMoveIn}
                className="flex flex-wrap gap-3 rounded-xl border border-slate-200 bg-white p-4"
            >
                <select
                    className={`${selectClass} max-w-xs`}
                    value={moveIn.tenantId}
                    onChange={(e) => setMoveIn({ ...moveIn, tenantId: e.target.value })}
                    required
                >
                    <option value="">Chọn người thuê...</option>
                    {tenants.map((t) => (
                        <option key={t.id} value={t.id}>
                            {t.fullName} {t.activeRoom ? `(đang ở ${t.activeRoom})` : ""}
                        </option>
                    ))}
                </select>
                <select
                    className={`${selectClass} max-w-xs`}
                    value={moveIn.roomId}
                    onChange={(e) => setMoveIn({ ...moveIn, roomId: e.target.value })}
                    required
                >
                    <option value="">Chọn phòng trống...</option>
                    {vacantRooms.map((r) => (
                        <option key={r.id} value={r.id}>
                            Phòng {r.number}
                        </option>
                    ))}
                </select>
                <Input
                    type="date"
                    className="max-w-xs"
                    value={moveIn.startDate}
                    onChange={(e) => setMoveIn({ ...moveIn, startDate: e.target.value })}
                    required
                />
                <Button type="submit" variant="secondary">
                    Ghi nhận chuyển vào
                </Button>
            </form>

            {/* Bộ lọc trạng thái */}
            <div className="flex flex-wrap items-center gap-2">
                {(
                    [
                        ["all", "Tất cả"],
                        ["active", "Đang hoạt động"],
                        ["inactive", "Đã khoá"],
                    ] as const
                ).map(([value, label]) => (
                    <Button
                        key={value}
                        size="sm"
                        variant={filter === value ? "primary" : "outline"}
                        onClick={() => setFilter(value)}
                    >
                        {label}
                    </Button>
                ))}
            </div>

            {/* Danh sách */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                {loading ? (
                    <div className="p-10 text-center text-sm text-slate-500">
                        Đang tải...
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Họ tên</th>
                                    <th className="px-4 py-3 font-medium">SĐT liên hệ</th>
                                    <th className="px-4 py-3 font-medium">Tài khoản</th>
                                    <th className="px-4 py-3 font-medium">Phòng</th>
                                    <th className="px-4 py-3 font-medium">Trạng thái</th>
                                    <th className="px-4 py-3 font-medium">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {tenants.map((tenant) => (
                                    <tr key={tenant.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 font-medium text-slate-900">
                                            {tenant.fullName}
                                        </td>
                                        <td className="px-4 py-3 text-slate-700">
                                            {tenant.phone ?? "—"}
                                        </td>
                                        <td className="px-4 py-3 text-slate-700">
                                            {tenant.username}
                                        </td>
                                        <td className="px-4 py-3 text-slate-700">
                                            {tenant.activeRoom ?? "—"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant={tenant.isActive ? "success" : "neutral"}>
                                                {tenant.isActive ? "Hoạt động" : "Khoá"}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-1.5">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => resetPassword(tenant)}
                                                >
                                                    Đặt lại MK
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant={
                                                        tenant.isActive ? "outline" : "secondary"
                                                    }
                                                    onClick={() => toggleActive(tenant)}
                                                >
                                                    {tenant.isActive ? "Khoá" : "Kích hoạt"}
                                                </Button>
                                                {tenant.activeLeaseId && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => endLease(tenant)}
                                                    >
                                                        Chuyển đi
                                                    </Button>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => removeTenant(tenant)}
                                                >
                                                    Xoá
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {tenants.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-4 py-10 text-center text-slate-500"
                                        >
                                            Chưa có người thuê nào.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
