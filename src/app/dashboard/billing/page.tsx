import type { Metadata } from "next";
import { BillingManager } from "@/components/admin/billing-manager";

export const metadata: Metadata = { title: "Kỳ & Chỉ số" };

export default function BillingPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Kỳ thanh toán & chỉ số
                </h1>
                <p className="text-sm text-slate-500">
                    Mở kỳ, nhập số điện/nước từng phòng rồi tạo hoá đơn hàng loạt.
                </p>
            </div>
            <BillingManager />
        </div>
    );
}
