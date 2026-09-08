import { TenantPortal } from "@/components/tenant/tenant-portal";

export const dynamic = "force-dynamic";

export default async function TenantInvoiceDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    // Mở chi tiết trong shell người thuê (dữ liệu chỉ gồm hoá đơn của chính
    // người dùng hiện tại nên không lộ chéo giữa các tài khoản).
    return <TenantPortal initialTab="invoices" initialInvoiceId={id} />;
}
