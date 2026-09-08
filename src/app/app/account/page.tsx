import type { Metadata } from "next";
import Link from "next/link";
import { KeyRound, HelpCircle } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getTenantDtoByUserId } from "@/lib/services/tenant.service";
import { LogoutButton } from "@/components/auth/logout-button";

export const metadata: Metadata = { title: "Cá nhân" };

export default async function AccountPage() {
    const user = await getCurrentUser();
    const tenant = user ? await getTenantDtoByUserId(user.id) : null;
    const displayName = tenant?.fullName ?? user?.name ?? "";

    return (
        <div className="space-y-4">
            <h1 className="text-xl font-bold text-white">Cá nhân</h1>

            <div className="glass rounded-2xl p-5">
                <div className="flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-full bg-cyan-400/10 text-lg font-bold text-cyan-300">
                        {displayName.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0">
                        <div className="truncate font-semibold text-white">
                            {displayName || "Người thuê"}
                        </div>
                        <div className="text-sm text-slate-400">
                            {tenant?.activeRoom
                                ? `Phòng ${tenant.activeRoom}`
                                : "Chưa gắn phòng"}
                        </div>
                    </div>
                </div>
                {tenant?.phone && (
                    <p className="mt-3 text-sm text-slate-300">
                        Số điện thoại: <strong>{tenant.phone}</strong>
                    </p>
                )}
            </div>

            <div className="glass divide-y divide-white/5 overflow-hidden rounded-2xl">
                <Link
                    href="/app/change-password"
                    className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-white/5"
                >
                    <KeyRound className="size-5 text-slate-500" />
                    <span className="flex-1 text-sm font-medium text-slate-200">
                        Đổi mật khẩu
                    </span>
                </Link>
                <Link
                    href="/app/huong-dan"
                    className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-white/5"
                >
                    <HelpCircle className="size-5 text-slate-500" />
                    <span className="flex-1 text-sm font-medium text-slate-200">
                        Hướng dẫn sử dụng
                    </span>
                </Link>
            </div>

            <div className="flex justify-end">
                <LogoutButton />
            </div>
        </div>
    );
}
