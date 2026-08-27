import { getCurrentUser } from "@/lib/auth/current-user";
import { getTenantByUserId } from "@/lib/services/tenant.service";
import { listInvoicesByTenant } from "@/lib/services/billing.service";
import { InvoiceListItem } from "@/components/tenant/invoice-list-item";

export const dynamic = "force-dynamic";

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
                <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    {invoices.map((invoice) => (
                        <InvoiceListItem key={invoice.id} invoice={invoice} />
                    ))}
                </div>
            )}
        </div>
    );
}
