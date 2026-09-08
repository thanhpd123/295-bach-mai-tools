"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api-client";
import type { LoginResult } from "@/types";

export function LoginForm() {
    const router = useRouter();
    const [account, setAccount] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const result = await apiFetch<LoginResult>("/api/auth/login", {
                method: "POST",
                body: JSON.stringify({ account, password }),
            });
            // Bắt buộc đổi mật khẩu lần đầu (tài khoản mới hoặc vừa được admin reset).
            if (result.user.mustChangePassword) {
                router.push(
                    result.user.role === "ADMIN"
                        ? "/dashboard"
                        : "/app/change-password",
                );
            } else {
                router.push(result.redirectTo);
            }
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Đăng nhập thất bại");
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="glass space-y-4 rounded-2xl p-6"
        >
            <div className="space-y-2">
                <label htmlFor="account" className="text-sm font-medium text-slate-300">
                    Tài khoản
                </label>
                <Input
                    id="account"
                    type="text"
                    autoComplete="username"
                    required
                    value={account}
                    onChange={(event) => setAccount(event.target.value)}
                    placeholder="Tên đăng nhập hoặc SĐT"
                />
            </div>

            <div className="space-y-2">
                <label
                    htmlFor="password"
                    className="text-sm font-medium text-slate-300"
                >
                    Mật khẩu
                </label>
                <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                />
            </div>

            {error && (
                <div className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
                    {error}
                </div>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
                <LogIn className="size-4" />
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>

            <p className="text-center text-xs text-slate-500">
                Chưa có tài khoản? Liên hệ chủ nhà để được tạo tài khoản.
            </p>
        </form>
    );
}
