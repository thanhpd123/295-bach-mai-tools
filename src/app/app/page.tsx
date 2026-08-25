import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getTenantByUserId } from "@/lib/services/tenant.service";
import { getTenantHome } from "@/lib/services/dashboard.service";
import { InvoiceCard } from "@/components/tenant/invoice-card";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TenantHomePage() {
    const user = await getCurrentUser();
    const tenant = user ? await getTenantByUserId(user.id) : null;

    if (!tenant) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
                Tài khoản của bạn chưa được gắn với phòng nào. Vui lòng liên hệ chủ nhà.
            </div>
        );
    }

    const home = await getTenantHome(tenant.id);

    return (
        <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h1 className="text-xl font-bold text-slate-900">
                    Phòng {home.roomNumber} · Tầng {home.floor}
                </h1>
                {home.dueDate && (
                    <p className="mt-1 text-sm text-slate-500">
                        Hạn thanh toán kỳ này:{" "}
                        <strong className="text-amber-700">{formatDate(home.dueDate)}</strong>
                    </p>
                )}
            </div>

            {/* Chỉ số công tơ */}
            {home.meterReading && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="mb-3 font-semibold text-slate-900">
                        Chỉ số công tơ kỳ này
                    </h2>
                    <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                        <div>
                            <div className="text-slate-500">Điện cũ</div>
                            <div className="text-lg font-bold">
                                {home.meterReading.electricityOld}
                            </div>
                        </div>
                        <div>
                            <div className="text-slate-500">Điện mới</div>
                            <div className="text-lg font-bold">
                                {home.meterReading.electricityNew}
                            </div>
                        </div>
                        <div>
                            <div className="text-slate-500">Nước cũ</div>
                            <div className="text-lg font-bold">
                                {home.meterReading.waterOld}
                            </div>
                        </div>
                        <div>
                            <div className="text-slate-500">Nước mới</div>
                            <div className="text-lg font-bold">
                                {home.meterReading.waterNew}
                            </div>
                        </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-4 text-sm text-slate-600">
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

            {home.invoice ? (
                <InvoiceCard invoice={home.invoice} bankAccount={home.bankAccount} />
            ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                    Kỳ này chưa có hoá đơn. Hãy quay lại sau hoặc liên hệ chủ nhà.
                </div>
            )}

            <Link
                href="/app/invoices"
                className="block text-center text-sm text-blue-600 hover:underline"
            >
                Xem lịch sử hoá đơn →
            </Link>
        </div>
    );
}
