import type { Metadata } from "next";
import { TenantPortal } from "@/components/tenant/tenant-portal";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Cá nhân" };

export default function AccountPage() {
    return <TenantPortal initialTab="account" />;
}
