import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getTenantByUserId } from "@/lib/services/tenant.service";
import { getInvoiceById } from "@/lib/services/billing.service";
import { getActiveBankAccount } from "@/lib/services/bank.service";
import { InvoiceCard } from "@/components/tenant/invoice-card";

export const dynamic = "force-dynamic";

export default async function TenantInvoiceDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const user = await getCurrentUser();
    const tenant = user ? await getTenantByUserId(user.id) : null;

    const invoice = await getInvoiceById(id);
    // Bảo mật: chỉ người thuê sở hữu hoá đơn mới xem được.
    if (!invoice || !tenant || invoice.tenantId !== tenant.id) {
        notFound();
    }

    const bankAccount = await getActiveBankAccount();

    return (
        <div className="space-y-4">
            <Link href="/app/invoices" className="text-sm text-cyan-300 hover:underline">
                ← Quay lại danh sách
            </Link>
            <InvoiceCard invoice={invoice} bankAccount={bankAccount} />
        </div>
    );
}
