"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { HelpCircle, KeyRound } from "lucide-react";
import type { InvoiceDto, TenantDto, TenantHomeDto } from "@/types";
import { BottomNav, type TenantTab } from "./bottom-nav";
import { InvoiceCard } from "./invoice-card";
import { InvoiceListItem } from "./invoice-list-item";
import { PaymentHero } from "./payment-hero";
import { LogoutButton } from "@/components/auth/logout-button";

interface PortalData {
    account: TenantDto | null;
    home: TenantHomeDto | null;
    invoices: InvoiceDto[];
    name: string | null;
}

/**
 * Shell cổng người thuê kiểu ứng dụng di động:
 * - Tải toàn bộ dữ liệu (trang chủ + hoá đơn + cá nhân) trong 1 request.
 * - Đổi tab tức thì bằng state, không tải lại trang, không gọi mạng.
 */
export function TenantPortal({
    initialTab = "home",
}: {
    initialTab?: TenantTab;
}) {
    const [tab, setTab] = useState<TenantTab>(initialTab);
    const [data, setData] = useState<PortalData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        let cancelled = false;
        fetch("/api/tenant-portal", { cache: "no-store" })
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then((json) => {
                if (cancelled) return;
                setData(json?.data ?? null);
                setError(null);
            })
            .catch(() => {
                if (!cancelled) {
                    setError("Không thể tải dữ liệu. Vui lòng thử lại.");
                }
            });
        return () => {
            cancelled = true;
        };
    }, [attempt]);

    const loading = data === null && error === null;

    const retry = useCallback(() => {
        setData(null);
        setError(null);
        setAttempt((n) => n + 1);
    }, []);

    const selectTab = useCallback((next: TenantTab) => setTab(next), []);

    return (
        <div className="space-y-4">
            {loading && !data ? (
                <PortalSkeleton />
            ) : error && !data ? (
                <div className="glass rounded-2xl p-8 text-center">
                    <p className="text-sm text-slate-400">{error}</p>
                    <button
                        type="button"
                        onClick={retry}
                        className="mt-4 rounded-xl bg-linear-to-r from-teal-600 to-cyan-500 px-6 py-2 text-sm font-semibold text-white"
                    >
                        Thử lại
                    </button>
                </div>
            ) : (
                <>
                    <div className={tab === "home" ? "" : "hidden"}>
                        <HomeView
                            home={data?.home ?? null}
                            account={data?.account ?? null}
                            onViewInvoices={() => selectTab("invoices")}
                        />
                    </div>
                    <div className={tab === "invoices" ? "" : "hidden"}>
                        <InvoicesView invoices={data?.invoices ?? []} />
                    </div>
                    <div className={tab === "account" ? "" : "hidden"}>
                        <AccountView
                            account={data?.account ?? null}
                            name={data?.name ?? null}
                        />
                    </div>
                </>
            )}

            <BottomNav active={tab} onSelect={selectTab} />
        </div>
    );
}

function HomeView({
    home,
    account,
    onViewInvoices,
}: {
    home: TenantHomeDto | null;
    account: TenantDto | null;
    onViewInvoices: () => void;
}) {
    if (!home) {
        return (
            <div className="glass rounded-2xl p-8 text-center text-slate-400">
                {account
                    ? "Tài khoản của bạn chưa được gắn với phòng nào. Vui lòng liên hệ chủ nhà."
                    : "Không thể tải dữ liệu."}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Thông tin phòng (ngữ cảnh) */}
            <div className="glass rounded-2xl p-5">
                <h1 className="text-xl font-bold text-white">
                    Phòng {home.roomNumber} · Tầng {home.floor}
                </h1>
                {home.invoice && (
                    <p className="mt-1 text-sm text-slate-400">
                        Kỳ thanh toán:{" "}
                        <strong className="text-slate-200">
                            {home.invoice.billingPeriodCode}
                        </strong>
                    </p>
                )}
            </div>

            {/* Hoá đơn kỳ hiện tại: số tiền nổi bật + nút thanh toán */}
            {home.invoice ? (
                <>
                    <PaymentHero invoice={home.invoice} />
                    <InvoiceCard
                        invoice={home.invoice}
                        bankAccount={home.bankAccount}
                    />
                </>
            ) : (
                <div className="glass rounded-2xl p-8 text-center text-sm text-slate-400">
                    Kỳ này chưa có hoá đơn. Hãy quay lại sau hoặc liên hệ chủ nhà.
                </div>
            )}

            {/* Chỉ số công tơ (thông tin phụ, đặt sau cùng) */}
            {home.meterReading && (
                <div className="glass rounded-2xl p-5">
                    <h2 className="mb-3 font-semibold text-white">
                        Chỉ số công tơ kỳ này
                    </h2>
                    <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                        <div>
                            <div className="text-slate-400">Điện cũ</div>
                            <div className="text-lg font-bold">
                                {home.meterReading.electricityOld}
                            </div>
                        </div>
                        <div>
                            <div className="text-slate-400">Điện mới</div>
                            <div className="text-lg font-bold">
                                {home.meterReading.electricityNew}
                            </div>
                        </div>
                        <div>
                            <div className="text-slate-400">Nước cũ</div>
                            <div className="text-lg font-bold">
                                {home.meterReading.waterOld}
                            </div>
                        </div>
                        <div>
                            <div className="text-slate-400">Nước mới</div>
                            <div className="text-lg font-bold">
                                {home.meterReading.waterNew}
                            </div>
                        </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-4 text-sm text-slate-300">
                        <div>
                            Điện tiêu thụ:{" "}
                            <strong>{home.meterReading.electricityUsage} kWh</strong>
                        </div>
                        <div>
                            Nước tiêu thụ:{" "}
                            <strong>{home.meterReading.waterUsage} m³</strong>
                        </div>
                    </div>
                </div>
            )}

            <button
                type="button"
                onClick={onViewInvoices}
                className="block w-full text-center text-sm text-cyan-300 hover:underline"
            >
                Xem lịch sử hoá đơn →
            </button>
        </div>
    );
}

function InvoicesView({ invoices }: { invoices: InvoiceDto[] }) {
    return (
        <div className="space-y-4">
            <h1 className="text-xl font-bold text-white">Lịch sử hoá đơn</h1>

            {invoices.length === 0 ? (
                <div className="glass rounded-xl p-8 text-center text-sm text-slate-400">
                    Chưa có hoá đơn nào.
                </div>
            ) : (
                <div className="glass divide-y divide-white/5 overflow-hidden rounded-2xl">
                    {invoices.map((invoice) => (
                        <InvoiceListItem key={invoice.id} invoice={invoice} />
                    ))}
                </div>
            )}
        </div>
    );
}

function AccountView({
    account,
    name,
}: {
    account: TenantDto | null;
    name: string | null;
}) {
    const displayName = account?.fullName ?? name ?? "";

    return (
        <div className="space-y-4">
            <h1 className="text-xl font-bold text-white">Cá nhân</h1>

            <div className="glass rounded-2xl p-5">
                <div className="flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-full bg-cyan-400/10 text-lg font-bold text-cyan-300">
                        {(displayName.charAt(0) || "?").toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <div className="truncate font-semibold text-white">
                            {displayName || "Người thuê"}
                        </div>
                        <div className="text-sm text-slate-400">
                            {account?.activeRoom
                                ? `Phòng ${account.activeRoom}`
                                : "Chưa gắn phòng"}
                        </div>
                    </div>
                </div>
                {account?.phone && (
                    <p className="mt-3 text-sm text-slate-300">
                        Số điện thoại: <strong>{account.phone}</strong>
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

function PortalSkeleton() {
    return (
        <div className="space-y-4" aria-busy="true">
            <div className="glass h-24 animate-pulse rounded-2xl" />
            <div className="glass h-40 animate-pulse rounded-2xl" />
            <div className="glass h-56 animate-pulse rounded-2xl" />
        </div>
    );
}
