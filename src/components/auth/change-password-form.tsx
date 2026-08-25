"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api-client";

export function ChangePasswordForm() {
    const router = useRouter();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setMessage(null);
        if (newPassword !== confirm) {
            setError("Mật khẩu mới nhập lại không khớp");
            return;
        }
        setLoading(true);
        try {
            await apiFetch("/api/auth/change-password", {
                method: "POST",
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            setMessage("Đã đổi mật khẩu thành công.");
            setCurrentPassword("");
            setNewPassword("");
            setConfirm("");
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Đổi mật khẩu thất bại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="max-w-md space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                    Mật khẩu hiện tại
                </label>
                <Input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                    Mật khẩu mới (tối thiểu 8 ký tự)
                </label>
                <Input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                    Nhập lại mật khẩu mới
                </label>
                <Input
                    type="password"
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                />
            </div>

            {error && (
                <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                </div>
            )}
            {message && (
                <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                    {message}
                </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Đang lưu..." : "Đổi mật khẩu"}
            </Button>
        </form>
    );
}
