import type { Metadata } from "next";
import { TenantsManager } from "@/components/admin/tenants-manager";

export const metadata: Metadata = { title: "Người thuê" };

export default function TenantsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Người thuê
                </h1>
                <p className="text-sm text-slate-500">
                    Tạo tài khoản, lưu số điện thoại liên hệ và ghi nhận chuyển vào phòng.
                </p>
            </div>
            <TenantsManager />
        </div>
    );
}
