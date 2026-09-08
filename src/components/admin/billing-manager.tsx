"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api-client";
import type { BillingPeriodDto, MeterReadingDto, RoomDto } from "@/types";

type Values = Record<
    string,
    {
        electricityOld: string;
        electricityNew: string;
        waterOld: string;
        waterNew: string;
        people: string;
        motorcycle: string;
    }
>;

export function BillingManager() {
    const [periods, setPeriods] = useState<BillingPeriodDto[]>([]);
    const [rooms, setRooms] = useState<RoomDto[]>([]);
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
            const res = await apiFetch<{
                readings: MeterReadingDto[];
                suggestions: Record<
                    string,
                    { electricityOld: number; waterOld: number }
                >;
            }>(`/api/meter-readings?billingPeriodId=${periodId}`);

            const map: Values = {};
            for (const r of res.readings) {
                map[r.roomId] = {
                    electricityOld: String(r.electricityOld),
                    electricityNew: String(r.electricityNew),
                    waterOld: String(r.waterOld),
                    waterNew: String(r.waterNew),
                    people: String(r.peopleCount),
                    motorcycle: String(r.motorcycleCount),
                };
            }
            // Phòng chưa có bản ghi: tự điền chỉ số "cũ" từ kỳ trước / hợp đồng đã kết thúc.
            for (const room of rooms) {
                if (map[room.id]) continue;
                const s = res.suggestions[room.id];
                map[room.id] = {
                    electricityOld: s ? String(s.electricityOld) : "",
                    electricityNew: "",
                    waterOld: s ? String(s.waterOld) : "",
                    waterNew: "",
                    people: "1",
                    motorcycle: "0",
                };
            }
            setValues(map);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Không thể tải chỉ số");
        }
    }, [rooms]);

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
        } catch (err) {
            setError(err instanceof Error ? err.message : "Tạo kỳ thất bại");
        }
    };

    const saveReadings = async () => {
        setSaving(true);
        try {
            const toNumber = (s: string) =>
                s.trim() === "" ? undefined : Number(s);
            const readingsPayload = rooms
                .filter((r) => {
                    const v = values[r.id];
                    return (
                        v &&
                        (v.electricityNew.trim() !== "" ||
                            v.waterNew.trim() !== "")
                    );
                })
                .map((r) => {
                    const v = values[r.id];
                    return {
                        roomId: r.id,
                        electricityOld: toNumber(v.electricityOld),
                        electricityNew: Number(v.electricityNew || 0),
                        waterOld: toNumber(v.waterOld),
                        waterNew: Number(v.waterNew || 0),
                        peopleCount: Number(v.people || 1),
                        motorcycleCount: Number(v.motorcycle || 0),
                    };
                });
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

    const setValue = (roomId: string, patch: Partial<Values[string]>) => {
        setValues((prev) => ({
            ...prev,
            [roomId]: {
                ...(prev[roomId] ?? {
                    electricityOld: "",
                    electricityNew: "",
                    waterOld: "",
                    waterNew: "",
                    people: "1",
                    motorcycle: "0",
                }),
                ...patch,
            },
        }));
    };

    return (
        <div className="space-y-4">
            {message && (
                <div className="rounded-lg bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">
                    {message}
                </div>
            )}
            {error && (
                <div className="rounded-lg bg-rose-500/10 px-4 py-2 text-sm text-rose-300">
                    {error}
                </div>
            )}

            {/* Mở kỳ mới */}
            <div className="glass flex flex-wrap items-end gap-3 rounded-xl p-4">
                <div>
                    <label className="text-xs text-slate-400">Tháng</label>
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
                    <label className="text-xs text-slate-400">Năm</label>
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
                    <label className="text-sm text-slate-300">Chọn kỳ:</label>
                    <select
                        value={selectedPeriodId}
                        onChange={(e) => selectPeriod(e.target.value)}
                        className="h-10 rounded-lg border border-white/15 bg-white/5 px-3 text-sm text-white"
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
                    <div className="glass overflow-hidden rounded-xl">
                        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                            <h2 className="font-semibold text-white">
                                Nhập chỉ số điện/nước
                            </h2>
                            <Button onClick={saveReadings} disabled={saving}>
                                {saving ? "Đang lưu..." : "Lưu chỉ số"}
                            </Button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wide text-slate-400">
                                    <tr>
                                        <th className="px-4 py-2 font-medium">Phòng</th>
                                        <th className="px-4 py-2 font-medium">Điện cũ</th>
                                        <th className="px-4 py-2 font-medium">Điện mới</th>
                                        <th className="px-4 py-2 font-medium">Điện dùng</th>
                                        <th className="px-4 py-2 font-medium">Nước cũ</th>
                                        <th className="px-4 py-2 font-medium">Nước mới</th>
                                        <th className="px-4 py-2 font-medium">Nước dùng</th>
                                        <th className="px-4 py-2 font-medium">Số người</th>
                                        <th className="px-4 py-2 font-medium">Số xe</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {rooms.map((room) => {
                                        const v = values[room.id] ?? {
                                            electricityOld: "",
                                            electricityNew: "",
                                            waterOld: "",
                                            waterNew: "",
                                            people: "1",
                                            motorcycle: "0",
                                        };
                                        const elecOld = Number(v.electricityOld || 0);
                                        const elecNew = Number(v.electricityNew || 0);
                                        const waterOld = Number(v.waterOld || 0);
                                        const waterNew = Number(v.waterNew || 0);
                                        return (
                                            <tr key={room.id} className="hover:bg-white/5">
                                                <td className="px-4 py-2 font-semibold text-white">
                                                    {room.number}
                                                </td>
                                                <td className="px-4 py-2">
                                                    <Input
                                                        type="number"
                                                        className="h-8 w-20"
                                                        value={v.electricityOld}
                                                        placeholder="0"
                                                        onChange={(e) =>
                                                            setValue(room.id, { electricityOld: e.target.value })
                                                        }
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <Input
                                                        type="number"
                                                        className="h-8 w-20"
                                                        value={v.electricityNew}
                                                        placeholder="0"
                                                        onChange={(e) =>
                                                            setValue(room.id, { electricityNew: e.target.value })
                                                        }
                                                    />
                                                </td>
                                                <td className="px-4 py-2 tabular-nums text-slate-200">
                                                    {elecNew - elecOld}
                                                </td>
                                                <td className="px-4 py-2">
                                                    <Input
                                                        type="number"
                                                        className="h-8 w-20"
                                                        value={v.waterOld}
                                                        placeholder="0"
                                                        onChange={(e) =>
                                                            setValue(room.id, { waterOld: e.target.value })
                                                        }
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <Input
                                                        type="number"
                                                        className="h-8 w-20"
                                                        value={v.waterNew}
                                                        placeholder="0"
                                                        onChange={(e) =>
                                                            setValue(room.id, { waterNew: e.target.value })
                                                        }
                                                    />
                                                </td>
                                                <td className="px-4 py-2 tabular-nums text-slate-200">
                                                    {waterNew - waterOld}
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
                                                <td className="px-4 py-2">
                                                    <Input
                                                        type="number"
                                                        className="h-8 w-16"
                                                        value={v.motorcycle}
                                                        onChange={(e) =>
                                                            setValue(room.id, { motorcycle: e.target.value })
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
                    <div className="glass flex items-center justify-between rounded-xl p-4">
                        <p className="text-sm text-slate-300">
                            Tạo hoá đơn cho tất cả phòng có chỉ số trong kỳ này. Hoá đơn cũ
                            chưa thanh toán sẽ được tạo lại.
                        </p>
                        <Button onClick={generateInvoices} disabled={generating}>
                            {generating ? "Đang tạo..." : "Tạo hoá đơn hàng loạt"}
                        </Button>
                    </div>
                </>
            )}

            {loading && <div className="text-sm text-slate-400">Đang tải...</div>}
        </div>
    );
}
