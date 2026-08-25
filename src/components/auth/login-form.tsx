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
    const [email, setEmail] = useState("");
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
                body: JSON.stringify({ email, password }),
            });
            router.push(result.redirectTo);
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Đăng nhập thất bại");
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
            <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-700">
                    Email
                </label>
                <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="ban@vi-du.vn"
                />
            </div>

            <div className="space-y-2">
                <label
                    htmlFor="password"
                    className="text-sm font-medium text-slate-700"
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
                <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                </div>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
                <LogIn className="size-4" />
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>

            <p className="text-center text-xs text-slate-400">
                Chưa có tài khoản? Liên hệ chủ nhà để được tạo tài khoản.
            </p>
        </form>
    );
}
