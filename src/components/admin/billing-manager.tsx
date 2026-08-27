"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api-client";
import type { BillingPeriodDto, MeterReadingDto, RoomDto } from "@/types";

type Values = Record<
    string,
    { electricityNew: string; waterNew: string; people: string }
>;

export function BillingManager() {
    const [periods, setPeriods] = useState<BillingPeriodDto[]>([]);
    const [rooms, setRooms] = useState<RoomDto[]>([]);
    const [readings, setReadings] = useState<MeterReadingDto[]>([]);
    const [selectedPeriodId, setSelectedPeriodId] = useState("");
    const [values, setValues] = useState<Values>({});
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [generating, setGenerating] = useState(false);

    // Form tạo kỳ
    const now = new Date();
    const [month, setMonth] = useState(String(now.getMonth() + 1));
    const [year, setYear] = useState(String(now.getFullYear()));

    const load = useCallback(async () => {
        try {
            const [periodRes, roomRes] = await Promise.all([
                apiFetch<BillingPeriodDto[]>("/api/billing-periods"),
                apiFetch<{ data: RoomDto[] }>("/api/rooms?limit=200"),
            ]);
            setPeriods(periodRes);
            setRooms(roomRes.data);
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

    const loadReadings = useCallback(async (periodId: string) => {
        if (!periodId) return;
        try {
            const res = await apiFetch<MeterReadingDto[]>(
                `/api/meter-readings?billingPeriodId=${periodId}`,
            );
            setReadings(res);
            const map: Values = {};
            for (const r of res) {
                map[r.roomId] = {
                    electricityNew: String(r.electricityNew),
                    waterNew: String(r.waterNew),
                    people: String(r.peopleCount),
                };
            }
            setValues(map);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Không thể tải chỉ số");
        }
    }, []);

    const selectPeriod = (periodId: string) => {
        setSelectedPeriodId(periodId);
        void loadReadings(periodId);
    };

    const createPeriod = async () => {
        try {
            const period = await apiFetch<BillingPeriodDto>("/api/billing-periods", {
                method: "POST",
                body: JSON.stringify({ month: Number(month), year: Number(year) }),
            });
            setMessage(`Đã mở kỳ ${period.code} (hạn ${new Date(period.dueDate).toLocaleDateString("vi-VN")}).`);
            await load();
            setSelectedPeriodId(period.id);
            setValues({});
            setReadings([]);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Tạo kỳ thất bại");
        }
    };

    const saveReadings = async () => {
        setSaving(true);
        try {
            const readingsPayload = rooms
                .filter((r) => values[r.id])
                .map((r) => ({
                    roomId: r.id,
                    electricityNew: Number(values[r.id].electricityNew || 0),
                    waterNew: Number(values[r.id].waterNew || 0),
                    peopleCount: Number(values[r.id].people || 1),
                }));
            await apiFetch("/api/meter-readings", {
                method: "POST",
                body: JSON.stringify({
                    billingPeriodId: selectedPeriodId,
                    readings: readingsPayload,
                }),
            });
            setMessage(`Đã lưu chỉ số cho ${readingsPayload.length} phòng.`);
            await loadReadings(selectedPeriodId);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Lưu chỉ số thất bại");
        } finally {
            setSaving(false);
        }
    };

    const generateInvoices = async () => {
        setGenerating(true);
        try {
            const res = await apiFetch<{ count: number }>("/api/invoices/generate", {
                method: "POST",
                body: JSON.stringify({ billingPeriodId: selectedPeriodId }),
            });
            setMessage(`Đã tạo ${res.count} hoá đơn. Người thuê có thể xem và thanh toán.`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Tạo hoá đơn thất bại");
        } finally {
            setGenerating(false);
        }
    };

    const readingById = (roomId: string) =>
        readings.find((r) => r.roomId === roomId);

    const setValue = (roomId: string, patch: Partial<Values[string]>) => {
        setValues((prev) => ({
            ...prev,
            [roomId]: { ...(prev[roomId] ?? { electricityNew: "", waterNew: "", people: "1" }), ...patch },
        }));
    };

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

            {/* Mở kỳ mới */}
            <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4">
                <div>
                    <label className="text-xs text-slate-500">Tháng</label>
                    <Input
                        type="number"
                        min={1}
                        max={12}
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        className="mt-1 w-24"
                    />
                </div>
                <div>
                    <label className="text-xs text-slate-500">Năm</label>
                    <Input
                        type="number"
                        min={2020}
                        max={2100}
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="mt-1 w-28"
                    />
                </div>
                <Button onClick={createPeriod}>Mở kỳ mới</Button>
                <div className="ml-auto flex items-center gap-2">
                    <label className="text-sm text-slate-600">Chọn kỳ:</label>
                    <select
                        value={selectedPeriodId}
                        onChange={(e) => selectPeriod(e.target.value)}
                        className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"
                    >
                        <option value="">— chọn —</option>
                        {periods.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.code} ({p.status === "OPEN" ? "Đang mở" : "Đã chốt"})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {selectedPeriodId && (
                <>
                    {/* Chỉ số */}
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                            <h2 className="font-semibold text-slate-900">
                                Nhập chỉ số điện/nước
                            </h2>
                            <Button onClick={saveReadings} disabled={saving}>
                                {saving ? "Đang lưu..." : "Lưu chỉ số"}
                            </Button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                    <tr>
                                        <th className="px-4 py-2 font-medium">Phòng</th>
                                        <th className="px-4 py-2 font-medium">Điện cũ</th>
                                        <th className="px-4 py-2 font-medium">Điện mới</th>
                                        <th className="px-4 py-2 font-medium">Nước cũ</th>
                                        <th className="px-4 py-2 font-medium">Nước mới</th>
                                        <th className="px-4 py-2 font-medium">Số người</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {rooms.map((room) => {
                                        const r = readingById(room.id);
                                        const v = values[room.id] ?? {
                                            electricityNew: "",
                                            waterNew: "",
                                            people: "1",
                                        };
                                        return (
                                            <tr key={room.id} className="hover:bg-slate-50">
                                                <td className="px-4 py-2 font-semibold text-slate-900">
                                                    {room.number}
                                                </td>
                                                <td className="px-4 py-2 text-slate-500">
                                                    {r ? r.electricityOld : "tự động"}
                                                </td>
                                                <td className="px-4 py-2">
                                                    <Input
                                                        type="number"
                                                        className="h-8 w-24"
                                                        value={v.electricityNew}
                                                        onChange={(e) =>
                                                            setValue(room.id, { electricityNew: e.target.value })
                                                        }
                                                    />
                                                </td>
                                                <td className="px-4 py-2 text-slate-500">
                                                    {r ? r.waterOld : "tự động"}
                                                </td>
                                                <td className="px-4 py-2">
                                                    <Input
                                                        type="number"
                                                        className="h-8 w-24"
                                                        value={v.waterNew}
                                                        onChange={(e) =>
                                                            setValue(room.id, { waterNew: e.target.value })
                                                        }
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <Input
                                                        type="number"
                                                        className="h-8 w-16"
                                                        value={v.people}
                                                        onChange={(e) =>
                                                            setValue(room.id, { people: e.target.value })
                                                        }
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Tạo hoá đơn */}
                    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
                        <p className="text-sm text-slate-600">
                            Tạo hoá đơn cho tất cả phòng có chỉ số trong kỳ này. Hoá đơn cũ
                            chưa thanh toán sẽ được tạo lại.
                        </p>
                        <Button onClick={generateInvoices} disabled={generating}>
                            {generating ? "Đang tạo..." : "Tạo hoá đơn hàng loạt"}
                        </Button>
                    </div>
                </>
            )}

            {loading && <div className="text-sm text-slate-500">Đang tải...</div>}
        </div>
    );
}
