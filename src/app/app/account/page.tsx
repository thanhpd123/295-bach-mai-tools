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
            <h1 className="text-xl font-bold text-slate-900">Cá nhân</h1>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
                        {displayName.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0">
                        <div className="truncate font-semibold text-slate-900">
                            {displayName || "Người thuê"}
                        </div>
                        <div className="text-sm text-slate-500">
                            {tenant?.activeRoom
                                ? `Phòng ${tenant.activeRoom}`
                                : "Chưa gắn phòng"}
                        </div>
                    </div>
                </div>
                {tenant?.phone && (
                    <p className="mt-3 text-sm text-slate-600">
                        Số điện thoại: <strong>{tenant.phone}</strong>
                    </p>
                )}
            </div>

            <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <Link
                    href="/app/change-password"
                    className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-slate-50"
                >
                    <KeyRound className="size-5 text-slate-400" />
                    <span className="flex-1 text-sm font-medium text-slate-700">
                        Đổi mật khẩu
                    </span>
                </Link>
                <Link
                    href="/app/huong-dan"
                    className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-slate-50"
                >
                    <HelpCircle className="size-5 text-slate-400" />
                    <span className="flex-1 text-sm font-medium text-slate-700">
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
