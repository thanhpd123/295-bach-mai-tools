"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api-client";
import { roomStatusLabels } from "@/lib/labels";
import { formatCurrency } from "@/lib/utils";
import type { Paginated, RoomDto } from "@/types";
import type { RoomStatus } from "@/generated/prisma/enums";

function RentCell({ room, onSaved }: { room: RoomDto; onSaved: () => void }) {
    const [value, setValue] = useState(String(room.baseRent));
    const [saving, setSaving] = useState(false);

    const save = async () => {
        setSaving(true);
        try {
            await apiFetch(`/api/rooms/${room.id}`, {
                method: "PATCH",
                body: JSON.stringify({ baseRent: Number(value) }),
            });
            onSaved();
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex items-center gap-1">
            <Input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="h-8 w-32"
                disabled={saving}
            />
            <Button size="sm" variant="outline" onClick={save} disabled={saving}>
                Lưu
            </Button>
        </div>
    );
}

export function RoomsManager() {
    const [rooms, setRooms] = useState<RoomDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        try {
            const result = await apiFetch<Paginated<RoomDto>>("/api/rooms?limit=200");
            setRooms(result.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Không thể tải dữ liệu");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- tải dữ liệu bất đồng bộ khi mount
        void load();
    }, [load]);

    const changeStatus = async (room: RoomDto, status: RoomStatus) => {
        await apiFetch(`/api/rooms/${room.id}`, {
            method: "PATCH",
            body: JSON.stringify({ status }),
        });
        await load();
    };

    if (loading) {
        return <div className="p-10 text-center text-sm text-slate-500">Đang tải...</div>;
    }
    if (error) {
        return <div className="p-10 text-center text-sm text-red-600">{error}</div>;
    }

    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                            <th className="px-4 py-3 font-medium">Phòng</th>
                            <th className="px-4 py-3 font-medium">Tầng</th>
                            <th className="px-4 py-3 font-medium">Giá phòng</th>
                            <th className="px-4 py-3 font-medium">Trạng thái</th>
                            <th className="px-4 py-3 font-medium">Người thuê</th>
                            <th className="px-4 py-3 font-medium">SĐT liên hệ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {rooms.map((room) => (
                            <tr key={room.id} className="hover:bg-slate-50">
                                <td className="px-4 py-3 font-semibold text-slate-900">
                                    {room.number}
                                </td>
                                <td className="px-4 py-3 text-slate-700">{room.floor}</td>
                                <td className="px-4 py-3">
                                    <RentCell room={room} onSaved={load} />
                                </td>
                                <td className="px-4 py-3">
                                    <select
                                        value={room.status}
                                        onChange={(e) =>
                                            changeStatus(room, e.target.value as RoomStatus)
                                        }
                                        className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm"
                                    >
                                        <option value="VACANT">Đang trống</option>
                                        <option value="OCCUPIED">Đang thuê</option>
                                        <option value="MAINTENANCE">Bảo trì</option>
                                    </select>
                                </td>
                                <td className="px-4 py-3 text-slate-700">
                                    {room.tenantName ?? (
                                        <Badge variant="neutral">
                                            {roomStatusLabels[room.status]}
                                        </Badge>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-slate-500">
                                    {room.tenantPhone ?? "—"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="border-t border-slate-200 px-4 py-3 text-xs text-slate-400">
                {rooms.length} phòng · {formatCurrency(rooms.reduce((s, r) => s + r.baseRent, 0))} tổng giá phòng/tháng
            </div>
        </div>
    );
}
