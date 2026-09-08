import { TenantPortal } from "@/components/tenant/tenant-portal";

export const dynamic = "force-dynamic";

export default function TenantInvoicesPage() {
    return <TenantPortal initialTab="invoices" />;
}
