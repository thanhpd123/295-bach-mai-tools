"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api-client";
import type { BankAccountDto } from "@/types";

interface FeeSettings {
    electricityUnitPrice: number;
    waterUnitPrice: number;
    motorcycleUnitPrice: number;
    cleaningFee: number;
    internetFee: number;
    elevatorFee: number;
    dueDay: number;
}

const emptyFees: FeeSettings = {
    electricityUnitPrice: 3500,
    waterUnitPrice: 25000,
    motorcycleUnitPrice: 100000,
    cleaningFee: 30000,
    internetFee: 100000,
    elevatorFee: 50000,
    dueDay: 5,
};

const emptyAccount = {
    bankName: "",
    bankCode: "",
    accountNumber: "",
    accountName: "",
};

export function SettingsPanel() {
    const [accounts, setAccounts] = useState<BankAccountDto[]>([]);
    const [fees, setFees] = useState<FeeSettings>(emptyFees);
    const [accountForm, setAccountForm] = useState(emptyAccount);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        try {
            const [accountRes, feeRes] = await Promise.all([
                apiFetch<BankAccountDto[]>("/api/bank-accounts"),
                apiFetch<FeeSettings>("/api/settings/fees"),
            ]);
            setAccounts(accountRes);
            setFees(feeRes);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Không thể tải cài đặt");
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- tải dữ liệu bất đồng bộ khi mount
        void load();
    }, [load]);

    const addAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await apiFetch("/api/bank-accounts", {
                method: "POST",
                body: JSON.stringify({ ...accountForm, isActive: accounts.length === 0 }),
            });
            setAccountForm(emptyAccount);
            setMessage("Đã thêm tài khoản ngân hàng.");
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Thêm thất bại");
        }
    };

    const setActive = async (id: string) => {
        await apiFetch(`/api/bank-accounts/${id}`, {
            method: "PATCH",
            body: JSON.stringify({ isActive: true }),
        });
        await load();
    };

    const removeAccount = async (id: string) => {
        if (!window.confirm("Xoá tài khoản ngân hàng này?")) return;
        await apiFetch(`/api/bank-accounts/${id}`, { method: "DELETE" });
        await load();
    };

    const saveFees = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const saved = await apiFetch<FeeSettings>("/api/settings/fees", {
                method: "PUT",
                body: JSON.stringify(fees),
            });
            setFees(saved);
            setMessage("Đã lưu đơn giá.");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Lưu thất bại");
        }
    };

    const feeFields: Array<{ key: keyof FeeSettings; label: string }> = [
        { key: "electricityUnitPrice", label: "Đơn giá điện (VND/kWh)" },
        { key: "waterUnitPrice", label: "Đơn giá nước (VND/m³)" },
        { key: "motorcycleUnitPrice", label: "Gửi xe máy (VND/xe)" },
        { key: "cleaningFee", label: "Phí vệ sinh (VND)" },
        { key: "internetFee", label: "Internet (VND)" },
        { key: "elevatorFee", label: "Thang máy (VND)" },
        { key: "dueDay", label: "Ngày hạn thanh toán (1-28)" },
    ];

    return (
        <div className="space-y-6">
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

            {/* Tài khoản ngân hàng */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="mb-3 font-semibold text-slate-900">
                    Tài khoản ngân hàng nhận tiền
                </h2>
                <form onSubmit={addAccount} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    <Input
                        placeholder="Tên ngân hàng *"
                        required
                        value={accountForm.bankName}
                        onChange={(e) =>
                            setAccountForm({ ...accountForm, bankName: e.target.value })
                        }
                    />
                    <Input
                        placeholder="Mã BIN ngân hàng * (VD: 970422)"
                        required
                        value={accountForm.bankCode}
                        onChange={(e) =>
                            setAccountForm({ ...accountForm, bankCode: e.target.value })
                        }
                    />
                    <Input
                        placeholder="Số tài khoản *"
                        required
                        value={accountForm.accountNumber}
                        onChange={(e) =>
                            setAccountForm({ ...accountForm, accountNumber: e.target.value })
                        }
                    />
                    <Input
                        placeholder="Chủ tài khoản *"
                        required
                        value={accountForm.accountName}
                        onChange={(e) =>
                            setAccountForm({ ...accountForm, accountName: e.target.value })
                        }
                    />
                    <Button type="submit">Thêm</Button>
                </form>

                <div className="mt-4 space-y-2">
                    {accounts.map((account) => (
                        <div
                            key={account.id}
                            className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-2"
                        >
                            <div className="text-sm">
                                <span className="font-medium">
                                    {account.bankName} · {account.accountNumber}
                                </span>
                                <span className="ml-2 text-slate-500">
                                    {account.accountName}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                {account.isActive ? (
                                    <Badge variant="success">Đang dùng</Badge>
                                ) : (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setActive(account.id)}
                                    >
                                        Dùng tài khoản này
                                    </Button>
                                )}
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => removeAccount(account.id)}
                                >
                                    Xoá
                                </Button>
                            </div>
                        </div>
                    ))}
                    {accounts.length === 0 && (
                        <p className="text-sm text-slate-400">
                            Chưa có tài khoản ngân hàng nào.
                        </p>
                    )}
                </div>
            </div>

            {/* Đơn giá */}
            <form
                onSubmit={saveFees}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
                <h2 className="mb-3 font-semibold text-slate-900">
                    Đơn giá điện/nước & phí cố định
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {feeFields.map((field) => (
                        <div key={field.key}>
                            <label className="text-xs text-slate-500">{field.label}</label>
                            <Input
                                type="number"
                                className="mt-1"
                                value={fees[field.key]}
                                onChange={(e) =>
                                    setFees({ ...fees, [field.key]: Number(e.target.value) })
                                }
                            />
                        </div>
                    ))}
                </div>
                <Button type="submit" className="mt-4">
                    Lưu đơn giá
                </Button>
            </form>
        </div>
    );
}
