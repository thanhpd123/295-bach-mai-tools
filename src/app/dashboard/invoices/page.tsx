import type { Metadata } from "next";
import { InvoicesList } from "@/components/admin/invoices-list";

export const metadata: Metadata = { title: "Hoá đơn" };

export default function InvoicesPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Hoá đơn
                </h1>
                <p className="text-sm text-slate-500">
                    Theo dõi và xác nhận thanh toán các hoá đơn hằng tháng.
                </p>
            </div>
            <InvoicesList />
        </div>
    );
}
