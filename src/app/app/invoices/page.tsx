import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getTenantByUserId } from "@/lib/services/tenant.service";
import { listInvoicesByTenant } from "@/lib/services/billing.service";
import { Badge } from "@/components/ui/badge";
import { invoiceStatusLabels } from "@/lib/labels";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const statusVariant = {
    PAID: "success",
    PENDING: "warning",
    OVERDUE: "danger",
    DRAFT: "neutral",
    CANCELLED: "danger",
} as const;

export default async function TenantInvoicesPage() {
    const user = await getCurrentUser();
    const tenant = user ? await getTenantByUserId(user.id) : null;

    if (!tenant) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
                Tài khoản của bạn chưa được gắn với phòng nào.
            </div>
        );
    }

    const invoices = await listInvoicesByTenant(tenant.id);

    return (
        <div className="space-y-4">
            <h1 className="text-xl font-bold text-slate-900">Lịch sử hoá đơn</h1>

            {invoices.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                    Chưa có hoá đơn nào.
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                            <tr>
                                <th className="px-4 py-3 font-medium">Mã</th>
                                <th className="px-4 py-3 font-medium">Kỳ</th>
                                <th className="px-4 py-3 text-right font-medium">Tổng tiền</th>
                                <th className="px-4 py-3 font-medium">Hạn</th>
                                <th className="px-4 py-3 font-medium">Trạng thái</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {invoices.map((invoice) => (
                                <tr key={invoice.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-medium text-slate-900">
                                        {invoice.code}
                                    </td>
                                    <td className="px-4 py-3 text-slate-700">
                                        {invoice.billingPeriodCode}
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium text-slate-900">
                                        {formatCurrency(invoice.totalAmount)}
                                    </td>
                                    <td className="px-4 py-3 text-slate-500">
                                        {formatDate(invoice.dueDate)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge variant={statusVariant[invoice.status]}>
                                            {invoiceStatusLabels[invoice.status]}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Link
                                            href={`/app/invoices/${invoice.id}`}
                                            className="text-sm text-blue-600 hover:underline"
                                        >
                                            Chi tiết
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
